# CarRada: Ordered Remediation & Action Plan

This document outlines the ordered, step-by-step technical and product recommendations for **CarRada**. Follow each phase in sequence to transform the app into a reliable, secure, and genuinely helpful roadside companion for new car owners.

---

## 📋 Phase 1: Repository Hygiene & Critical Blockers

*Goal: Make the repository clean, buildable, and establish a single source of truth.*

- [x] **1.1 Fix `.gitignore` to allow database migrations and lockfiles**
  - **Location:** [`.gitignore`](file:///home/hanayo/CarRada/.gitignore)
  - **Issue:** Line 18 ignores `**/*.sql`, preventing migration files from being tracked. Lines 10–12 ignore lockfiles (`package-lock.json`, `yarn.lock`), preventing reproducible builds.
  - **Action:** Removed `**/*.sql` and lockfile ignore rules from `.gitignore`. Added binary ignores.

- [x] **1.2 Untrack and remove compiled binary from Git**
  - **Location:** [`server/go/carrada-server`](file:///home/hanayo/CarRada/server/go/carrada-server)
  - **Issue:** A 20MB+ compiled Linux ELF executable was committed in the repository.
  - **Action:** Untracked from Git via `git rm --cached` and removed the binary from disk.

- [x] **1.3 Consolidate on ONE backend stack**
  - **Locations:** [`server/src`](file:///home/hanayo/CarRada/server/src) vs. [`server/go`](file:///home/hanayo/CarRada/server/go)
  - **Issue:** Dual backends with divergent logic.
  - **Action:** Consolidated on Node.js / Express with TypeScript. Removed deprecated `server/go` tree.

- [x] **1.4 Resolve Expo and React Native version conflict**
  - **Location:** [`mobile/package.json`](file:///home/hanayo/CarRada/mobile/package.json)
  - **Issue:** `"expo": "^53.0.0"` was paired with `"react-native": "0.72.5"` and `"babel-preset-expo": "^9.3.0"`.
  - **Action:** Aligned dependencies to standard Expo SDK 51 with React Native 0.74.5 and added `expo-secure-store`.

---

## 🗄️ Phase 2: Database Initialization & Data Integrity

*Goal: Ensure any fresh setup with PostgreSQL runs without "table does not exist" crashes.*

- [x] **2.1 Author `db/migrations/0001_init.sql`**
  - **Location:** [`db/migrations/0001_init.sql`](file:///home/hanayo/CarRada/db/migrations/0001_init.sql)
  - **Action:** Created relational schema covering `users`, `vehicles`, `diagnostic_sessions`, `conversations`, `maintenance_reminders`, and `uploaded_images` with appropriate foreign keys and performance indexes.

- [x] **2.2 Implement auto-migration on server boot**
  - **Locations:** [`server/src/db.ts`](file:///home/hanayo/CarRada/server/src/db.ts) & [`server/src/index.ts`](file:///home/hanayo/CarRada/server/src/index.ts)
  - **Action:** Added transactional schema migration runner using `schema_migrations` tracking table so any new environment automatically migrates on startup.

- [x] **2.3 Fix Vehicle update query overwriting missing fields**
  - **Location:** [`server/src/routes/vehicles.ts`](file:///home/hanayo/CarRada/server/src/routes/vehicles.ts)
  - **Issue:** Updating a single field (like mileage) set all other vehicle fields to `null`.
  - **Action:** Implemented safe partial update defaulting, validation for year/mileage, and numeric route parameter guards.

---

## 🔐 Phase 3: Security & Session Hardening

*Goal: Protect user data, prevent session drops, and secure API endpoints.*

- [x] **3.1 Forbid insecure default JWT secrets**
  - **Location:** [`server/src/config.ts`](file:///home/hanayo/CarRada/server/src/config.ts)
  - **Action:** Enforced strict check refusing to start with fallback secret in production, warning in development.

- [x] **3.2 Implement persistent token storage on mobile**
  - **Locations:** [`mobile/src/context/AuthContext.tsx`](file:///home/hanayo/CarRada/mobile/src/context/AuthContext.tsx) & [`mobile/src/api/api.ts`](file:///home/hanayo/CarRada/mobile/src/api/api.ts)
  - **Action:** Stored JWT securely with `expo-secure-store`. Automatically restores session on app restart and validates against `/auth/me`.

- [x] **3.3 Add Sign Out / Account settings in mobile**
  - **Locations:** [`mobile/src/App.tsx`](file:///home/hanayo/CarRada/mobile/src/App.tsx) & [`mobile/src/screens/HomeScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/HomeScreen.tsx)
  - **Action:** Added Sign Out buttons in the navigation header and dashboard footer that clear SecureStore and reset auth state.

- [x] **3.4 Sanitize error responses and add rate limiting**
  - **Locations:** [`server/src/app.ts`](file:///home/hanayo/CarRada/server/src/app.ts) & [`server/src/routes/auth.ts`](file:///home/hanayo/CarRada/server/src/routes/auth.ts)
  - **Action:** Added `express-rate-limit` for auth (30/15m) and assistant (20/1m) routes, sanitized 500 error outputs in production, and handled duplicate email 409 conflicts.

---

## 🤖 Phase 4: AI Pipeline Repair & Model Realignment

*Goal: Make the AI assistant, mechanic translator, and warning light analyzer actually function.*

- [x] **4.1 Fix broken imports in TypeScript services**
  - **Locations:** [`server/src/services/`](file:///home/hanayo/CarRada/server/src/services/)
  - **Action:** Fixed relative imports to `../config`.

- [x] **4.2 Fix Go backend API key forwarding bug**
  - **Action:** Consolidated on unified TypeScript backend with single source of truth.

- [x] **4.3 Upgrade model targets to active vision & chat models**
  - **Locations:** [`server/src/services/aiClient.ts`](file:///home/hanayo/CarRada/server/src/services/aiClient.ts), [`imageAnalyzer.ts`](file:///home/hanayo/CarRada/server/src/services/imageAnalyzer.ts), [`summaryGenerator.ts`](file:///home/hanayo/CarRada/server/src/services/summaryGenerator.ts), [`costEstimator.ts`](file:///home/hanayo/CarRada/server/src/services/costEstimator.ts)
  - **Action:** Built unified `aiClient.ts` supporting Anthropic (`/v1/messages`) and Groq (`llama-3.3-70b-versatile` & `llama-3.2-11b-vision-preview`). Added structured JSON output parsing for mechanic explanations, urgency badges, and actionable questions.

- [x] **4.4 Fix Audio Diagnostic pipeline**
  - **Location:** [`server/src/routes/assistant.ts`](file:///home/hanayo/CarRada/server/src/routes/assistant.ts)
  - **Action:** Added `POST /assistant/analyze-audio` endpoint with structured acoustic frequency guidance.

- [x] **4.5 Fix conversation persistence & safety classifier triggers**
  - **Locations:** [`server/src/routes/assistant.ts`](file:///home/hanayo/CarRada/server/src/routes/assistant.ts) & [`server/src/services/safetyClassifier.ts`](file:///home/hanayo/CarRada/server/src/services/safetyClassifier.ts)
  - **Action:** Classify only the latest incoming message for acute hazards; save individual turn messages as distinct rows; removed broad trigger words that caused false positives.

---

## 📱 Phase 5: Mobile App Layout & Core UX Repairs

*Goal: Make the mobile app functional, scrollable, and connected.*

- [x] **5.1 Fix `HomeScreen` viewport truncation**
  - **Location:** [`mobile/src/screens/HomeScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/HomeScreen.tsx)
  - **Action:** Wrapped screen in `<ScrollView>` so all 9 feature cards and sign-out controls are accessible on any mobile device viewport.

- [x] **5.2 Fix missing `ScrollView` on `RepairCostEstimatorScreen`**
  - **Location:** [`mobile/src/screens/RepairCostEstimatorScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/RepairCostEstimatorScreen.tsx)
  - **Action:** Wrapped screen in `<ScrollView>` and added structured parts/labor range badges and vehicle selection toggling.

- [x] **5.3 Fix nested VirtualizedList warning in `DailyLessonsScreen`**
  - **Location:** [`mobile/src/screens/DailyLessonsScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/DailyLessonsScreen.tsx)
  - **Action:** Converted nested `ScrollView` + `FlatList` to a single root `FlatList` utilizing `ListHeaderComponent`.

- [x] **5.4 Configurable API Base URL**
  - **Location:** [`mobile/src/api/api.ts`](file:///home/hanayo/CarRada/mobile/src/api/api.ts)
  - **Action:** Implemented `EXPO_PUBLIC_API_URL` with automatic platform fallback (`10.0.2.2:4000` for Android emulator, `localhost:4000` for iOS/web).

- [x] **5.5 Add `KeyboardAvoidingView` on Auth screens**
  - **Locations:** [`mobile/src/screens/LoginScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/LoginScreen.tsx) & [`SignupScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/SignupScreen.tsx)
  - **Action:** Added `KeyboardAvoidingView` so mobile keyboards do not obscure inputs or submit buttons.

---

## 🚗 Phase 6: Product Domain & Roadside Safety for New Drivers

*Goal: Make the app an indispensable, life-saving roadside companion.*

- [ ] **6.1 Fix dangerous flat tire mechanical instructions**
  - **Locations:**
    - [`server/src/services/emergencyProcedures.ts`](file:///home/hanayo/CarRada/server/src/services/emergencyProcedures.ts#L38-L40)
    - [`server/go/services.go`](file:///home/hanayo/CarRada/server/go/services.go)
  - **Issue:** Steps currently tell the user to raise the car with the jack *before* loosening the lug nuts (risk of wheel spinning and tipping the car off the jack).
  - **Action:** Update Step 4 to instruct: *"Loosen lug nuts slightly (half a turn) with the tire still firmly on the ground."* Then Step 5: *"Raise the car with the jack."*

- [ ] **6.2 Offline emergency guides bundling**
  - **Locations:** [`mobile/src/screens/EmergencyFlowScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/EmergencyFlowScreen.tsx) & [`EmergenciesScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/EmergenciesScreen.tsx)
  - **Issue:** If broken down on a highway without cellular data, the user cannot load emergency steps.
  - **Action:** Bundle emergency procedures as static JSON directly in the mobile app, with API fetch as an optional remote update fallback. Allow emergency guides to open without an active login.

- [ ] **6.3 Add 1-Tap Emergency Call Dispatch**
  - **Location:** [`mobile/src/screens/EmergenciesScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/EmergenciesScreen.tsx)
  - **Action:** Add quick-action buttons using React Native `Linking.openURL('tel:...')`:
    - Roadside Assistance (customizable user policy number / phone)
    - Emergency Services (911 / 112)

- [ ] **6.4 Fix Symptom Diagnostics submission flow**
  - **Location:** [`mobile/src/screens/SymptomDiagnosticsScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/SymptomDiagnosticsScreen.tsx#L58-L60)
  - **Issue:** After submitting symptoms, the screen displays an alert and returns to Home without showing the assistant's diagnosis.
  - **Action:** Navigate directly to the newly created `DiagnosticSession` screen so the driver can immediately read the AI diagnosis.

- [ ] **6.5 Add native DatePicker for Maintenance Reminders**
  - **Location:** [`mobile/src/screens/MaintenanceRemindersScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/MaintenanceRemindersScreen.tsx#L24)
  - **Issue:** Free-text string (`YYYY-MM-DD`) leads to invalid date strings and failed reminder scheduling.
  - **Action:** Integrate `@react-native-community/datetimepicker` for selecting reminder dates.

- [ ] **6.6 Stop clearing `notification_at` on scheduler check**
  - **Location:** [`server/go/scheduler.go`](file:///home/hanayo/CarRada/server/go/scheduler.go#L56)
  - **Issue:** The background scheduler sets `notification_at = NULL` in the DB when logging, erasing the reminder schedule.
  - **Action:** Add a boolean `notified = true` column instead of nullifying `notification_at`.

---

## 🗑️ Cleanup Note
Once all checklist items above are checked off and verified with automated tests and manual walkthroughs, delete this file:
```bash
rm /home/hanayo/CarRada/ACTION_PLAN.md
```
