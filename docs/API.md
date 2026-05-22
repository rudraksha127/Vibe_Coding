# InterviewForge API

All API responses use:

```json
{ "success": true, "data": {} }
```

Errors use:

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable" } }
```

Authenticated routes require:

```http
Authorization: Bearer <accessToken>
```

## Health

### GET /health

Auth required: No

Returns process liveness.

### GET /ready

Auth required: No

Returns database readiness.

## Auth

### POST /api/v1/auth/register

Auth required: No

Body:

```json
{
  "email": "user@example.com",
  "password": "strong-password",
  "profile": {
    "name": "Asha Rao",
    "targetRole": "Frontend Engineer",
    "experienceLevel": "fresh_graduate",
    "targetCompanies": ["Google"],
    "preferredLanguage": "en",
    "timezone": "Asia/Calcutta",
    "dressCodePreference": "business_casual"
  }
}
```

Response: user plus access token. Refresh token is set as an HttpOnly cookie.

### POST /api/v1/auth/login

Auth required: No

Body:

```json
{ "email": "user@example.com", "password": "strong-password" }
```

### POST /api/v1/auth/refresh

Auth required: Refresh cookie

Rotates refresh token and returns a new access token.

### POST /api/v1/auth/logout

Auth required: Yes

Revokes the active session and clears the refresh cookie.

### GET /api/v1/auth/sessions

Auth required: Yes

Lists active sessions.

### DELETE /api/v1/auth/sessions/:id

Auth required: Yes

Revokes a session owned by the user.

## Users

### GET /api/v1/users/me

Auth required: Yes

Returns the current user profile.

### PATCH /api/v1/users/me

Auth required: Yes

Updates profile and privacy consent fields.

### GET /api/v1/users/me/export

Auth required: Yes

Exports user, resume, interview, and active-session data.

### DELETE /api/v1/users/me

Auth required: Yes

Body:

```json
{ "confirmationText": "DELETE MY ACCOUNT" }
```

Soft-deletes the user and owned resources.

## Resumes

### POST /api/v1/resumes

Auth required: Yes

Content-Type: `multipart/form-data` or JSON-compatible fields.

Fields:

```json
{
  "title": "Primary resume",
  "extractedText": "Resume text...",
  "targetRole": "Frontend Engineer",
  "isPrimary": true
}
```

Optional file field: `resume` with PDF, DOC, or DOCX.

### GET /api/v1/resumes?page=1&limit=20

Auth required: Yes

Lists resumes.

### GET /api/v1/resumes/:id

Auth required: Yes

Returns one owned resume.

### PATCH /api/v1/resumes/:id

Auth required: Yes

Updates title, extracted text, and primary flag.

### POST /api/v1/resumes/:id/analyze

Auth required: Yes

Re-runs resume parsing and ATS suggestions.

### DELETE /api/v1/resumes/:id

Auth required: Yes

Soft-deletes an owned resume.

## Interviews

### POST /api/v1/interviews

Auth required: Yes

Body:

```json
{
  "resumeId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "targetRole": "Frontend Engineer",
  "targetCompanies": ["Google"],
  "language": "en",
  "level": "L1",
  "mode": "structured",
  "companyPack": "Google"
}
```

### GET /api/v1/interviews?page=1&limit=20&status=in_progress

Auth required: Yes

Lists interview sessions.

### GET /api/v1/interviews/:id

Auth required: Yes

Returns an owned interview session.

### POST /api/v1/interviews/:id/questions

Auth required: Yes

Body:

```json
{ "difficulty": "medium" }
```

Generates a resume-grounded question.

### POST /api/v1/interviews/:id/questions/:questionId/answers

Auth required: Yes

Body:

```json
{
  "answer": "In my project, I used React to reduce page interaction latency by 30%...",
  "inputMode": "text"
}
```

Returns scores, coaching feedback, improvement delta, and next action.

### POST /api/v1/interviews/:id/complete

Auth required: Yes

Builds the final scorecard.

### DELETE /api/v1/interviews/:id

Auth required: Yes

Soft-deletes the session.

