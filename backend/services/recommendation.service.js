import bookModel from "../models/book.model.js";
import userModel from "../models/auth.model.js";
import interactionModel from "../models/interaction.model.js";
import bookKnowledgeModel from "../models/knowledge.model.js";

class RecommendationService {

  async getRecommendations(userId, limit = 10) {
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

    const userInteractions = await interactionModel
      .find({ userId })
      .populate("bookId")
      .sort({ timestamp: -1 });

    return this.combineRecommendations(user, userInteractions, limit);
  }

  async combineRecommendations(user, userInteractions, limit) {
    const interactedBookIds = userInteractions
      .map((i) => i.bookId?._id?.toString())
      .filter(Boolean);

    // ── Strategy weights ──────────────────────────────────────────
    // Preferences-first: for new users preferredGenres/favoriteAuthors
    // drive content-based; collaborative kicks in once interactions exist.
    const weights = {
      preferencesBased: 0.35,
      collaborative:    0.25,
      popularity:       0.25,
      newReleases:      0.15,
    };

    const [preferenceBooks, collaborative, popular, newBooks] = await Promise.all([
      this.getPreferencesBasedRecommendations(user, interactedBookIds, 20),
      this.getCollaborativeRecommendations(user._id, interactedBookIds, 20),
      this.getPopularBooks(interactedBookIds, 15),
      this.getNewReleases(interactedBookIds, 15),
    ]);

    const scoredBooks = new Map();

    const add = (list, weight) =>
      list.forEach((book, i) => {
        const score = weight * (1 - i / Math.max(list.length, 1));
        this.addOrUpdateScore(scoredBooks, book, score);
      });

    add(preferenceBooks, weights.preferencesBased);
    add(collaborative,   weights.collaborative);
    add(popular,         weights.popularity);
    add(newBooks,        weights.newReleases);

    const sorted = Array.from(scoredBooks.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => this.formatBookForRecommendation(entry.book));

    // ── Fallback chain: always return something ───────────────────
    if (sorted.length >= limit) return sorted;

    return this.fillWithFallbacks(sorted, interactedBookIds, limit);
  }

  // ── STRATEGY 1: Preferences-based (works for brand-new users) ──
  // Reads preferredGenres + favoriteAuthors from the user document.
  // Falls back to interaction history if preferences are empty.
  async getPreferencesBasedRecommendations(user, excludeBookIds, limit) {
    let genres  = [...(user.preferredGenres  || [])];
    let authors = [...(user.favoriteAuthors  || [])];

    // Enrich with interaction history if available
    if (genres.length === 0 || authors.length === 0) {
      const interactions = await interactionModel
        .find({ userId: user._id, type: { $in: ["purchase", "rating", "favorite"] } })
        .populate("bookId");

      const genreCount  = {};
      const authorCount = {};

      interactions.forEach(({ bookId }) => {
        if (!bookId) return;
        bookId.genres?.forEach((g) => (genreCount[g]  = (genreCount[g]  || 0) + 1));
        if (bookId.author) authorCount[bookId.author] = (authorCount[bookId.author] || 0) + 1;
      });

      if (genres.length === 0)
        genres = Object.keys(genreCount).sort((a, b) => genreCount[b] - genreCount[a]).slice(0, 5);
      if (authors.length === 0)
        authors = Object.keys(authorCount).sort((a, b) => authorCount[b] - authorCount[a]).slice(0, 3);
    }

    // Still nothing — return empty so fallback chain handles it
    if (genres.length === 0 && authors.length === 0) return [];

    return this.getBooksByPreferences(genres, authors, excludeBookIds, limit);
  }

  // ── STRATEGY 2: Collaborative filtering ────────────────────────
  async getCollaborativeRecommendations(userId, excludeBookIds, limit) {
    const userInteractions = await interactionModel.find({
      userId,
      type: { $in: ["purchase", "rating", "favorite"] },
    });

    if (userInteractions.length === 0) return [];

    const userBookIds = userInteractions.map((i) => i.bookId);

    const similarUserInteractions = await interactionModel
      .find({
        bookId: { $in: userBookIds },
        userId: { $ne: userId },
        type: { $in: ["purchase", "rating", "favorite"] },
      })
      .populate({
        path: "bookId",
        match: { _id: { $nin: excludeBookIds } },
      });

    const bookScores = {};
    similarUserInteractions.forEach((interaction) => {
      if (!interaction.bookId) return;
      const id = interaction.bookId._id.toString();
      if (!bookScores[id]) bookScores[id] = { book: interaction.bookId, score: 0 };
      bookScores[id].score += this.getInteractionWeight(interaction.type, interaction.rating);
    });

    return Object.values(bookScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.book);
  }

  // ── STRATEGY 3: Popular books ───────────────────────────────────
  async getPopularBooks(excludeBookIds = [], limit = 10) {
    return bookModel
      .find({ _id: { $nin: excludeBookIds } })
      .select("_id title author genres image price averageRating totalRatings totalPurchases totalViews hasContent publishedYear totalPages createdAt")
      .sort({ totalPurchases: -1, averageRating: -1, totalViews: -1 })
      .limit(limit)
      .populate("user", "username profileImage");
  }

  // ── STRATEGY 4: New releases ────────────────────────────────────
  async getNewReleases(excludeBookIds = [], limit = 10) {
    const books = await bookModel
      .find({ _id: { $nin: excludeBookIds } })
      .select("_id title author genres image price averageRating totalRatings totalPurchases totalViews hasContent publishedYear createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "username profileImage")
      .lean();

    // Get totalPages for each book from knowledge model
    const bookIds = books.map(b => b._id);
    const knowledgeList = await bookKnowledgeModel
      .find({ bookId: { $in: bookIds } })
      .select("bookId chapters.pages")
      .lean();

    // Build a map of bookId -> totalPages
    const totalPagesMap = {};
    for (const k of knowledgeList) {
      totalPagesMap[k.bookId.toString()] = k.chapters?.reduce(
        (sum, ch) => sum + (ch.pages?.length || 0), 0
      ) || 0;
    }

    // Merge totalPages into each book
    return books.map(book => ({
      ...book,
      totalPages: totalPagesMap[book._id.toString()] || 0
    }));
  }

  // ── FALLBACK CHAIN ──────────────────────────────────────────────
  // Called when scored results don't reach `limit`.
  // Each step progressively relaxes constraints until we have enough.
  async fillWithFallbacks(existing, excludeBookIds, limit) {
    const needed = limit - existing.length;
    if (needed <= 0) return existing;

    const alreadyIncluded = [
      ...excludeBookIds,
      ...existing.map((b) => b.id?.toString()),
    ].filter(Boolean);

    // Step 1: any popular book not already shown
    const popular = await bookModel
      .find({ _id: { $nin: alreadyIncluded } })
      .sort({ totalPurchases: -1, averageRating: -1 })
      .limit(needed)
      .lean();

    const filled = [...existing, ...popular.map(this.formatBookForRecommendation)];
    if (filled.length >= limit) return filled.slice(0, limit);

    // Step 2: literally any book (last resort)
    const stillNeeded = limit - filled.length;
    const allIncluded = [...alreadyIncluded, ...popular.map((b) => b._id.toString())];

    const anyBooks = await bookModel
      .find({ _id: { $nin: allIncluded } })
      .sort({ createdAt: -1 })
      .limit(stillNeeded)
      .lean();

    return [...filled, ...anyBooks.map(this.formatBookForRecommendation)].slice(0, limit);
  }

  // ── HELPERS ─────────────────────────────────────────────────────

  async getBooksByPreferences(preferredGenres, favoriteAuthors, excludeBookIds, limit) {
    const query = { _id: { $nin: excludeBookIds } };

    if (preferredGenres.length > 0 || favoriteAuthors.length > 0) {
      query.$or = [];
      if (preferredGenres.length > 0) query.$or.push({ genres: { $in: preferredGenres } });
      if (favoriteAuthors.length > 0) query.$or.push({ author: { $in: favoriteAuthors } });
    }

    const books = await bookModel.find(query).limit(limit * 3);
    if (books.length === 0) return [];

    const scored = books.map((book) => {
      let score = 0;
      book.genres?.forEach((g) => { if (preferredGenres.includes(g)) score += 1; });
      if (favoriteAuthors.includes(book.author)) score += 3;
      score += (book.averageRating || 0) * 0.5;
      score += Math.min((book.totalPurchases || 0) / 100, 1);
      return { book, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.book);
  }

  async getSimilarBooks(bookId, limit = 5) {
    const book = await bookModel.findById(bookId);
    if (!book) throw new Error("Book not found");

    const similar = await bookModel
      .find({
        _id: { $ne: bookId },
        $or: [{ genres: { $in: book.genres } }, { author: book.author }],
      })
      .limit(limit * 3);

    if (similar.length === 0) {
      // Fallback: just return any books
      return bookModel.find({ _id: { $ne: bookId } }).sort({ averageRating: -1 }).limit(limit);
    }

    return similar
      .map((s) => ({
        book: s,
        score:
          (s.genres?.filter((g) => book.genres?.includes(g)).length || 0) * 3 +
          (s.author === book.author ? 10 : 0) +
          (s.averageRating || 0) * 0.5 +
          Math.min((s.totalPurchases || 0) / 50, 2),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.book);
  }

  async getTrendingBooks(excludeBookIds = [], limit = 10, daysBack = 7) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    const recent = await interactionModel.find({
      timestamp: { $gte: dateThreshold },
      type: { $in: ["purchase", "rating", "view"] },
    });

    const counts = {};
    recent.forEach(({ bookId }) => {
      const id = bookId.toString();
      counts[id] = (counts[id] || 0) + 1;
    });

    const trendingIds = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .filter((id) => !excludeBookIds.includes(id))
      .slice(0, limit);

    if (trendingIds.length === 0) {
      // Fallback: return popular books if no recent interactions
      return this.getPopularBooks(excludeBookIds, limit);
    }

    const books = await bookModel
      .find({ _id: { $in: trendingIds } })
      .populate("user", "username profileImage");

    const ordered = trendingIds
      .map((id) => books.find((b) => b._id.toString() === id))
      .filter(Boolean);

    // Top up if trending didn't fill the limit
    if (ordered.length < limit) {
      const topUp = await this.getPopularBooks(
        [...excludeBookIds, ...trendingIds],
        limit - ordered.length
      );
      return [...ordered, ...topUp];
    }

    return ordered;
  }

  formatBookForRecommendation(book) {
    return {
      id:            book._id,
      title:         book.title,
      author:        book.author,
      genres:        book.genres,
      image:         book.image,
      price:         book.price,
      averageRating: book.averageRating  || 0,
      totalRatings:  book.totalRatings   || 0,
      hasContent:    book.hasContent     || false,
      publishedYear: book.publishedYear,
      totalPages:    book.totalPages     || 0,
    };
  }

  addOrUpdateScore(scoredBooks, book, score) {
    const id = book._id.toString();
    if (scoredBooks.has(id)) {
      scoredBooks.get(id).score += score;
    } else {
      scoredBooks.set(id, { book, score });
    }
  }

  getInteractionWeight(type, rating = null) {
    return { favorite: 5, purchase: 4, rating: rating || 3, cart: 2, view: 1 }[type] || 1;
  }
}

export default new RecommendationService();