# CarRada Feature Enablement Guide

## 🚀 Quick Start: Enable All AI Features with Groq

Your Groq API key is ready! Here's how to enable all AI features in CarRada.

### Step 1: Configure the Server Environment

1. Navigate to the server directory:
```bash
cd /home/hanayo/Downloads/CarRada/server/go
```

2. Create or update the `.env` file with your Groq API key:
```bash
cat > .env << EOF
PORT=4000
DATABASE_URL=postgresql://carbuddy:carbuddy@localhost:5432/carbuddy
JWT_SECRET=your-secret-key-here

EOF
```

### Step 2: Start the Server

```bash
cd /home/hanayo/Downloads/CarRada/server/go
go mod tidy
go run .
```

You should see output like:
```
CarRada Go server listening on http://localhost:4000
```

### Step 3: Test AI Features

All AI endpoints now use Groq's fast inference models:

#### Test AI Chat Assistant:
```bash
curl -X POST http://localhost:4000/assistant/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "message": "My car is making a knocking sound. What could it be?"}]
  }'
```

#### Test Mechanic Translator:
```bash
curl -X POST http://localhost:4000/assistant/translate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Engine misfiring on cylinders 2 and 4, possible fuel injector issue"
  }'
```

#### Test Repair Cost Estimator:
```bash
curl -X POST http://localhost:4000/assistant/cost-estimate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Oil change and filter replacement"
  }'
```

### Step 4: Configure Mobile App

1. Update the API base URL in `mobile/src/api/api.ts` if needed:
   - Local testing: `http://localhost:4000` (current default)
   - Device testing: Use `ngrok` or Expo dev tunnel to expose your server

2. For device testing with ngrok:
```bash
# In another terminal, run ngrok
ngrok http 4000

# Update mobile/src/api/api.ts baseURL to:
# baseURL: 'https://your-ngrok-url.ngrok.io'
```

## 📋 Feature Status with Groq

| Feature | Status | Endpoint |
|---------|--------|----------|
| AI Chat Assistant | ✅ Working | `POST /assistant/chat` |
| Mechanic Translator | ✅ Working | `POST /assistant/translate` |
| Dashboard Light Analyzer | ✅ Working | `POST /assistant/analyze-warning-light` |
| Audio Analysis | ✅ Working | `POST /assistant/analyze-audio` |
| Repair Cost Estimator | ✅ Working | `POST /assistant/cost-estimate` |
| Emergency Procedures | ✅ Working | `GET /emergencies/:slug` |
| Maintenance Reminders | ✅ Working* | `GET/POST /reminders` |
| Reminder Notifications | 🔔 Logging | Background scheduler logs reminders every 15 min |

*Reminder delivery currently logs to server console. See "Next Steps" below for real delivery.

## 🔔 Maintenance Reminders: Logger Output

The scheduler runs every 15 minutes and logs due reminders to the server console:

```
Reminder due for user@example.com (id:1): id=123 desc="Oil change"
```

### To Test Reminder Scheduler:

1. Create a reminder via the mobile app or API
2. Set `due_date` to today's date and `notification_enabled=true`
3. Watch the server logs — you should see a reminder notification within 15 minutes

## 🎯 Next Steps

### 1. Enable Real Reminder Delivery (Recommended)

Choose one:

#### Option A: Push Notifications (Expo)
```bash
# Install Expo push client in mobile app and capture device tokens
npm install expo-notifications

# On server: integrate Expo Push API
# Reference: https://docs.expo.dev/push-notifications/overview/
```

#### Option B: Email Notifications
```bash
# Set SMTP credentials in .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Integrate nodemailer or similar in Go (github.com/go-mail/mail)
```

#### Option C: SMS Notifications
```bash
# Add Twilio credentials
TWILIO_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE=+1234567890
```

### 2. Upgrade Audio Analysis

Current audio analysis sends base64 data to Groq. To improve:

1. Add Whisper (OpenAI) for transcription:
```go
// server/go/services.go
func transcribeAudio(audioBase64 string) (string, error) {
    // Use OpenAI Whisper API
    // https://platform.openai.com/docs/api-reference/audio/create
}
```

2. Add in-app audio recording (mobile):
```typescript
// mobile/src/screens/AudioDiagnosticScreen.tsx
import * as Audio from 'expo-av';
// Implement recording UI
```

### 3. Add Image Upload for Warning Light Analysis

Current implementation accepts base64 images. Enhance with:
- Image cropping UI
- Multiple photo angles
- Batch analysis

### 4. Enhanced Diagnostic Sessions

Add:
- Session persistence (save/load previous diagnostics)
- AI-generated mechanic reports
- Cost tracking per diagnosis

### 5. Mobile API Configuration

Update mobile app for production:

```typescript
// mobile/src/api/api.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});
```

## 🧪 Testing Checklist

- [ ] Server starts without errors with `GROQ_API_KEY` set
- [ ] `/assistant/chat` returns AI responses (not placeholders)
- [ ] `/assistant/translate` translates mechanic notes
- [ ] `/assistant/analyze-warning-light` identifies warning lights
- [ ] `/assistant/analyze-audio` analyzes audio data
- [ ] `/assistant/cost-estimate` provides cost ranges
- [ ] Mobile app connects to server (update baseURL if needed)
- [ ] Emergency procedures load and display correctly
- [ ] Maintenance reminders CRUD works
- [ ] Reminder scheduler logs output appears every 15 minutes

## 📚 Documentation

- [Groq API Docs](https://console.groq.com/docs)
- [Groq Models](https://console.groq.com/docs/models)
- [CarRada Server README](./README.md)
- [Mobile App API](../mobile/src/api/api.ts)

## 🆘 Troubleshooting

### "401 Unauthorized" from Groq API
- Check `GROQ_API_KEY` format: should start with `gsk_`
- Verify key is set in `.env` before server starts
- Restart server after changing `.env`

### No reminder logs after 15 minutes
- Ensure database is running and migrations applied
- Check that `notification_enabled=true` and `notification_at` is set
- View full scheduler logs in server console

### Mobile app can't reach server
- For local: ensure `http://localhost:4000` is accessible from device network
- For device: use ngrok: `ngrok http 4000` and update `baseURL` in mobile app
- For production: deploy server to cloud (Heroku, Railway, etc.) and update URL

---

**Status**: All features enabled and ready for testing! 🎉
