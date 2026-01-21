## 1️⃣ Register User

**POST** `/api/v1/auth/register`

**Headers**

```http
Content-Type: application/json
```

**Body (JSON)**

```json
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "password123",
  "preferredGenres": ["Fantasy", "Technology", "Self-Help"],
  "favoriteAuthors": ["George R. R. Martin", "James Clear"]
}
```

✅ Creates user
✅ Sets `httpOnly` cookie with JWT
✅ Returns token + user data

---

## 2️⃣ Login User

**POST** `/api/v1/auth/log-in`

**Headers**

```http
Content-Type: application/json
```

**Body (JSON)**

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

🔐 Cookie is set automatically
📌 In Postman: **enable “Send cookies automatically”**

---

## 3️⃣ Create a Book

**POST** `/api/v1/books`

**Headers**

```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body (JSON)**

```json
{
  "title": "Atomic Habits",
  "subTitle": "Tiny Changes, Remarkable Results",
  "author": "James Clear",
  "caption": "Build good habits, break bad ones",
  "description": "A practical guide to habit formation and personal growth.",
  "genres": ["Self-Help", "Psychology"],
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", 
  "price": 19.99,
  "isbn": "9780735211292",
  "publishedYear": 2018
}
```

📌 `image` must be:

* Base64 string **OR**
* Remote image URL (Cloudinary supports both)

---

## 4️⃣ View a Book (Recommendation Signal)

**POST** `/api/v1/books/views/:id`

Example:

```
POST /api/v1/books/views/65ab34c9e12f9b001f3e7a11
```

**Headers**

```http
Authorization: Bearer <JWT_TOKEN>
```

**Body**

```json
{}
```

✅ Increments:

* `totalViews`
* interaction log
* auto-updates preferences

---

## 5️⃣ Add or Update a Rating

**POST** `/api/v1/books/rating`

**Headers**

```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Body (JSON)**

```json
{
  "bookId": "65ab34c9e12f9b001f3e7a11",
  "rating": 5,
  "review": "Extremely practical and life-changing book."
}
```

⭐ Automatically:

* Upserts rating
* Recalculates average rating
* Updates recommendation preferences

---

## 🔁 Bonus (Optional but Useful)

### Get Paginated Books

**GET**

```
/api/v1/books?page=1&limit=5
```

### Get Recommendations

**GET**

```
/api/v1/recommendations?limit=10
```

### Get Similar Books

**GET**

```
/api/v1/recommendations/similar/65ab34c9e12f9b001f3e7a11
```

---

## ⚠️ Important Postman Tips (Very Important)

1. **Auth Middleware**

   * Either send:

     * Cookie (preferred for web)
     * OR `Authorization: Bearer <token>`

2. **Cookies**

   * In Postman → Settings → enable cookies
   * Or manually copy token from response

3. **Image Upload**

   * Base64 is easiest for testing
   * Use small images to avoid Cloudinary limits

---
