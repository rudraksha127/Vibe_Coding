# InterviewForge AI

Backend-first full-stack scaffold for the PRD in `prd.md`.

## Apps

- `backend`: Express + TypeScript + MongoDB API
- `frontend`: React + Vite + TypeScript app
- `docs`: API docs and best-practice review

## Local Setup

Install Node.js, then:

```bash
npm run install:all
```

Create environment files:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Start MongoDB locally or use Atlas, then run the apps in two terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Default URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://localhost:4000`
- API docs: `docs/API.md`

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run audit
```

