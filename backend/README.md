# 📚 Book Recommendation API

A **scalable backend API** for user authentication, book management, ratings, interactions, and **personalized book recommendations**.
Built with **Node.js, Express, MongoDB, and Cloudinary**, featuring behavior-driven recommendations and auto-learning user preferences.

---

## 🚀 Features

### 🔐 Authentication & User Management

* User registration & login (JWT + httpOnly cookies)
* Secure logout
* User deletion & soft deletion support
* Password hashing & validation
* Unique email and username enforcement

### 📖 Book Management

* Create, update, delete books (owner-only)
* Cloudinary image upload & cleanup
* Pagination for book listing
* Single book retrieval
* Book metadata: genres, pricing, ISBN, published year

### ⭐ Ratings & Reviews

* Add or update ratings (1–5 stars)
* Optional text reviews
* Automatic average rating recalculation
* Rating deletion support

### 👀 User Interaction Tracking

* Track:

  * Book views
  * Purchases
  * Ratings
* Used to drive recommendation intelligence

### 🧠 Recommendation System

* Personalized recommendations
* Similar book suggestions
* Popular / trending books
* New releases
* Auto-updates user preferences based on behavior

---

## 🛠 Tech Stack

| Layer                 | Technology                   |
| --------------------- | ---------------------------- |
| Runtime               | Node.js                      |
| Framework             | Express.js                   |
| Database              | MongoDB + Mongoose           |
| Auth                  | JWT (httpOnly cookies)       |
| Image Storage         | Cloudinary                   |
| Recommendation Engine | Behavior-based + Aggregation |
| Security              | Middleware-protected routes  |

---

## 📂 Project Structure

```
src/
├── controllers/
│   ├── auth.controller.js
│   └── book.controller.js
├── models/
│   ├── auth.model.js
│   ├── book.model.js
│   ├── rating.model.js
│   └── interaction.model.js
├── services/
│   └── recommendation.service.js
├── middleware/
│   └── auth.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── book.routes.js
│   └── recommendation.routes.js
├── lib/
│   ├── utils.js
│   ├── cloudinary.js
│   └── cron.js
├── config/
│   └── env.js
└── app.js
```

---

## 🔑 Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/db
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
HEALTH_CHECK_URL=xxxxx
```

---

## 📦 Installation & Setup

```bash
# Clone repository
git clone https://github.com/yourusername/book-recommendation-api.git

# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs at:

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

* JWT is generated on login/register
* Token is:

  * Stored as an **httpOnly cookie**
  * Optionally returned in response body (for mobile clients)
* Protected routes require `authMiddleware`

---

## 📡 API Endpoints

### 🔑 Auth Routes

| Method | Endpoint                   | Description   |
| ------ | -------------------------- | ------------- |
| POST   | `/api/v1/auth/register`    | Register user |
| POST   | `/api/v1/auth/log-in`      | Login user    |
| POST   | `/api/v1/auth/log-out/:id` | Logout user   |
| DELETE | `/api/v1/auth/delete/:id`  | Delete user   |

---

### 📖 Book Routes

| Method | Endpoint            | Description               |
| ------ | ------------------- | ------------------------- |
| POST   | `/api/v1/books`     | Create book               |
| GET    | `/api/v1/books`     | Get all books (paginated) |
| GET    | `/api/v1/books/:id` | Get single book           |
| PUT    | `/api/v1/books/:id` | Update book               |
| DELETE | `/api/v1/books/:id` | Delete book               |

---

### 📊 Interaction & Ratings

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| POST   | `/api/v1/books/views/:id`      | Increment views     |
| POST   | `/api/v1/books/purchase/:id`   | Increment purchases |
| POST   | `/api/v1/books/rating`         | Add/update rating   |
| DELETE | `/api/v1/books/rating/:bookId` | Delete rating       |

---

### 🤖 Recommendation Routes

| Method | Endpoint                                  | Description                  |
| ------ | ----------------------------------------- | ---------------------------- |
| GET    | `/api/v1/recommendations`                 | Personalized recommendations |
| GET    | `/api/v1/recommendations/similar/:bookId` | Similar books                |
| GET    | `/api/v1/recommendations/popular`         | Popular books                |
| GET    | `/api/v1/recommendations/new`             | New releases                 |

---

## 🧠 Recommendation Logic Overview

Recommendations are driven by:

* User interaction history
* Genre affinity
* Ratings weight
* Popularity metrics
* Recent activity

Signals include:

* Views
* Purchases
* Ratings (weighted)

Preferences auto-update asynchronously to avoid blocking requests.

---

## 🧪 Testing with Postman

* Use **JSON bodies**
* Enable **cookies**
* Send `Authorization: Bearer <token>` if needed
* Base64 images supported for Cloudinary uploads

---

## 🔒 Security Considerations

* Passwords hashed before storage
* JWT stored in httpOnly cookies
* Ownership checks on book mutations
* Input validation and error handling

---

## 🚧 Future Improvements

* Refresh token rotation
* Role-based access (admin/moderator)
* Collaborative filtering (user-to-user similarity)
* Full-text search
* Recommendation caching
* Rate limiting

---

## 👨‍💻 Author

**Leonard Oseghale**
Backend Engineer | API & Systems Design

---

## 📄 License

This project is licensed under the **MIT License**.

---
