# InterviewForge Backend

Backend-first MVP for InterviewForge AI, built from `prd.md` and the project practices in `instruction.md`.

## Stack

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Zod for environment and request validation
- JWT access tokens plus rotating HttpOnly refresh cookies
- Helmet, CORS allowlist, request size limits, rate limits, and NoSQL sanitization
- Socket.io JWT gate for real-time coaching streams

## Local Setup

1. Install Node.js and npm.
2. From `backend/`, run `npm install`.
3. Copy `.env.example` to `.env` and replace the JWT and encryption placeholders.
4. Start MongoDB locally or set `MONGODB_URI` to MongoDB Atlas.
5. Run `npm run dev`.

## Useful Commands

```bash
npm run dev
npm run typecheck
npm test
npm audit
```

## First API Flow

1. `POST /api/v1/auth/register`
2. `POST /api/v1/resumes`
3. `POST /api/v1/interviews`
4. `POST /api/v1/interviews/:id/questions`
5. `POST /api/v1/interviews/:id/questions/:questionId/answers`
6. `POST /api/v1/interviews/:id/complete`

