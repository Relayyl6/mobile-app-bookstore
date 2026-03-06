# Recommendation Service

`services/recommendation.service.js`

---

## What it does

Takes a user and figures out which books to show them. It runs four independent strategies in parallel, merges their results into a single scored list, and guarantees it always returns something — even for brand-new users with zero history and even if the database is nearly empty.

---

## Exposed routes and their entry points

| Route | Controller | Service method |
|---|---|---|
| `GET /recommendations/personalized` | `getRecommendedBooks` | `getRecommendations()` |
| `GET /recommendations/popular` | `getPopularBooks` | `getPopularBooks()` |
| `GET /recommendations/new` | `getNewBooks` | `getNewReleases()` |
| `GET /:bookId/similar` | `getSimilarBooks` | `getSimilarBooks()` |

`getTrendingBooks` has no route — it is only used internally inside the personalized flow.

---

## Personalized recommendation flow

```
getRecommendations(userId, limit)
        │
        ├─ fetch user document
        ├─ fetch all user interactions (any type, sorted newest first)
        │
        └─► combineRecommendations(user, interactions, limit)
                │
                ├─ build excludeBookIds  (books user already interacted with)
                │
                ├─ run 4 strategies in parallel via Promise.all
                │       ├─ getPreferencesBasedRecommendations()   weight 0.35
                │       ├─ getCollaborativeRecommendations()       weight 0.25
                │       ├─ getPopularBooks()                       weight 0.25
                │       └─ getNewReleases()                        weight 0.15
                │
                ├─ score and merge all results into one Map
                │
                ├─ sort by final score, slice to limit
                │
                └─ if still under limit → fillWithFallbacks()
```

---

## The four strategies

### Strategy 1 — Preferences-based (weight 0.35, highest)

**Purpose:** works from day one for new users.

**How it works:**

1. Reads `preferredGenres` and `favoriteAuthors` directly off the user document. These are set during onboarding or in profile settings.
2. If either field is empty, it looks at the user's `purchase / rating / favorite` interactions and counts which genres and authors appear most — using that as a proxy for preferences.
3. Queries the book collection for anything matching those genres or authors (excluding already-interacted books).
4. Scores each result:
   - +1 per matching genre
   - +3 if the author matches a favourite author
   - +0–0.5 bonus based on average rating
   - +0–1 bonus based on purchase count (capped)
5. Returns the top `limit` books by score.

**Returns empty when:** the user has no preferences set AND no qualifying interactions. The fallback chain handles this.

---

### Strategy 2 — Collaborative filtering (weight 0.25)

**Purpose:** "users like you also liked..."

**How it works:**

1. Finds the current user's `purchase / rating / favorite` interactions to get their book list.
2. Finds other users who interacted with any of those same books.
3. Collects the other books those similar users interacted with (excluding already-interacted books).
4. Scores each candidate book by summing interaction weights from all similar users who touched it:

   | Interaction type | Weight |
   |---|---|
   | favorite | 5 |
   | purchase | 4 |
   | rating | value of rating (default 3) |
   | cart | 2 |
   | view | 1 |

5. Returns the top `limit` by score.

**Returns empty when:** the user has no qualifying interactions yet (new user). Strategies 1, 3, and 4 cover them.

---

### Strategy 3 — Popular books (weight 0.25)

**Purpose:** surface books with broad appeal as a reliable baseline.

**How it works:** queries the book collection sorted by `totalPurchases DESC`, then `averageRating DESC`, then `totalViews DESC`. Excludes books the user has already interacted with. No internal scoring — position in the result set determines contribution to the final merged score.

**Returns empty when:** the database is empty. The fallback chain handles this.

---

### Strategy 4 — New releases (weight 0.15, lowest)

**Purpose:** surface recently added books so the catalogue feels fresh.

**How it works:** queries the book collection sorted by `createdAt DESC`. Excludes already-interacted books.

**Returns empty when:** database is empty. Handled by fallback chain.

---

## Scoring and merging

After all four strategies return their lists, `combineRecommendations` merges them into a single `Map` keyed by book ID. Each book accumulates score contributions from every strategy that included it.

The scoring formula per strategy is:

```
score contribution = weight × (1 - position / listLength)
```

So the first book in a list gets the full weight, the last gets close to zero, and anything in between is proportional. A book that appears in multiple strategies accumulates score from each — meaning a book that is both preference-matched AND popular AND new will rank higher than one that only appears in one list.

The map is then sorted descending by total score and sliced to `limit`.

---

## Fallback chain

Called by `fillWithFallbacks()` when merged results are still fewer than `limit`. This happens when the database is small, the user has interacted with nearly everything, or all strategies returned sparse results.

```
Step 1 — fill with popular books
         any book sorted by totalPurchases / averageRating
         that is not already in the result set

         ↓ still not enough?

Step 2 — fill with any book at all
         sorted by createdAt DESC
         no constraints other than not already shown
```

This guarantees the response is never an empty array as long as there is at least one book in the database.

---

## Similar books — getSimilarBooks

Not part of the personalized flow. Called directly from `GET /:bookId/similar`.

**How it works:**

1. Loads the source book.
2. Queries for other books sharing at least one genre or the same author.
3. Scores each candidate:
   - +3 per overlapping genre
   - +10 if same author (strong signal)
   - +0–0.5 based on average rating
   - +0–2 based on purchase count (capped)
4. Returns top `limit` by score.

**Fallback:** if no genre/author matches exist, returns the highest-rated books in the entire catalogue excluding the source book.

---

## Trending books — getTrendingBooks

Internal method only, no route. Not currently wired into `combineRecommendations` — exists as a utility if you want to add a trending endpoint or fold it into scoring later.

**How it works:**

1. Looks at interactions from the last N days (default 7).
2. Counts interactions per book.
3. Returns books ordered by interaction count, most active first.

**Fallback:** if no recent interactions exist, delegates to `getPopularBooks`. If trending results are fewer than `limit`, tops up with popular books.

---

## Helper methods

| Method | What it does |
|---|---|
| `getBooksByPreferences(genres, authors, exclude, limit)` | Shared query used by Strategy 1. Fetches books matching genres or authors, scores them, returns top results. |
| `formatBookForRecommendation(book)` | Strips a Mongoose document down to the fields the client needs: `id, title, author, genres, image, price, averageRating, totalRatings, hasContent, publishedYear`. |
| `addOrUpdateScore(map, book, score)` | Adds a book to the scoring map or accumulates onto its existing score if already present. |
| `getInteractionWeight(type, rating)` | Returns a numeric weight for an interaction type: `favorite=5, purchase=4, rating=value, cart=2, view=1`. |

---

## User model fields this depends on

| Field | Type | Purpose |
|---|---|---|
| `preferredGenres` | `[String]` | Set during onboarding. Primary driver for Strategy 1 for new users. |
| `favoriteAuthors` | `[String]` | Set during onboarding. Secondary driver for Strategy 1 for new users. |

Both default to `[]`. If both are empty and the user has no interactions, the system still works — Strategies 3 and 4 always produce results, and the fallback chain fills any remaining gaps.