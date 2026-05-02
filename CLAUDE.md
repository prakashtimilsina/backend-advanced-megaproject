# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start development server (auto-reloads, loads .env automatically)
npm run dev

# Format code
npx prettier --write .

# Check formatting
npx prettier --check .
```

There is no test runner configured in this project.

## Environment Setup

Copy `.env.sample` to `.env` and fill in:
- `MONGODB_URI` — MongoDB Atlas connection string (database name `prakashtube` is appended in `src/constants.js`)
- `ACCESS_TOKEN_SECRET` / `ACCESS_TOKEN_EXPIRY` — JWT for short-lived access tokens
- `REFRESH_TOKEN_SECRET` / `REFRESH_TOKEN_EXPIRY` — JWT for long-lived refresh tokens
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — media uploads

## Architecture

This is an Express/MongoDB REST API modeled after a YouTube-like platform (db name: `prakashtube`). It uses ES modules (`"type": "module"` in package.json).

**Request lifecycle:** `src/index.js` → `connectDB()` → `app.listen()` → route handler → controller → model

**Layer responsibilities:**
- `src/app.js` — Express app config (CORS, JSON, cookie-parser, static files, route mounting). Currently only `/api/v1/users` is mounted; other routers are stub files.
- `src/routes/` — Router definitions that wire URLs to controller functions and apply middleware
- `src/controllers/` — Business logic; only `user.controller.js` is implemented. All others (`video`, `comment`, `like`, `tweet`, `playlist`, `dashboard`, `healthcheck`) are empty stubs containing placeholder React JSX — they need to be replaced with actual Express controller implementations.
- `src/models/` — Mongoose schemas. `comment`, `like`, `playlist`, and `tweet` models are empty stub files that need to be implemented.
- `src/middlewares/` — `verifyJWT` (auth) and `upload` (multer disk storage to `./public/temp`)
- `src/utils/` — Shared utilities (see below)

**Subscription model:** Both `subscriber` and `channel` fields reference the `User` model — a user IS their own channel. Aggregation queries join on the `subscriptions` collection to compute subscriber counts and `isSubscribed` status.

## Key Utilities

All controllers must use these utilities consistently:

- **`asyncHandler(fn)`** (`src/utils/asyncHandler.js`) — Wraps a controller in a Promise catch; eliminates try/catch in controllers. Every controller export must be wrapped with this.
- **`ApiError`** (`src/utils/apiErrorHandler.js`) — `throw new ApiError(statusCode, message)` for all error responses. Has `statusCode`, `message`, `errors`, `success: false`.
- **`ApiResponse`** (`src/utils/apiResponse.js`) — `return res.status(code).json(new ApiResponse(statusCode, data, message))` for all success responses. `success` is automatically `true` when `statusCode < 400`.
- **`uploadOnCloudinary(localFilePath)`** (`src/utils/cloudinary.js`) — Uploads a file from `./public/temp` to Cloudinary using `resource_type: "auto"`, then deletes the local temp file (on both success and failure). Returns the Cloudinary response object (use `.url`), or `null` on failure.

## File Upload Pattern

Routes that accept file uploads use `upload.fields([...])` or `upload.single(...)` from `multer.middleware.js` before the controller. Multer stores files temporarily in `./public/temp`. Controllers then call `uploadOnCloudinary(req.file?.path)` or `req.files?.fieldName[0]?.path`.

## Authentication Pattern

`verifyJWT` middleware reads the JWT from `req.cookies.accessToken` or the `Authorization: Bearer <token>` header, verifies it, fetches the user (excluding `password` and `refreshToken`), and attaches the user to `req.user`. Secure routes use this middleware.

Cookies are set with `httpOnly: true, secure: true`. On logout, the `refreshToken` field is `$unset` from the user document (not just cleared from cookies).

## Implementing Stub Controllers/Routes

When implementing the unfinished controllers, follow the pattern in `user.controller.js`:
1. Import `asyncHandler`, `ApiError`, `ApiResponse`, relevant models, and `uploadOnCloudinary` if needed
2. Wrap every exported function with `asyncHandler`
3. Use MongoDB aggregation pipelines (with `mongoose-aggregate-paginate-v2` on Video) for complex queries
4. After implementing a controller, mount its router in `src/app.js` under `/api/v1/<resource>`

## Code Style

Prettier config (`.prettierrc`): double quotes, semicolons, 2-space indent, trailing commas where valid in ES5, bracket spacing.
