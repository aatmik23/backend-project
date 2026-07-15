# Backend Project

A production-style backend for a video-sharing platform (YouTube-style), built with Node.js, Express, and MongoDB. This project focuses on real-world backend patterns — authentication, file uploads, and complex data aggregation — rather than a toy CRUD app.

## Features

- **User Authentication** — JWT-based auth with access & refresh tokens, secure password hashing
- **File Uploads** — Avatar and cover image uploads handled via Multer, stored on Cloudinary
- **Channel Profiles** — Aggregated user/channel data including subscriber counts
- **Watch History** — MongoDB aggregation pipeline with nested `$lookup`s to fetch watch history along with video owner details in a single query
- **Subscriptions** — Users can subscribe/unsubscribe to channels
- **Centralized Error Handling** — Custom `ApiError` and `ApiResponse` classes for consistent API responses
- **Async Handler Wrapper** — Clean controller code without repetitive try/catch blocks

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens), bcrypt
- **File Storage:** Cloudinary
- **File Uploads:** Multer
- **Environment Management:** dotenv

## Project Structure

```
src/
├── controllers/       # Route logic (user.controller.js, etc.)
├── db/                 # Database connection setup
├── middlewares/        # Auth & Multer middlewares
├── models/              # Mongoose schemas (user, video, subscription)
├── routes/              # API route definitions
├── utils/                # ApiError, ApiResponse, asyncHandler, cloudinary helpers
├── app.js               # Express app configuration
├── constant.js          # App-wide constants
└── index.js             # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account (for file uploads)

### Installation

```bash
git clone https://github.com/aatmik23/backend-project.git
cd backend-project
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following:

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run the server

```bash
npm run dev
```

The server will start on `http://localhost:8000` (or your configured `PORT`).

## API Highlights

| Feature | Description |
|---|---|
| `POST /api/v1/users/register` | Register a new user with avatar/cover image upload |
| `POST /api/v1/users/login` | Authenticate user and issue tokens |
| `GET /api/v1/users/channel/:username` | Get aggregated channel profile with subscriber count |
| `GET /api/v1/users/history` | Get user's watch history with populated video & owner details |

## What I Learned

The most challenging part of this project was the **watch history aggregation pipeline** — using nested `$lookup` stages to join `videos` → `watchHistory` and then `users` → video `owner`, while projecting only the necessary fields. It's a good example of how MongoDB aggregation can replace multiple round-trip queries with a single efficient pipeline.

## License

This project is open source and available for learning purposes.
