# 🎬 VideoTube — Backend API

A production-grade **RESTful API** for a video hosting platform, built from scratch with **Node.js**, **Express 5**, and **MongoDB**. Features secure JWT-based authentication, cloud media management via Cloudinary, and a cleanly architected codebase following industry-standard design patterns.

> **Built to demonstrate:** Backend architecture, authentication flows, cloud integrations, and clean code practices.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Dual-token system with short-lived access tokens and long-lived refresh tokens |
| 🗃️ **MongoDB + Mongoose** | Robust data modeling with schema validation, indexing, and aggregate pagination |
| ☁️ **Cloudinary Integration** | Automated media upload pipeline with local temp storage and cloud sync |
| 🛡️ **Password Security** | Bcrypt hashing with salt rounds; passwords never stored in plaintext |
| 🍪 **Secure Cookies** | HTTP-only, secure cookie-based session management |
| 📁 **File Uploads** | Multer middleware handling multi-file uploads (avatar + cover image) |
| 🧱 **Clean Architecture** | MVC pattern with separated concerns — routes, controllers, models, middleware, and utilities |
| ⚡ **Express 5** | Built on the latest Express.js with modern async error handling |

---

## 🏗️ Architecture

```
src/
├── index.js                 # Server entry point & DB connection
├── app.js                   # Express app configuration & middleware
├── contacts.js              # Application-wide constants
│
├── models/                  # Mongoose schemas & data models
│   ├── user.model.js        #   → User schema with auth methods
│   └── video.model.js       #   → Video schema with pagination plugin
│
├── controller/              # Business logic layer
│   └── user.controller.js   #   → Register, Login, Logout handlers
│
├── routes/                  # API route definitions
│   └── user.routes.js       #   → User endpoints with middleware
│
├── middleware/               # Express middleware
│   ├── auth.middleware.js   #   → JWT verification guard
│   └── multer.middleware.js #   → File upload configuration
│
└── utils/                   # Reusable utilities
    ├── ApiError.js          #   → Custom error class with stack traces
    ├── ApiResponse.js       #   → Standardized API response wrapper
    ├── asyncHandler.js      #   → Async/await error boundary
    └── cloudinary.js        #   → Cloud upload service with cleanup
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js v5 |
| **Database** | MongoDB Atlas + Mongoose v9 |
| **Authentication** | JSON Web Tokens (jsonwebtoken) |
| **Password Hashing** | bcrypt |
| **File Upload** | Multer (disk storage strategy) |
| **Cloud Storage** | Cloudinary (auto resource type detection) |
| **Dev Tooling** | Nodemon, Prettier, dotenv |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB Atlas** account (or local MongoDB instance)
- **Cloudinary** account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/mitalipatel2606-star/Backend-1.git
cd Backend-1

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net

CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
```

### Run the Server

```bash
npm run dev
```

The server starts at `http://localhost:8000`

---

## 📡 API Endpoints

### User Routes — `/api/v1/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register a new user | ❌ |
| `POST` | `/login` | Authenticate user & issue tokens | ❌ |
| `POST` | `/logout` | Invalidate session | ✅ |

### Register User — `POST /api/v1/users/register`

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `fullName` | string | ✅ | User's full name |
| `email` | string | ✅ | Unique email address |
| `username` | string | ✅ | Unique username (auto-lowercased) |
| `password` | string | ✅ | Hashed before storage |
| `avatar` | file | ✅ | Profile image (uploaded to Cloudinary) |
| `coverImage` | file | ❌ | Cover photo (uploaded to Cloudinary) |

**Response:** `201 Created`

```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/...",
    "coverImage": "https://res.cloudinary.com/...",
    "watchHistory": [],
    "createdAt": "2026-04-08T...",
    "updatedAt": "2026-04-08T..."
  },
  "message": "User registered successfully",
  "success": true
}
```

### Login User — `POST /api/v1/users/login`

**Request:** `application/json`

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK` — Sets `accessToken` and `refreshToken` as HTTP-only secure cookies.

---

## 🔒 Security Highlights

- **Password Hashing** — All passwords are hashed using `bcrypt` with 10 salt rounds before database storage
- **JWT Dual-Token Strategy** — Short-lived access tokens for API authorization + long-lived refresh tokens for session renewal
- **HTTP-Only Cookies** — Tokens are stored in cookies with `httpOnly` and `secure` flags, preventing XSS attacks
- **Input Validation** — All user inputs are validated and sanitized before processing
- **Sensitive Data Exclusion** — Password and refresh token fields are stripped from all API responses using Mongoose `.select()`
- **File Cleanup** — Temporary uploaded files are automatically deleted after Cloudinary upload (success or failure)

---

## 🧩 Design Patterns & Practices

| Pattern | Implementation |
|---|---|
| **MVC Architecture** | Clean separation of Models, Controllers, and Routes |
| **Centralized Error Handling** | Custom `ApiError` class extending native `Error` with status codes and stack traces |
| **Standardized Responses** | `ApiResponse` wrapper ensures consistent JSON structure across all endpoints |
| **Async Error Boundary** | `asyncHandler` utility wraps all controllers, catching unhandled promise rejections |
| **Middleware Composition** | Layered middleware for CORS, parsing, auth, and file handling |
| **Pre-save Hooks** | Mongoose middleware for automatic password hashing on document save |
| **Aggregate Pagination** | `mongoose-aggregate-paginate-v2` plugin for efficient large dataset querying |

---

## 📊 Data Models

### User Model

```
┌──────────────────────────────────────────────┐
│                    User                       │
├──────────────────────────────────────────────┤
│  username      : String  (unique, indexed)   │
│  email         : String  (unique)            │
│  fullName      : String  (indexed)           │
│  avatar        : String  (Cloudinary URL)    │
│  coverImage    : String  (Cloudinary URL)    │
│  watchHistory  : [ObjectId → Video]          │
│  password      : String  (bcrypt hashed)     │
│  refreshToken  : String                      │
│  createdAt     : Date    (auto)              │
│  updatedAt     : Date    (auto)              │
├──────────────────────────────────────────────┤
│  Methods:                                     │
│  • isPasswordCorrect(password) → Boolean      │
│  • generateAccessToken()       → JWT          │
│  • generateRefreshToken()      → JWT          │
└──────────────────────────────────────────────┘
```

### Video Model

```
┌──────────────────────────────────────────────┐
│                   Video                       │
├──────────────────────────────────────────────┤
│  videoFile   : String   (Cloudinary URL)     │
│  thumbnail   : String   (Cloudinary URL)     │
│  title       : String                        │
│  description : String                        │
│  duration    : Number                        │
│  views       : Number   (default: 0)         │
│  published   : Boolean  (default: true)      │
│  owner       : ObjectId → User               │
│  createdAt   : Date     (auto)               │
│  updatedAt   : Date     (auto)               │
└──────────────────────────────────────────────┘
```

---

## 🛣️ Roadmap

- [ ] Refresh token rotation endpoint
- [ ] Video CRUD operations (upload, update, delete, stream)
- [ ] User profile update & avatar change
- [ ] Watch history tracking
- [ ] Channel subscription system
- [ ] Video likes, comments & replies
- [ ] Search with pagination & filtering
- [ ] Rate limiting & request throttling
- [ ] Comprehensive test suite (Jest + Supertest)
- [ ] API documentation with Swagger/OpenAPI
- [ ] Docker containerization

---

## 📁 Scripts

| Script | Command | Description |
|---|---|---|
| **Dev Server** | `npm run dev` | Start with Nodemon (hot-reload) + dotenv |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/mitalipatel2606-star/Backend-1/issues).

---

## 📄 License

This project is [ISC](https://opensource.org/licenses/ISC) licensed.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/mitalipatel2606-star">Mitali Patel</a>
</p>