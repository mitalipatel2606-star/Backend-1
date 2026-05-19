# 🎬 VideoTube — AI-Powered Backend API

A production-grade **RESTful API** for an AI-powered video hosting platform, built from scratch with **Node.js**, **Express 5**, **MongoDB**, and **Google Gemini AI**. Features AI-driven content moderation, intelligent natural-language search, auto-generated video descriptions, secure JWT-based authentication, cloud media management via Cloudinary, and a cleanly architected codebase following industry-standard design patterns.

> **Built to demonstrate:** AI/ML integration, backend architecture, authentication flows, cloud integrations, and clean code practices.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Content Moderation** | Automated content safety analysis using Google Gemini — flags toxicity, spam, hate speech, and NSFW content in real-time |
| 🔍 **AI Smart Search** | Natural language video search powered by LLM — understands intent, slang, and context (e.g., "find coding tutorials from this week") |
| ✍️ **AI Auto-Describer** | Auto-generates SEO-optimized video descriptions, tags, and categories from just a title |
| 🔐 **JWT Authentication** | Dual-token system with short-lived access tokens and long-lived refresh tokens |
| 🗃️ **MongoDB + Mongoose** | Robust data modeling with schema validation, indexing, and aggregate pagination |
| ☁️ **Cloudinary Integration** | Automated media upload pipeline with local temp storage and cloud sync |
| 🛡️ **Password Security** | Bcrypt hashing with salt rounds; passwords never stored in plaintext |
| 🍪 **Secure Cookies** | HTTP-only, secure cookie-based session management |
| 📁 **File Uploads** | Multer middleware handling multi-file uploads (avatar + cover image) |
| 🧱 **Clean Architecture** | MVC pattern with separated concerns — routes, controllers, models, middleware, services, and utilities |
| ⚡ **Express 5** | Built on the latest Express.js with modern async error handling |

---

## 🤖 AI Features — Powered by Google Gemini

VideoTube integrates **Google's Gemini 2.0 Flash** large language model to provide three AI-powered capabilities:

### 🛡️ Content Moderation Pipeline
```
User Upload → Title + Description → Gemini Analysis → Safety Report
                                         ↓
                              { safe, flags, severity, confidence }
```
- Detects **7 violation categories**: hate speech, violence, spam, NSFW, harassment, misinformation, copyright
- Returns **confidence scores** and **severity levels** (none → critical)
- Designed for pre-publish screening workflows

### 🔍 Intelligent Search Engine
```
"find funny cat videos" → NLP Understanding → Semantic Matching → Ranked Results
                              ↓
              "User wants entertaining cat content"
```
- Understands **natural language queries** — not just keyword matching
- Returns **relevance scores** and **match reasoning** for each result
- Handles slang, vague queries, and contextual search

### ✍️ Content Generation
```
Video Title → Gemini → SEO Description + Tags + Category + Optimized Title
```
- Generates **compelling 2-3 sentence descriptions** optimized for search
- Auto-creates **5-8 relevant tags** for discoverability
- Suggests **category classification** and **SEO-optimized title variants**

---

## 🏗️ Architecture

```
src/
├── index.js                 # Server entry point & DB connection
├── app.js                   # Express app configuration & middleware
├── constants.js             # Application-wide constants
│
├── services/                # External service integrations
│   └── ai.service.js        #   → Google Gemini AI wrapper (moderation, search, generation)
│
├── models/                  # Mongoose schemas & data models
│   ├── user.model.js        #   → User schema with auth methods
│   ├── video.model.js       #   → Video schema with pagination plugin
│   └── subscriptions.model.js # → Subscription relationships
│
├── controller/              # Business logic layer
│   ├── user.controller.js   #   → Register, Login, Logout handlers
│   └── ai.controller.js     #   → AI moderation, search, generation handlers
│
├── routes/                  # API route definitions
│   ├── user.routes.js       #   → User endpoints with middleware
│   └── ai.routes.js         #   → AI-powered endpoints
│
├── middleware/               # Express middleware
│   ├── auth.middleware.js   #   → JWT verification guard
│   ├── multer.middleware.js #   → File upload configuration
│   ├── validate.middleware.js # → Zod schema validation
│   └── error.middleware.js  #   → Centralized error handler
│
├── validation/              # Input validation schemas (Zod)
│   ├── user.validation.js   #   → User endpoint schemas
│   └── ai.validation.js     #   → AI endpoint schemas
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
| **AI / ML** | Google Gemini 2.0 Flash (content moderation, NLP search, content generation) |
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express.js v5 |
| **Database** | MongoDB Atlas + Mongoose v9 |
| **Authentication** | JSON Web Tokens (jsonwebtoken) |
| **Validation** | Zod v4 (schema-based input validation) |
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

GEMINI_API_KEY=your-gemini-api-key
```

> 💡 Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey) — no credit card required.

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
| `POST` | `/register` | Register a new user (multipart form) | ❌ |
| `POST` | `/login` | Authenticate user & issue tokens | ❌ |
| `POST` | `/logout` | Invalidate session & clear cookies | ✅ |
| `POST` | `/refresh-token` | Refresh expired access token | ❌ |
| `POST` | `/change-password` | Update current password | ✅ |
| `GET` | `/current-user` | Get authenticated user's profile | ✅ |
| `PATCH` | `/update-account` | Update name & email | ✅ |
| `PATCH` | `/avatar` | Upload new avatar image | ✅ |
| `PATCH` | `/cover-image` | Upload new cover image | ✅ |
| `GET` | `/c/:username` | Get channel profile with subscriber count | ✅ |
| `GET` | `/history` | Get user's watch history | ✅ |

### AI Routes — `/api/v1/ai`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/moderate` | AI content moderation — scans for toxicity, spam, hate speech | ✅ |
| `POST` | `/search` | AI-powered natural language video search | ✅ |
| `POST` | `/generate-description` | Auto-generate SEO video description, tags & category | ✅ |

### AI Content Moderation — `POST /api/v1/ai/moderate`

**Request:** `application/json`

```json
{
  "title": "How to hack into any website",
  "description": "Learn to break into systems easily"
}
```

**Response:** `200 OK`

```json
{
  "statusCode": 200,
  "data": {
    "moderation": {
      "safe": false,
      "confidence": 0.92,
      "flags": ["Misinformation or dangerous advice"],
      "reason": "Content promotes unauthorized system access which is illegal",
      "severity": "high"
    },
    "metadata": {
      "model": "gemini-2.0-flash",
      "analyzedAt": "2026-05-19T..."
    }
  },
  "message": "Content flagged — severity: high",
  "success": true
}
```

### AI Smart Search — `POST /api/v1/ai/search`

**Request:** `application/json`

```json
{
  "query": "find tutorials about building APIs"
}
```

**Response:** `200 OK` — Returns AI-ranked results with relevance scores and match reasoning.

### AI Auto-Description — `POST /api/v1/ai/generate-description`

**Request:** `application/json`

```json
{
  "title": "Building a REST API with Node.js",
  "hints": "beginner friendly, uses Express"
}
```

**Response:** `200 OK` — Returns generated description, 5-8 tags, category, and SEO title.

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
| **MVC + Service Layer** | Clean separation of Models, Services, Controllers, and Routes |
| **AI Service Abstraction** | Singleton `AIService` class wrapping Gemini with structured JSON output parsing and fallback handling |
| **Centralized Error Handling** | Custom `ApiError` class extending native `Error` with status codes and stack traces |
| **Standardized Responses** | `ApiResponse` wrapper ensures consistent JSON structure across all endpoints |
| **Async Error Boundary** | `asyncHandler` utility wraps all controllers, catching unhandled promise rejections |
| **Middleware Composition** | Layered middleware for CORS, parsing, auth, validation, and file handling |
| **Schema Validation** | Zod-based input validation middleware for type-safe request handling |
| **Pre-save Hooks** | Mongoose middleware for automatic password hashing on document save |
| **Aggregate Pagination** | `mongoose-aggregate-paginate-v2` plugin for efficient large dataset querying |
| **Graceful Degradation** | AI features check availability on startup and return 503 if API key is missing |

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

## 📝 What I Have Learned

Through building this backend API, I have developed a solid understanding of:
- **AI/ML Integration:** Integrating large language models (Google Gemini) into production backend pipelines for content moderation, natural language search, and automated content generation.
- **Prompt Engineering:** Designing structured prompts that produce reliable JSON output from LLMs, with fallback handling for non-deterministic responses.
- **AI Safety & Moderation:** Building automated content moderation systems that classify text across multiple violation categories with confidence scoring.
- **NLP-Powered Search:** Implementing semantic search that goes beyond keyword matching — understanding user intent, context, and natural language queries.
- **Advanced Mongoose:** Schema design, pre-save hooks, instance methods, and complex aggregation pipelines (including `$lookup`, `$match`, `$addFields`, and nested pipelines).
- **Authentication Flows:** Designing a robust dual-token JWT system (access and refresh tokens) with secure `httpOnly` cookie management.
- **File Upload Pipelines:** Managing multi-part form data with `multer` for local temp storage and integrating with `Cloudinary` for cloud hosting.
- **Express.js Architecture:** Building a scalable, MVC + Service Layer structure separating routers, controllers, services, models, and utility classes.
- **Error Handling:** Standardizing responses via custom `ApiError` and `ApiResponse` utilities paired with an async wrapper for clean async/await logic.
- **Input Validation:** Schema-based validation with Zod for type-safe, declarative request validation.

---

## 🛣️ Roadmap & Next Steps

**Technical Enhancements (Upcoming):**
- [ ] Implement robust **Input Validation** (e.g., Zod) replacing manual string checks.
- [ ] Add a comprehensive **Testing Suite** (Jest + Supertest).
- [ ] Centralize application-level Error Handling Middleware.
- [ ] Add rate limiting and security headers (Helmet) to secure endpoints.

**Feature Roadmap:**
- [x] User Registration & Cloudinary Avatars
- [x] JWT Dual-Token Authentication Flow
- [x] Complex Aggregations (`getUserChannelProfile`, `getWatchHistory`)
- [x] AI Content Moderation Pipeline (Google Gemini)
- [x] AI-Powered Natural Language Search
- [x] AI Auto-Description & Tag Generator
- [ ] Video CRUD operations (upload, update, delete, stream)
- [ ] Channel subscription system
- [ ] Video likes, comments & replies
- [ ] AI-powered video recommendation engine
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