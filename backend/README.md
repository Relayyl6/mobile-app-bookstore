# 📚 Book Platform API - Complete Reading & Recommendation System

A **production-ready backend API** for a comprehensive book platform featuring catalog management, PDF content processing, AI-powered reading assistance, personalized recommendations, and user reading progress tracking.

Built with **Node.js, Express, MongoDB, Redis, Gemini AI, and Cloudinary** featuring vector search, behavior-driven recommendations, and spoiler-safe AI chat.

---

## 🚀 Features Overview

### 🔐 Authentication & User Management
- User registration & login (JWT + httpOnly cookies)
- Secure logout with token invalidation
- User profile management
- Password hashing with bcrypt
- Unique email and username enforcement

### 📚 Book Catalog Management
- **Create, update, delete books** (metadata only)
- **Cloudinary image upload** for book covers
- **Pagination & search** with full-text indexing
- **Metadata**: genres, pricing, ISBN, published year, ratings
- **Status management**: draft, published, archived
- **Featured books** with time-limited promotions

### 📄 Content Management (PDF Processing)
- **Upload PDF files** for existing books
- **AI-powered PDF analysis**:
  - Chapter detection and splitting
  - Character extraction and relationships
  - Theme and tone analysis
  - Summary generation per chapter
- **Vector embeddings** for semantic search
- **Page-by-page content** for reading experience
- **Separate content deletion** (keeps metadata)

### 📖 Reading Experience
- **Chapter navigation** with spoiler protection
- **Page-by-page reading** with progress tracking
- **Bookmarks** with notes
- **User notes & highlights** on any page
- **Table of contents** with unlock status
- **Reading progress** (chapter, page, percentage)
- **Reading statistics** (books started, in-progress, completed)

### 🤖 AI Features (Gemini Integration)
- **Book-aware chat**: Ask questions about the book you're reading
  - Context-aware responses using vector search
  - Character information retrieval
  - Spoiler-safe (respects reading progress)
  - Chapter summary access
- **General chat mode**: AI assistant without book context
- **Chat history** with conversation memory
- **AI preferences**: Tone, spoiler limits
- **Cover image description** generation

### ⭐ Ratings & Reviews
- Add or update ratings (1–5 stars)
- Optional text reviews
- Automatic average rating recalculation
- Rating deletion support
- Feeds into recommendation engine

### 👀 User Interaction Tracking
- Track views, purchases, ratings
- Time-based interaction logging
- Feeds recommendation intelligence
- Auto-updates user preferences

### 🧠 Advanced Recommendation System
- **Personalized recommendations** (collaborative + content-based filtering)
- **Similar books** by genre/author
- **Popular/trending books** with time-based filtering
- **New releases**
- **Genre-specific** recommendations
- **Author-specific** book lists
- **Multi-strategy scoring** with weighted algorithms

---

## 🏗️ Architecture

### Clean Separation of Concerns

```
┌─────────────┐
│ Book Model  │ ──► Catalog Metadata (title, author, price)
│ (Catalog)   │ ──► Metrics (ratings, views, purchases)
└─────────────┘ ──► Status (hasContent flag)
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ Knowledge    │  │ UserBookState    │
│ (Content)    │  │ (Progress)       │
├──────────────┤  ├──────────────────┤
│ PDF file     │  │ currentChapter   │
│ Chapters     │  │ bookmarks        │
│ Characters   │  │ notes            │
│ Embeddings   │  │ spoiler limit    │
└──────────────┘  └──────────────────┘
       │                 │
       └────────┬────────┘
                ▼
         ┌─────────────┐
         │ AI Chat     │
         │ (Context)   │
         └─────────────┘
```

### Layer Responsibilities

| Layer | Purpose | Controllers |
|-------|---------|------------|
| **Catalog** | Store/marketplace | `book.controller.js` |
| **Content** | PDF processing & reading | `book.controller.js` |
| **Reading** | Progress tracking | `reading.controller.js` |
| **AI** | Chat & assistance | `chat.controller.js` |
| **Recommendations** | Discovery | Via service layer |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | MongoDB 7.0+ |
| Cache/Pub-Sub | Redis 7.0+ |
| AI | Google Gemini 2.0 Flash |
| Vector Search | MongoDB Atlas Search |
| Image Storage | Cloudinary |
| File Storage | Cloudinary (PDFs) |
| Auth | JWT (httpOnly cookies) |
| PDF Processing | pdf-parse |
| Embeddings | Gemini Embeddings |

---

## 📂 Project Structure

```
src/
├── controllers/
│   ├── auth.controller.js       # Authentication
│   ├── book.controller.js       # Catalog + Content + Interactions + Recommendations
│   ├── chat.controller.js       # AI chat features
│   └── reading.controller.js    # Reading progress & bookmarks
├── models/
│   ├── auth.model.js            # User schema
│   ├── book.model.js            # Book metadata (UPDATED)
│   ├── knowledge.model.js       # PDF content & AI knowledge
│   ├── userBookState.model.js   # Reading progress per user/book
│   ├── userGeneralState.model.js # General chat history
│   ├── rating.model.js          # Book ratings
│   └── interaction.model.js     # User interactions
├── services/
│   └── recommendation.service.js # Recommendation algorithms
├── middleware/
│   ├── auth.js                  # JWT authentication
│   └── errorHandler.js          # Global error handling
├── routes/
│   ├── auth.routes.js           # Auth endpoints
│   ├── book.routes.js           # All book-related endpoints
│   └── recommendation.routes.js # Recommendation endpoints
├── lib/
│   ├── tools.js                 # PDF processing, AI analysis
│   ├── cloudinary.js            # Cloudinary config
│   ├── utils.js                 # Helper functions
│   └── cron.js                  # Scheduled tasks
├── config/
│   ├── database.js              # MongoDB connection
│   ├── redis.js                 # Redis connection
│   └── env.js                   # Environment variables
└── app.js                       # Express app
```

---

## 🔑 Environment Variables

Create a `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bookdb

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Health Check
HEALTH_CHECK_URL=https://your-health-check-endpoint.com
```

---

## 📦 Installation & Setup

```bash
# Clone repository
git clone https://github.com/yourusername/book-platform-api.git
cd book-platform-api

# Install dependencies
npm install

# Setup MongoDB Atlas
# 1. Create cluster at https://cloud.mongodb.com
# 2. Create database user
# 3. Whitelist IP address
# 4. Get connection string

# Setup Redis (via Docker)
docker run -d -p 6379:6379 --name redis redis:latest

# Or install Redis locally
# Mac: brew install redis && brew services start redis
# Linux: sudo apt-get install redis-server

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 📡 API Endpoints

### 🔑 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout/:id` | Logout user |
| DELETE | `/api/v1/auth/delete/:id` | Delete user |

---

### 📚 Book Catalog (Metadata)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/books` | Create book listing |
| GET | `/api/v1/books` | Get all books (paginated) |
| GET | `/api/v1/books/:id` | Get book details |
| PUT | `/api/v1/books/:id` | Update book metadata |
| DELETE | `/api/v1/books/:id` | Delete book completely |

---

### 📄 Content Management (PDF)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/books/:bookId/content` | Upload PDF for book |
| DELETE | `/api/v1/books/:bookId/content` | Delete book content |
| GET | `/api/v1/books/reading/library` | Get readable books |

---

### 📖 Reading Experience

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/books/:bookId/reading/state` | Get reading state |
| PUT | `/api/v1/books/:bookId/reading/progress` | Update progress |
| GET | `/api/v1/books/:bookId/chapters/:chapterNumber` | Get chapter |
| GET | `/api/v1/books/:bookId/chapters/:chapterNumber/pages/:pageNumber` | Get page |
| GET | `/api/v1/books/:bookId/table-of-contents` | Get TOC |
| GET | `/api/v1/books/:bookId/characters` | Get characters |
| POST | `/api/v1/books/:bookId/characters/track-view` | Track character view |
| GET | `/api/v1/books/reading/statistics` | Get reading stats |

---

### 🔖 Bookmarks & Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/books/:bookId/bookmarks` | Add bookmark |
| DELETE | `/api/v1/books/:bookId/bookmarks/:bookmarkId` | Remove bookmark |
| POST | `/api/v1/books/:bookId/notes` | Add note |
| PUT | `/api/v1/books/:bookId/notes/:noteId` | Update note |
| DELETE | `/api/v1/books/:bookId/notes/:noteId` | Delete note |

---

### 🤖 AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/books/ai/describe-image` | Generate cover description |
| POST | `/api/v1/books/ai/chat` | Chat with AI |
| GET | `/api/v1/books/ai/chat/:userId/:bookId?` | Get chat history |
| DELETE | `/api/v1/books/ai/chat/:userId/:bookId?` | Clear chat history |
| PUT | `/api/v1/books/ai/preferences/:userId/:bookId` | Update AI preferences |

---

### 📊 Interactions & Ratings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/books/:id/view` | Track book view |
| POST | `/api/v1/books/:id/purchase` | Track purchase |
| POST | `/api/v1/books/ratings` | Add/update rating |
| DELETE | `/api/v1/books/:bookId/ratings` | Delete rating |

---

### 🎯 Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recommendations/personalized` | Personalized for user |
| GET | `/api/v1/recommendations/similar/:bookId` | Similar books |
| GET | `/api/v1/recommendations/popular` | Popular books |
| GET | `/api/v1/recommendations/new` | New releases |
| GET | `/api/v1/recommendations/trending` | Trending books |
| GET | `/api/v1/recommendations/genre/:genre` | By genre |
| GET | `/api/v1/recommendations/author/:author` | By author |

---

## 🔄 Typical User Flows

### 1️⃣ Publisher Flow (Upload a Book)

```javascript
// 1. Create book metadata
POST /api/v1/books
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genres": ["fiction", "classic"],
  "caption": "A classic American novel",
  "price": 9.99,
  "image": "base64_image_data"
}

// 2. Upload PDF content
POST /api/v1/books/:bookId/content
FormData: { file: gatsby.pdf }

// Backend automatically:
// - Extracts text from PDF
// - Splits into chapters
// - Analyzes with AI (summaries, characters, themes)
// - Generates embeddings for vector search
// - Sets hasContent = true
```

### 2️⃣ Reader Flow (Discover & Read)

```javascript
// 1. Browse catalog
GET /api/v1/books?page=1&limit=10

// 2. Get personalized recommendations
GET /api/v1/recommendations/personalized?limit=10

// 3. View book details
GET /api/v1/books/:id
POST /api/v1/books/:id/view  // Track for recommendations

// 4. Purchase book
POST /api/v1/books/:id/purchase

// 5. Start reading
GET /api/v1/books/:bookId/chapters/1

// 6. Track progress
PUT /api/v1/books/:bookId/reading/progress
{
  "currentChapter": 1,
  "currentPage": 5,
  "progressPercentage": 10
}

// 7. Add bookmark
POST /api/v1/books/:bookId/bookmarks
{
  "chapterNumber": 1,
  "pageNumber": 5,
  "note": "Great plot twist here!"
}

// 8. Chat with AI about the book
POST /api/v1/books/ai/chat
{
  "userId": "user123",
  "bookId": "book456",
  "message": "Who is the main character and what are their motivations?"
}

// 9. Rate the book
POST /api/v1/books/ratings
{
  "bookId": "book456",
  "rating": 5,
  "review": "Absolutely brilliant!"
}
```

---

## 🧠 AI Features Deep Dive

### Book-Aware Chat

```javascript
POST /api/v1/books/ai/chat
{
  "userId": "user123",
  "bookId": "book456",
  "message": "What happens to Gatsby at the end?"
}

// AI will:
// 1. Check user's reading progress (maxSpoilerChapterAllowed)
// 2. If user hasn't reached the end: "I can't reveal that yet! Keep reading 📖"
// 3. If user has read it: Detailed, context-aware answer
// 4. Uses vector search to find relevant chapters/characters
// 5. Provides citations from specific chapters
```

### General Chat (No Book Context)

```javascript
POST /api/v1/books/ai/chat
{
  "userId": "user123",
  "message": "What are some good books about space exploration?"
}

// AI acts as general assistant
// Maintains conversation history
// No spoiler protection needed
```

---

## 🎯 Recommendation Algorithm

### Multi-Strategy Approach

```
Final Score = (Collaborative × 0.4) + 
              (Content-Based × 0.3) + 
              (Popularity × 0.2) + 
              (Recency × 0.1)
```

**Collaborative Filtering:**
- Finds users with similar tastes
- Recommends what they liked
- Weighted by interaction type (purchase > rating > view)

**Content-Based Filtering:**
- Analyzes user's genre/author preferences
- Matches book attributes
- Considers rating quality

**Popularity:**
- Views, purchases, ratings
- Time-weighted (recent activity matters more)

**Recency:**
- Prioritizes new releases
- Keeps recommendations fresh

---

## 🔒 Security Features

- **JWT Authentication** with httpOnly cookies
- **Password hashing** with bcrypt (salt rounds: 10)
- **Ownership verification** for book mutations
- **Input validation** with Zod schemas
- **Rate limiting** (recommended for production)
- **CORS configuration** with allowed origins
- **Error sanitization** (no stack traces in production)
- **Spoiler protection** in AI responses

---

## 🚀 Performance Optimizations

### Database
- **Indexes** on frequently queried fields
- **Text search indexes** for book discovery
- **Vector indexes** for semantic search
- **Compound indexes** for complex queries

### Caching (Redis)
- User session data
- Popular books list
- Frequently accessed chapters

### Pagination
- Cursor-based for messages
- Offset-based for book lists
- Configurable page sizes

---

## 🧪 Testing

```bash
# Run tests
npm test

# Test with Postman
# Import collection from: /docs/postman_collection.json
# Enable cookies in Postman settings
```

---

## 📊 MongoDB Atlas Vector Search Setup

### Required Indexes

```javascript
// 1. Chapter Embedding Index
{
  "name": "chapterEmbeddingIndex",
  "type": "vectorSearch",
  "definition": {
    "fields": [{
      "type": "vector",
      "path": "chapters.embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }]
  }
}

// 2. Character Embedding Index
{
  "name": "characterEmbeddingIndex",
  "type": "vectorSearch",
  "definition": {
    "fields": [{
      "type": "vector",
      "path": "characters.embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }]
  }
}
```

---

## 🚧 Roadmap & Future Improvements

### Phase 1 (Current)
- ✅ Book catalog management
- ✅ PDF upload & processing
- ✅ AI-powered chat
- ✅ Reading progress tracking
- ✅ Recommendations

### Phase 2 (Planned)
- [ ] Real-time reading sessions with friends
- [ ] Book clubs & discussion forums
- [ ] Social features (follow authors, share highlights)
- [ ] Mobile app (React Native)
- [ ] Audiobook support
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] Collaborative filtering v2 (matrix factorization)
- [ ] Author dashboard with analytics
- [ ] Subscription plans
- [ ] Gift books to friends
- [ ] Reading challenges & achievements
- [ ] Advanced search with filters

---

## 👨‍💻 Author

**Leonard Oseghale**  
Backend Engineer | Full-Stack Developer | AI Integration Specialist

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: oseghaleleonard39@gmail.com

---

## ⭐ Acknowledgments

- Google Gemini AI for content analysis
- MongoDB Atlas for vector search
- Cloudinary for media management
- The open-source community

---