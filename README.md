# CarRada

A React Native + Node/Express scaffold for a safety-first AI car companion built for new and non-technical car owners.

## What is included

- `mobile/` — Expo React Native app with dark mode and a simple architecture.
- `server/` — Node/Express backend with PostgreSQL integration, auth, vehicle CRUD, AI assistant, and emergency flows.
- `db/migrations/0001_init.sql` — core schema for users, vehicles, maintenance, diagnostics, conversations, and emergency data.

## Quick start

1. Install root dependencies:
   - `cd /home/hanayo/CarRada`
   - `npm install`
2. Install workspace packages:
   - `cd server && npm install`
   - `cd ../mobile && npm install`
3. Configure backend env:
   - copy `server/.env.example` to `server/.env`
   - set `DATABASE_URL`, `JWT_SECRET`, and optionally `CLAUDE_API_KEY`
4. Run PostgreSQL and database migration.

## Backend

- `server/src/app.ts` — Express app setup
- `server/src/routes` — auth, vehicles, assistant, emergencies
- `server/src/services` — safety classification and AI prompt generation

## Frontend

- `mobile/src/App.tsx` — root navigation
- `mobile/src/screens` — onboarding, vehicles, chat, emergency assistant
- `mobile/src/api/api.ts` — backend wrapper

## MVP implemented

- Vehicle profile CRUD
- AI Car Assistant chat with safety pre-check
- Emergency Assistant menu
- Fully built flows for:
  - Car won't start
  - Overheating
  - Flat tire

## Notes

- This scaffold uses a placeholder Claude integration pattern. Fill `CLAUDE_API_KEY` and configure the concrete Claude endpoint in `server/src/services/conversationManager.ts`.
- Emergency logic is enforced before AI responses via `safetyClassifier`.
