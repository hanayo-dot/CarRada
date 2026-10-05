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

- [ ] **3.1 Forbid insecure default JWT secrets**
  - **Locations:** [`server/src/config.ts`](file:///home/hanayo/CarRada/server/src/config.ts#L7) / [`server/go/config.go`](file:///home/hanayo/CarRada/server/go/config.go#L24)
  - **Action:** If `JWT_SECRET` is unset or equals `'unsafe-default-jwt-secret'`, refuse to start the server in production.

- [ ] **3.2 Implement persistent token storage on mobile**
  - **Location:** [`mobile/src/App.tsx`](file:///home/hanayo/CarRada/mobile/src/App.tsx#L26) and [`mobile/src/api/api.ts`](file:///home/hanayo/CarRada/mobile/src/api/api.ts#L10)
  - **Issue:** JWT is kept only in `useState(null)`. Closing or refreshing the app logs the user out.
  - **Action:** Install `expo-secure-store`. Save the token on login/signup, read it during app startup splash, and attach it to API client requests.

- [ ] **3.3 Add Sign Out / Account settings in mobile**
  - **Location:** [`mobile/src/screens/HomeScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/HomeScreen.tsx)
  - **Action:** Add a profile/logout button in the navigation header or home screen that clears `expo-secure-store` and resets the auth state.

- [ ] **3.4 Sanitize error responses and add rate limiting**
  - **Locations:** Server error handlers and route middleware
  - **Action:**
    - Stop returning raw SQL errors (`err.message` / `err.Error()`) to clients in production.
    - Add `express-rate-limit` on `/auth/login`, `/auth/signup`, and `/assistant/*` routes.
    - Set `express.json({ limit: '15mb' })` to handle dashboard photo uploads without crashing with HTTP 413.

---

## 🤖 Phase 4: AI Pipeline Repair & Model Realignment

*Goal: Make the AI assistant, mechanic translator, and warning light analyzer actually function.*

- [ ] **4.1 Fix broken imports in TypeScript services**
  - **Locations:**
    - [`server/src/services/imageAnalyzer.ts`](file:///home/hanayo/CarRada/server/src/services/imageAnalyzer.ts#L2)
    - [`server/src/services/costEstimator.ts`](file:///home/hanayo/CarRada/server/src/services/costEstimator.ts#L2)
    - [`server/src/services/conversationManager.ts`](file:///home/hanayo/CarRada/server/src/services/conversationManager.ts#L3)
    - [`server/src/services/summaryGenerator.ts`](file:///home/hanayo/CarRada/server/src/services/summaryGenerator.ts#L2)
  - **Action:** Change `import { CLAUDE_API_KEY } from './config'` to `../config`.

- [ ] **4.2 Fix Go backend API key forwarding bug**
  - **Location:** [`server/go/routes.go`](file:///home/hanayo/CarRada/server/go/routes.go#L304-L400)
  - **Issue:** Every AI route passes `appConfig.ClaudeAPIKey` to `callGroqAPI`, ignoring `GROQ_API_KEY` and causing HTTP 401s or fallback placeholders.
  - **Action:** Pass the correct active API key according to the configured provider.

- [ ] **4.3 Upgrade model targets to active vision & chat models**
  - **Issue:** Code references made-up `claude-3.5-mini`, deprecated `v1/complete`, and passes images to text-only `mixtral-8x7b-32768`.
  - **Action:**
    - For text/chat: Use Anthropic `/v1/messages` with `claude-3-5-haiku-latest` or Groq `llama-3.3-70b-versatile`.
    - For warning lights: Use genuine multimodal vision (Claude 3.5 Sonnet or Llama 3.2 11B Vision).
    - For mechanic translation: Parse JSON response to populate `urgency` and `questions` instead of returning hardcoded empty values.

- [ ] **4.4 Fix Audio Diagnostic pipeline**
  - **Locations:** [`server/go/services.go`](file:///home/hanayo/CarRada/server/go/services.go#L255-L264) / mobile audio features
  - **Issue:** Raw base64 audio is injected into an LLM text prompt.
  - **Action:** Send audio to an audio transcription API (Groq Whisper or OpenAI Whisper) first, then feed the transcription into the diagnostic prompt.

- [ ] **4.5 Fix conversation persistence & safety classifier triggers**
  - **Locations:** [`server/src/routes/assistant.ts`](file:///home/hanayo/CarRada/server/src/routes/assistant.ts#L20-L43) & [`safetyClassifier.ts`](file:///home/hanayo/CarRada/server/src/services/safetyClassifier.ts)
  - **Action:**
    - Classify only the latest message for safety, not the concatenated history of all previous messages.
    - Save individual messages (`user` and `assistant`) as distinct rows rather than collapsing all history into one string.
    - Remove overly broad safety trigger words (`"roadside"`, `"shoulder"`, `"tow truck"`).

---

## 📱 Phase 5: Mobile App Layout & Core UX Repairs

*Goal: Make the mobile app functional, scrollable, and connected.*

- [ ] **5.1 Fix `HomeScreen` viewport truncation**
  - **Location:** [`mobile/src/screens/HomeScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/HomeScreen.tsx#L39-L95)
  - **Issue:** 9 large cards are rendered inside an unscrollable `<View>`. Cards 5 to 9 (Emergencies, Mechanic Translator, Diagnostics) are pushed off the screen on standard phones.
  - **Action:** Wrap the entire screen content in `<ScrollView showsVerticalScrollIndicator={false}>`.

- [ ] **5.2 Fix missing `ScrollView` on `RepairCostEstimatorScreen`**
  - **Location:** [`mobile/src/screens/RepairCostEstimatorScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/RepairCostEstimatorScreen.tsx#L53)
  - **Action:** Wrap screen in `<ScrollView>` so vehicle selection and results are scrollable.

- [ ] **5.3 Fix nested VirtualizedList warning in `DailyLessonsScreen`**
  - **Location:** [`mobile/src/screens/DailyLessonsScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/DailyLessonsScreen.tsx#L45-L69)
  - **Action:** Replace outer `ScrollView` + inner `FlatList` with a single `FlatList` containing `ListHeaderComponent`.

- [ ] **5.4 Configurable API Base URL**
  - **Location:** [`mobile/src/api/api.ts`](file:///home/hanayo/CarRada/mobile/src/api/api.ts#L4)
  - **Issue:** Hardcoded `http://localhost:4000` fails on Android emulators and physical phones.
  - **Action:** Use `process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000')`.

- [ ] **5.5 Add `KeyboardAvoidingView` on Auth screens**
  - **Locations:** [`mobile/src/screens/LoginScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/LoginScreen.tsx) & [`SignupScreen.tsx`](file:///home/hanayo/CarRada/mobile/src/screens/SignupScreen.tsx)
  - **Action:** Wrap inputs in `KeyboardAvoidingView` so the virtual keyboard does not block the inputs and submit button.

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
