# Pettava Backend API

REST API for the Pettava Academic Resource Discovery Platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

---

## Project Structure

```
pettava-backend/
├── server.js               ← Entry point
├── .env.example            ← Environment variable template
├── package.json
├── config/
│   └── cloudinary.js       ← Cloudinary + Multer setup
├── middleware/
│   └── auth.js             ← JWT protect + admin middleware
├── models/
│   ├── User.js
│   ├── Resource.js
│   └── Category.js
├── routes/
│   ├── auth.js
│   ├── resources.js
│   ├── users.js
│   └── categories.js
└── scripts/
    └── seed.js             ← Sample data seeder
```

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `CLOUDINARY_*` — from your [Cloudinary dashboard](https://cloudinary.com)

### 3. Seed the Database (optional)
```bash
npm run seed
```

### 4. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

#### Register
```json
POST /api/auth/register
{
  "name": "Rahul Sharma",
  "email": "rahul@college.edu",
  "password": "mypassword",
  "course": "B.Tech CSE"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "rahul@college.edu",
  "password": "mypassword"
}
```
**Response includes JWT token** — include in all protected requests:
```
Authorization: Bearer <token>
```

---

### Resources

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/resources` | List / search resources | ❌ |
| GET | `/api/resources/trending` | Trending resources | ❌ |
| GET | `/api/resources/:id` | Single resource | ❌ |
| POST | `/api/resources` | Upload resource | ✅ |
| PUT | `/api/resources/:id` | Edit resource | ✅ (owner) |
| DELETE | `/api/resources/:id` | Delete resource | ✅ (owner) |
| POST | `/api/resources/:id/save` | Save / unsave | ✅ |
| POST | `/api/resources/:id/download` | Log download | ✅ |
| POST | `/api/resources/:id/rate` | Rate resource | ✅ |

#### Search & Filter Query Params
```
GET /api/resources?search=data structures&type=notes&sort=popular&page=1&limit=12
```

| Param | Options |
|-------|---------|
| `search` | any text |
| `type` | `notes`, `ppt`, `past-paper`, `textbook`, `video`, `other` |
| `category` | category ObjectId |
| `subject` | partial match |
| `year` | e.g. `2024` |
| `sort` | `newest`, `oldest`, `popular`, `downloads`, `rating` |
| `page` | default `1` |
| `limit` | default `12` |

#### Upload Resource (multipart/form-data)
```
POST /api/resources
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: "DSA Notes"
type: "notes"
subject: "Data Structures"
category: <categoryId>
file: <file>           ← OR videoUrl for videos
```

---

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/leaderboard` | Top contributors | ❌ |
| GET | `/api/users/profile` | My profile + uploads | ✅ |
| PUT | `/api/users/profile` | Update profile | ✅ |
| GET | `/api/users/:id` | Public user profile | ❌ |

---

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | All categories | ❌ |
| POST | `/api/categories` | Create category | ✅ Admin |

---

## Connecting to the Frontend

In your `pettava.html` frontend, replace the mock data with real API calls:

```javascript
const API = 'http://localhost:5000/api';

// Search resources
const res = await fetch(`${API}/resources?search=${query}&type=${type}`);
const data = await res.json();

// Login
const res = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await res.json();
localStorage.setItem('token', token);

// Authenticated request
const res = await fetch(`${API}/resources/${id}/save`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

---

## Deployment

### MongoDB: Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
### Files: [Cloudinary](https://cloudinary.com) (free tier — 25GB)
### Hosting: [Railway](https://railway.app) or [Render](https://render.com) (free tier)

```bash
# Set environment variables on your host, then:
npm start
```
