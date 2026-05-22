# Backend Best-Practice Review

## Verdict

The PRD is strong product-wise and backend-first is the right move. The main engineering gap is that the PRD is broader than an MVP and mixes stack choices. This backend scaffold follows the stricter practices from `instruction.md` while implementing only the Phase 1 API surface.

## Alignment With `instruction.md`

- Uses a `backend/src` structure with `config`, `middleware`, `modules`, `models`, `routes`, `services`, `sockets`, `types`, and `utils`.
- Validates environment variables at startup with Zod and keeps real secrets out of source.
- Uses strict TypeScript and a standard success/error response shape.
- Mounts health/readiness outside `/api` and uses `/api/v1` versioning.
- Adds Helmet, explicit CORS allowlist, JSON body size limit, cookie parser, NoSQL sanitization, global rate limits, and stricter auth rate limits.
- Implements access JWT plus rotating refresh tokens in HttpOnly cookies.
- Hashes passwords and refresh tokens with bcrypt.
- Uses ownership checks for user-owned resume and interview resources.
- Adds soft-delete flags for user-owned resources.
- Adds Socket.io JWT authentication for future real-time coaching.
- Includes API documentation and a Postman environment template with no secrets.

## PRD Mismatches To Decide Later

- The PRD recommends PostgreSQL, Redis, S3, and AI vendors. `instruction.md` is MERN/Mongoose-first, so the scaffold uses MongoDB/Mongoose.
- Resume parsing is heuristic for now. Production-grade PDF/DOCX parsing and embeddings should be added after the core API is stable.
- AI generation and scoring are deterministic placeholders so development can continue before provider keys are configured.
- OAuth routes are not implemented yet; email/password auth is the first working auth path.
- Recording storage, webcam processing, and voice/video are intentionally deferred because the PRD places them after Phase 1.

## Backend-First MVP Scope

- Auth and profile
- Resume upload/text ingestion with parser placeholder
- Resume-grounded question generation
- Answer feedback and retry loop
- Interview scorecard and session history
- GDPR-style export and delete endpoints

