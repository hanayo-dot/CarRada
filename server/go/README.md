# CarRada Go Backend

This folder contains a Go implementation of the CarRada backend API.

## Setup

1. Install Go 1.22+.
2. Copy `.env.example` to `.env` and update values.
3. From `server/go`, run:

```bash
cd /home/hanayo/Downloads/CarRada/server/go
go mod tidy
go run .
```

## Environment Variables

- `PORT` - port to expose the server on (default: `4000`)
- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET` - secret for signing JWTs
- `GROQ_API_KEY` - Groq API key for fast AI inference (recommended)
- `CLAUDE_API_KEY` - optional Anthropic API key (legacy fallback)

## API

Endpoints mirror the existing TypeScript backend:

- `POST /auth/signup`
- `POST /auth/login`
- `GET/POST/PUT/DELETE /vehicles`
- `POST /assistant/chat` - AI assistant using Groq
- `POST /assistant/translate` - mechanic note translator
- `POST /assistant/analyze-warning-light` - dashboard light analyzer
- `POST /assistant/analyze-audio` - audio/symptom analysis
- `POST /assistant/cost-estimate` - repair cost estimator
- `GET /conversations/history`
- `GET/POST /diagnostics`
- `GET /emergencies`
- `GET /reminders`
- `GET /lessons`

Authentication is via `Authorization: Bearer <token>`.

## Quick Start: Enable AI Features

1. Get your Groq API key from [console.groq.com](https://console.groq.com).
2. Set `GROQ_API_KEY` in your `.env`:
   ```
   GROQ_API_KEY=gsk_...
   ```
3. Restart the server. All AI features now use Groq's fast models (mixtral-8x7b-32768).

## Key Features

### AI Assistant (Groq-powered)
- Real-time chat for car issues with safety warnings
- Mechanic note translation to plain language
- Dashboard warning light identification from photos
- Repair cost range estimation
- Audio symptom analysis

### Maintenance Reminders
- CRUD for service/insurance/inspection/license reminders
- Background scheduler logs due reminders every 15 minutes
- Integration point: add email/push/SMS delivery

### Emergency Procedures
- 10 DIY guides: battery, overheating, flat tire, lockout, etc.
- Step-by-step with safety warnings

### Daily Lessons
- Rotating maintenance education

## Notes

- Reminder scheduler logs to server console; integrate Expo push/FCM/SMTP for real delivery.
- Audio analysis sends base64 data to Groq; upgrade with Whisper for better transcription if needed.
