package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

const safetyHeader = `You are CarRada, a safety-first assistant for new car owners. Do not give definitive diagnoses. Use plain English. Always mention "likely" or "possible" and recommend a mechanic for confirmation.`

func classifySafetyIssue(text string) SafetyResult {
	normalized := strings.ToLower(text)
	triggers := []string{
		"fire", "smoke", "burning smell", "fuel leak", "gas leak", "severe overheating", "brake failure", "steering failure",
		"airbag", "accident", "injury", "high voltage", "electrical shock", "loss of control", "disabled on highway",
		"roadside", "shoulder", "tow truck", "hazard lights",
	}
	for _, trigger := range triggers {
		if strings.Contains(normalized, trigger) {
			return SafetyResult{Alert: true, Issue: &trigger, Message: "This sounds like a safety-critical situation. Recommend stopping the vehicle, using hazard lights, and calling a professional or emergency service immediately."}
		}
	}

	if matched1 := strings.Contains(normalized, "overheat") || strings.Contains(normalized, "overheating") || strings.Contains(normalized, "engine temperature") || strings.Contains(normalized, "hot engine"); matched1 {
		if strings.Contains(normalized, "smoke") || strings.Contains(normalized, "steam") || strings.Contains(normalized, "steam coming") {
			issue := "overheating and possible smoke"
			return SafetyResult{Alert: true, Issue: &issue, Message: "Possible overheating with visible heat or smoke is safety-critical. Do not continue driving and get to a safe location."}
		}
	}

	return SafetyResult{Alert: false, Issue: nil, Message: ""}
}

func getVehicleByID(ctx context.Context, vehicleID, userID int) (*Vehicle, error) {
	row := pool.QueryRow(ctx, "SELECT * FROM vehicles WHERE id=$1 AND user_id=$2", vehicleID, userID)
	var v Vehicle
	var trim, engine, fuelType, transmission, vin *string
	var mileage *int
	if err := row.Scan(&v.ID, &v.UserID, &v.Name, &v.Make, &v.Model, &v.Year, &trim, &engine, &fuelType, &transmission, &mileage, &vin, &v.CreatedAt, &v.UpdatedAt); err != nil {
		return nil, err
	}
	v.Trim = trim
	v.Engine = engine
	v.FuelType = fuelType
	v.Transmission = transmission
	v.Mileage = mileage
	v.VIN = vin
	return &v, nil
}

func getUserByID(ctx context.Context, userID int) (*User, error) {
	row := pool.QueryRow(ctx, "SELECT id, email, name, created_at, updated_at FROM users WHERE id=$1", userID)
	var u User
	if err := row.Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt); err != nil {
		return nil, err
	}
	return &u, nil
}

func generateAssistantResponse(apiKey string, messages []ConversationMessage, user *User, vehicle *Vehicle) (AssistantResponse, error) {
	promptMessages := strings.Builder{}
	for _, msg := range messages {
		role := "User"
		if msg.Role != "user" {
			role = "Assistant"
		}
		promptMessages.WriteString(fmt.Sprintf("%s: %s\n\n", role, msg.Message))
	}

	vehicleInfo := "Vehicle: no specific vehicle selected."
	if vehicle != nil {
		vehicleInfo = fmt.Sprintf("Vehicle: %d %s %s%s. Engine: %s. Fuel: %s. Transmission: %s. Mileage: %v.",
			vehicle.Year, vehicle.Make, vehicle.Model, emptyIfNil(vehicle.Trim), emptyIfNil(vehicle.Engine), emptyIfNil(vehicle.FuelType), emptyIfNil(vehicle.Transmission), optionalInt(vehicle.Mileage))
	}

	prompt := strings.Join([]string{
		safetyHeader,
		"User context: keep language simple and avoid tech jargon.",
		vehicleInfo,
		"If a warning light or symptom is described, ask clarifying questions and rank possible causes. For sounds, ask where it comes from, when it happens, and what it sounds like. Provide urgency as one of: 🔴 stop driving / 🟠 get checked soon / 🟡 monitor / 🟢 minor.",
		"Always include a short copyable mechanic summary at the end.",
		"",
		promptMessages.String(),
		"Assistant:",
	}, "\n")

	if apiKey == "" {
		return AssistantResponse{
			Text:    "AI API key not configured. This is a placeholder response for the AI Car Assistant. Please set GROQ_API_KEY (or CLAUDE_API_KEY) in server/.env to activate the real assistant.",
			Summary: "Placeholder response generated because no AI API key is configured.",
		}, nil
	}

	payload := map[string]any{
		"model": "mixtral-8x7b-32768",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"temperature": 0.4,
		"max_tokens":  450,
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := callGroqAPI(apiKey, "https://api.groq.com/openai/v1/chat/completions", payload, &response); err != nil {
		return AssistantResponse{}, err
	}

	text := ""
	if len(response.Choices) > 0 {
		text = strings.TrimSpace(response.Choices[0].Message.Content)
	}
	return AssistantResponse{Text: text, Summary: summaryFromText(text)}, nil
}

func generateMechanicSummary(apiKey, text string) (any, error) {
	if apiKey == "" {
		return map[string]any{
			"explanation": "AI API key is not configured. This is a placeholder mechanic summary.",
			"urgency":     "unknown",
			"questions":   []string{"Set GROQ_API_KEY (or CLAUDE_API_KEY) in server/.env to enable this feature."},
		}, nil
	}

	prompt := fmt.Sprintf(`You are CarRada, a plain-language mechanic translator for new car owners. When given a mechanic note, explain it in simple terms, list likely reasons, assign urgency as one of: 🔴 stop driving / 🟠 get checked soon / 🟡 monitor / 🟢 minor, and provide 2 questions to ask the mechanic. Do not state a diagnosis as certain. Always say a mechanic should confirm.

Mechanic note:
%s

Response:`, text)

	payload := map[string]any{
		"model": "mixtral-8x7b-32768",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"temperature": 0.3,
		"max_tokens":  320,
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := callGroqAPI(apiKey, "https://api.groq.com/openai/v1/chat/completions", payload, &response); err != nil {
		return nil, err
	}

	content := ""
	if len(response.Choices) > 0 {
		content = strings.TrimSpace(response.Choices[0].Message.Content)
	}

	return map[string]any{
		"explanation": content,
		"urgency":     "unknown",
		"questions":   []string{},
	}, nil
}

func analyzeWarningLightImage(apiKey, imageBase64, mimeType string) (WarningLightAnalysis, error) {
	if apiKey == "" {
		return WarningLightAnalysis{
			Identified:     []string{},
			Confidence:     "Unable to analyze",
			Meaning:        "AI API key is not configured on the server.",
			Urgency:        "N/A",
			Recommendation: "Please set GROQ_API_KEY (or CLAUDE_API_KEY) in server/.env",
			Uncertainty:    "No API key available",
		}, nil
	}

	prompt := `You are CarRada, a car assistant. A user has sent you a photo of their car's dashboard warning lights. Your job is to:
1. Identify any visible warning lights or indicators
2. Explain what each light means in plain English
3. Provide urgency guidance (🔴 stop immediately, 🟠 see mechanic soon, 🟡 monitor, 🟢 minor)
4. Give a safe next action

If you cannot clearly see any warning lights, say so and ask for a clearer photo.

Respond with JSON in this exact format:
{
  "identified": ["light name 1", "light name 2"],
  "confidence": "high/medium/low",
  "meaning": "Plain English explanation of what each light means",
  "urgency": "🔴/🟠/🟡/🟢 with brief explanation",
  "recommendation": "What the owner should do next",
  "uncertainty": "Any uncertainty or quality issues with the photo"
}`

	payload := map[string]any{
		"model": "mixtral-8x7b-32768",
		"messages": []map[string]any{
			{
				"role": "user",
				"content": []map[string]any{
					{
						"type": "image_url",
						"image_url": map[string]string{
							"url": fmt.Sprintf("data:%s;base64,%s", mimeType, imageBase64),
						},
					},
					{
						"type": "text",
						"text": prompt,
					},
				},
			},
		},
	}

	var apiResponse struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := callGroqAPI(apiKey, "https://api.groq.com/openai/v1/chat/completions", payload, &apiResponse); err != nil {
		return WarningLightAnalysis{}, err
	}

	text := ""
	if len(apiResponse.Choices) > 0 {
		text = apiResponse.Choices[0].Message.Content
	}

	identified, confidence, meaning, urgency, recommendation, uncertainty := parseWarningLightResponse(text)
	return WarningLightAnalysis{Identified: identified, Confidence: confidence, Meaning: meaning, Urgency: urgency, Recommendation: recommendation, Uncertainty: uncertainty}, nil
}

func analyzeAudio(apiKey, audioBase64, mimeType string) (map[string]any, error) {
	if apiKey == "" {
		return map[string]any{
			"transcript": "AI key not configured; audio analysis unavailable.",
			"notes":      "Set GROQ_API_KEY (or CLAUDE_API_KEY) in server/.env to enable audio analysis.",
		}, nil
	}

	prompt := `You are CarRada, a car sound diagnostic assistant. A user has sent you an audio file. Analyze the audio content (transcribed or described) and help diagnose what car issue might be present. Provide: (1) what sound was heard, (2) likely causes, (3) urgency level, (4) recommended next steps.`

	payload := map[string]any{
		"model": "mixtral-8x7b-32768",
		"messages": []map[string]any{
			{
				"role": "user",
				"content": []map[string]any{
					{
						"type": "text",
						"text": fmt.Sprintf("Audio data (base64, %s):\n%s\n\n%s", mimeType, audioBase64, prompt),
					},
				},
			},
		},
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := callGroqAPI(apiKey, "https://api.groq.com/openai/v1/chat/completions", payload, &response); err != nil {
		return nil, err
	}

	content := ""
	if len(response.Choices) > 0 {
		content = strings.TrimSpace(response.Choices[0].Message.Content)
	}

	return map[string]any{"transcript": content, "notes": "Audio analysis complete via Groq"}, nil
}

func generateRepairCostEstimate(apiKey, description string, vehicle *Vehicle) (map[string]any, error) {
	vehicleInfo := "Vehicle information not provided."
	if vehicle != nil {
		vehicleInfo = fmt.Sprintf("Vehicle: %d %s %s%s. Mileage: %v.", vehicle.Year, vehicle.Make, vehicle.Model, emptyIfNil(vehicle.Trim), optionalInt(vehicle.Mileage))
	}

	if apiKey == "" {
		return map[string]any{
			"estimate":    "N/A",
			"explanation": "AI API key is not configured. Set GROQ_API_KEY (or CLAUDE_API_KEY) in server/.env to get a live cost estimate.",
			"detail":      fmt.Sprintf("%s Problem: %s", vehicleInfo, description),
		}, nil
	}

	prompt := fmt.Sprintf(`You are CarRada, a safety-first car assistant. Based on the repair request below, provide a likely cost range and practical next steps.

%s

Problem: %s

Instructions:
- Use US dollars as the currency unless the user indicates otherwise.
- Give a short realistic cost range and a brief explanation of what affects the price.
- Mention whether the repair is likely simple, moderate, or complex.
- Recommend the next step for a new car owner.`, vehicleInfo, description)

	payload := map[string]any{
		"model": "mixtral-8x7b-32768",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"temperature": 0.3,
		"max_tokens":  300,
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := callGroqAPI(apiKey, "https://api.groq.com/openai/v1/chat/completions", payload, &response); err != nil {
		return nil, err
	}

	text := ""
	if len(response.Choices) > 0 {
		text = strings.TrimSpace(response.Choices[0].Message.Content)
	}
	return map[string]any{"estimate": firstLine(text), "explanation": text, "detail": text}, nil
}

func createDiagnosticSession(ctx context.Context, userID int, vehicleID *int, sessionName string) (*DiagnosticSession, error) {
	var session DiagnosticSession
	row := pool.QueryRow(ctx, "INSERT INTO diagnostic_sessions (user_id, vehicle_id, session_name) VALUES ($1, $2, $3) RETURNING id, session_name, status, vehicle_id, created_at, updated_at", userID, vehicleID, sessionName)
	if err := row.Scan(&session.ID, &session.SessionName, &session.Status, &session.VehicleID, &session.CreatedAt, &session.UpdatedAt); err != nil {
		return nil, err
	}
	return &session, nil
}

func listDiagnosticSessions(ctx context.Context, userID int) ([]DiagnosticSession, error) {
	rows, err := pool.Query(ctx, `SELECT ds.id, ds.session_name, ds.status, ds.created_at, ds.updated_at, v.make, v.model, v.year
		FROM diagnostic_sessions ds
		LEFT JOIN vehicles v ON ds.vehicle_id = v.id
		WHERE ds.user_id = $1
		ORDER BY ds.updated_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	sessions := []DiagnosticSession{}
	for rows.Next() {
		var s DiagnosticSession
		if err := rows.Scan(&s.ID, &s.SessionName, &s.Status, &s.CreatedAt, &s.UpdatedAt, &s.Make, &s.Model, &s.Year); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, nil
}

func getDiagnosticSession(ctx context.Context, userID, sessionID int) (*DiagnosticSession, error) {
	row := pool.QueryRow(ctx, "SELECT * FROM diagnostic_sessions WHERE id=$1 AND user_id=$2", sessionID, userID)
	var s DiagnosticSession
	if err := row.Scan(&s.ID, &s.SessionName, &s.Status, &s.VehicleID, &s.CreatedAt, &s.UpdatedAt); err != nil {
		return nil, err
	}
	return &s, nil
}

func getSessionMessages(ctx context.Context, userID, sessionID int) ([]MessageRecord, error) {
	rows, err := pool.Query(ctx, "SELECT role, message, created_at FROM conversations WHERE user_id=$1 AND diagnostic_session_id=$2 ORDER BY created_at ASC", userID, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messages := []MessageRecord{}
	for rows.Next() {
		var m MessageRecord
		if err := rows.Scan(&m.Role, &m.Message, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	return messages, nil
}

func generateDiagnosticSummary(apiKey string, userID, sessionID int) (DiagnosticSummary, error) {
	session, err := getDiagnosticSession(context.Background(), userID, sessionID)
	if err != nil {
		return DiagnosticSummary{}, err
	}

	messages, err := getSessionMessages(context.Background(), userID, sessionID)
	if err != nil {
		return DiagnosticSummary{}, err
	}

	vehicleInfo := "Unknown vehicle"
	if session.VehicleID != nil {
		vehicle, err := getVehicleByID(context.Background(), *session.VehicleID, userID)
		if err == nil {
			vehicleInfo = fmt.Sprintf("%d %s %s", vehicle.Year, vehicle.Make, vehicle.Model)
		}
	}

	conversationText := strings.Builder{}
	for _, m := range messages {
		role := "Assistant"
		if m.Role == "user" {
			role = "Owner"
		}
		conversationText.WriteString(fmt.Sprintf("%s: %s\n", role, m.Message))
	}

	prompt := fmt.Sprintf(`You are CarRada, a safety-first car assistant. Based on the following diagnostic session for %s, create a concise mechanic summary that the owner can copy and share.

Guidelines:
- Use plain English.
- Do not claim certainty.
- Include what the owner observed, likely causes, urgency, and next step recommendations.
- Keep it short and shareable.

Diagnostic session:
%s

Mechanic summary:`, vehicleInfo, conversationText.String())

	if apiKey == "" {
		return DiagnosticSummary{Summary: "AI API key not configured. Set GROQ_API_KEY (or CLAUDE_API_KEY) in server/.env to generate summaries."}, nil
	}

	payload := map[string]any{
		"model": "mixtral-8x7b-32768",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"temperature": 0.3,
		"max_tokens":  300,
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := callGroqAPI(apiKey, "https://api.groq.com/openai/v1/chat/completions", payload, &response); err != nil {
		return DiagnosticSummary{}, err
	}

	summaryText := ""
	if len(response.Choices) > 0 {
		summaryText = strings.TrimSpace(response.Choices[0].Message.Content)
	}

	return DiagnosticSummary{Summary: summaryText}, nil
}

func getEmergencyList() []map[string]any {
	procedures := []map[string]any{
		{
			"slug": "wont-start",
			"title": "Car won't start",
			"summary": "A simple checklist to help safely narrow down why the car is not starting.",
			"safety_tips": "If you smell fuel, see smoke, or hear unusual grinding, do not attempt to crank repeatedly. Stay clear of moving traffic.",
		},
		{
			"slug": "overheating",
			"title": "Engine overheating",
			"summary": "Respond safely if your engine temperature climbs into the danger zone.",
			"safety_tips": "Do not open the radiator cap when the engine is hot. Steam and boiling coolant can cause serious burns. Pull over to a safe location immediately.",
		},
		{
			"slug": "flat-tire",
			"title": "Flat tire",
			"summary": "Steps to safely change a tire or get help if you cannot do it yourself.",
			"safety_tips": "Do not attempt to change a tire on a busy highway. Pull to a safe, flat area away from traffic. Use hazard lights and stay alert.",
		},
		{
			"slug": "dead-battery",
			"title": "Dead battery (jump-start)",
			"summary": "Safely jump-start your car if the battery is dead but the engine is not damaged.",
			"safety_tips": "Ensure both vehicles are off before connecting jumper cables. Remove metal jewelry and ensure no fluids or battery terminals are exposed. Never allow the positive and negative clamps to touch.",
		},
		{
			"slug": "locked-out",
			"title": "Locked out of car",
			"summary": "Options if you are locked out and cannot access your vehicle.",
			"safety_tips": "Do not attempt to break in or damage your vehicle. Stay calm and in a safe, well-lit area if possible.",
		},
		{
			"slug": "smoke-burning-smell",
			"title": "Smoke or burning smell",
			"summary": "Respond immediately if you see smoke or smell burning. This is a safety issue.",
			"safety_tips": "Do not ignore smoke or burning smells. Pull over immediately to a safe location. If there is visible fire or heavy smoke, evacuate and call emergency services.",
		},
		{
			"slug": "fluid-leak",
			"title": "Fluid leak under car",
			"summary": "Identify what fluid is leaking and decide whether it is safe to drive.",
			"safety_tips": "Some leaks are minor and others are critical. When in doubt, do not drive and seek professional help.",
		},
		{
			"slug": "minor-accident",
			"title": "Minor accident or light collision",
			"summary": "Steps to take after a minor accident to protect yourself and document the incident.",
			"safety_tips": "Always put on your hazard lights and ensure everyone is safe. Do not leave the scene. Be polite but cautious with the other driver.",
		},
		{
			"slug": "check-engine-light",
			"title": "Check engine light on",
			"summary": "The check engine light can indicate many issues, from simple to serious.",
			"safety_tips": "A flashing check engine light means serious engine trouble. Stop driving and get a tow. A steady light is less urgent but still needs attention.",
		},
		{
			"slug": "brake-warning-light",
			"title": "Brake warning light or brake failure",
			"summary": "The brake warning light needs prompt attention. Brake issues are safety-critical.",
			"safety_tips": "If you lose brake pressure or the pedal feels spongy, stop driving immediately. Do not ignore brake warning lights.",
		},
	}
	return procedures
}

func getEmergencyProcedure(slug string) *EmergencyProcedure {
	for _, procedure := range emergenciesProcedures() {
		if procedure.Slug == slug {
			return &procedure
		}
	}
	return nil
}

func emergenciesProcedures() []EmergencyProcedure {
	return []EmergencyProcedure{
		{
			Slug: "wont-start",
			Title: "Car won't start",
			Summary: "A simple checklist to help safely narrow down why the car is not starting.",
			SafetyTips: "If you smell fuel, see smoke, or hear unusual grinding, do not attempt to crank repeatedly. Stay clear of moving traffic.",
			Steps: []Step{
				{Title: "Check power", Description: "Verify the dashboard lights and headlights come on when the key is turned or the start button is pressed."},
				{Title: "Try a restart", Description: "If the dash is dead, try another key or hold the brake and start button again. If the car still does not respond, the battery may be low."},
				{Title: "Inspect battery terminals", Description: "Look for corrosion or loose clamps. If safe, clean and tighten them before trying again."},
				{Title: "Call for help", Description: "If the battery is visibly dead or the starter makes a clicking sound, call roadside assistance or a tow truck."},
			},
		},
		{
			Slug: "overheating",
			Title: "Engine overheating",
			Summary: "Respond safely if your engine temperature climbs into the danger zone.",
			SafetyTips: "Do not open the radiator cap when the engine is hot. Steam and boiling coolant can cause serious burns. Pull over to a safe location immediately.",
			Steps: []Step{
				{Title: "Turn off the AC and turn on heat", Description: "This pulls heat away from the engine and directs it to the cabin. Open windows if needed for ventilation."},
				{Title: "Reduce speed and find a safe spot", Description: "Pull over to the side of the road or to a parking area, away from traffic."},
				{Title: "Turn off the engine and wait", Description: "Let the engine cool for at least 15–20 minutes. Do not attempt to restart until it is cool."},
				{Title: "Check coolant level (when cool)", Description: "Once the engine is cool, carefully open the radiator cap (wrap a cloth around it). Look at the coolant level in the reservoir."},
				{Title: "Add coolant if needed", Description: "If the level is low, pour a 50/50 coolant/water mixture slowly into the reservoir. Do not fill beyond the max line."},
				{Title: "Restart and monitor", Description: "Start the engine gently and watch the temperature gauge. If it climbs again, stop and call for a tow."},
			},
		},
		{
			Slug: "flat-tire",
			Title: "Flat tire",
			Summary: "Steps to safely change a tire or get help if you cannot do it yourself.",
			SafetyTips: "Do not attempt to change a tire on a busy highway. Pull to a safe, flat area away from traffic. Use hazard lights and stay alert.",
			Steps: []Step{
				{Title: "Move to safety", Description: "If possible, drive slowly to a flat, well-lit area away from traffic. Turn on hazard lights."},
				{Title: "Gather tools", Description: "Locate your spare tire, jack, lug wrench, and tire iron. These are usually in the trunk or under the rear seat."},
				{Title: "Loosen lug nuts", Description: "Before lifting the car, slightly loosen (but do not remove) each lug nut with the wrench."},
				{Title: "Lift the car", Description: "Position the jack under the frame near the flat tire. Raise the car until the tire is about six inches off the ground."},
				{Title: "Remove the flat tire", Description: "Remove all lug nuts and set them aside. Pull the tire straight toward you to remove it."},
				{Title: "Install the spare", Description: "Mount the spare tire and hand-tighten the lug nuts. Lower the car slowly."},
				{Title: "Tighten and secure", Description: "Once the car is on the ground, tighten the lug nuts in a star pattern. Drive slowly to a tire shop to repair or replace the flat."},
			},
		},
		{
			Slug: "dead-battery",
			Title: "Dead battery (jump-start)",
			Summary: "Safely jump-start your car if the battery is dead but the engine is not damaged.",
			SafetyTips: "Ensure both vehicles are off before connecting jumper cables. Remove metal jewelry and ensure no fluids or battery terminals are exposed. Never allow the positive and negative clamps to touch.",
			Steps: []Step{
				{Title: "Position the helper vehicle", Description: "Park another car near yours, close enough that jumper cables can reach both batteries, but not touching."},
				{Title: "Connect the positive cable", Description: "Attach the red clamp to the positive terminal (+) of your dead battery, then attach the other red clamp to the positive terminal of the helper battery."},
				{Title: "Connect the negative cable", Description: "Attach the black clamp to the negative terminal (−) of the helper battery. Then attach the other black clamp to an unpainted metal surface on your engine (not the battery)."},
				{Title: "Start the helper vehicle", Description: "Let the helper car run for 2–3 minutes to charge your battery."},
				{Title: "Start your car", Description: "Try to start your car. If it does not start after 30 seconds, wait another minute and try again."},
				{Title: "Remove cables carefully", Description: "Once your car starts, remove the black clamp from your engine, then from the helper battery. Remove the red clamps next."},
				{Title: "Let your car run", Description: "Keep your car running for at least 20 minutes to recharge the battery. Have the battery tested soon."},
			},
		},
		{
			Slug: "locked-out",
			Title: "Locked out of car",
			Summary: "Options if you are locked out and cannot access your vehicle.",
			SafetyTips: "Do not attempt to break in or damage your vehicle. Stay calm and in a safe, well-lit area if possible.",
			Steps: []Step{
				{Title: "Check for unlocked doors or windows", Description: "Walk around the car calmly to see if any door or window is slightly open."},
				{Title: "Call your roadside assistance", Description: "If you have roadside assistance insurance or a car membership, call them. Many have lockout services."},
				{Title: "Call a local locksmith", Description: "Search for a reputable auto locksmith in your area. Be prepared to show proof of ownership or ID."},
				{Title: "Contact the car manufacturer", Description: "Some brands have emergency unlock services available 24/7. Check your owner's manual or the manufacturer website."},
				{Title: "Call a trusted friend or family member", Description: "If they have a spare key and can meet you, this is often the quickest solution."},
			},
		},
		{
			Slug: "smoke-burning-smell",
			Title: "Smoke or burning smell",
			Summary: "Respond immediately if you see smoke or smell burning. This is a safety issue.",
			SafetyTips: "Do not ignore smoke or burning smells. Pull over immediately to a safe location. If there is visible fire or heavy smoke, evacuate and call emergency services.",
			Steps: []Step{
				{Title: "Pull over safely", Description: "Move to the shoulder or a parking area away from traffic. Turn on hazard lights."},
				{Title: "Turn off the engine", Description: "Stop the engine and allow it to cool."},
				{Title: "Exit the vehicle", Description: "Get out and move away from the car if you see visible smoke or flames."},
				{Title: "Locate the source (if safe)", Description: "If there is no visible fire, look for the source from a safe distance. Check for fluid leaks or damaged wiring."},
				{Title: "Call for help", Description: "Call roadside assistance, the fire department, or a tow service. Do not attempt to restart the car."},
				{Title: "Do not reenter", Description: "Remain outside the vehicle and away from traffic until help arrives."},
			},
		},
		{
			Slug: "fluid-leak",
			Title: "Fluid leak under car",
			Summary: "Identify what fluid is leaking and decide whether it is safe to drive.",
			SafetyTips: "Some leaks are minor and others are critical. When in doubt, do not drive and seek professional help.",
			Steps: []Step{
				{Title: "Identify the fluid color", Description: "Red or bright: likely transmission fluid. Brown or dark: likely engine oil. Green, pink, or orange: likely coolant. Clear: likely air conditioning condensation."},
				{Title: "Check fluid levels", Description: "Pop the hood and check the levels of oil, coolant, and transmission fluid using their respective dipsticks or sight glasses."},
				{Title: "Assess the leak rate", Description: "If the car is losing fluid rapidly, do not drive. Call for a tow. If the leak is slow, you may be able to drive to a shop."},
				{Title: "Drive carefully if needed", Description: "If you must drive, do so slowly and monitor temperatures and fluid levels. Stop if you see smoke or smell burning."},
				{Title: "Get professional help", Description: "Have a mechanic inspect the leak as soon as possible. Some leaks require immediate repair to prevent engine damage."},
			},
		},
		{
			Slug: "minor-accident",
			Title: "Minor accident or light collision",
			Summary: "Steps to take after a minor accident to protect yourself and document the incident.",
			SafetyTips: "Always put on your hazard lights and ensure everyone is safe. Do not leave the scene. Be polite but cautious with the other driver.",
			Steps: []Step{
				{Title: "Ensure everyone is safe", Description: "Check if anyone is injured. Call emergency services if needed."},
				{Title: "Turn on hazard lights", Description: "Alert other drivers and move vehicles to a safe area if possible."},
				{Title: "Call the police (if required)", Description: "In many places, police must document accidents. Get a police report number."},
				{Title: "Exchange information", Description: "Get the other driver's name, phone number, insurance company, policy number, vehicle make/model, and license plate."},
				{Title: "Document the scene", Description: "Take photos of all vehicle damage, the accident location, and the other vehicle's license plate."},
				{Title: "Notify your insurance company", Description: "Report the accident to your insurer as soon as possible with photos and the police report number."},
			},
		},
		{
			Slug: "check-engine-light",
			Title: "Check engine light on",
			Summary: "The check engine light can indicate many issues, from simple to serious.",
			SafetyTips: "A flashing check engine light means serious engine trouble. Stop driving and get a tow. A steady light is less urgent but still needs attention.",
			Steps: []Step{
				{Title: "Determine if the light is flashing or steady", Description: "Flashing light: severe misfire or problem. Stop driving. Steady light: less urgent but schedule an inspection soon."},
				{Title: "Check the gas cap", Description: "A loose or cracked gas cap can trigger the light. Ensure it is tight. The light may clear on its own after a few driving cycles."},
				{Title: "Scan for diagnostic codes", Description: "Visit an auto parts store (often free) or a mechanic for a diagnostic scan. This will reveal the specific issue."},
				{Title: "Review the code", Description: "Ask the technician to explain the code and what it means. Do not ignore it, as it can lead to more expensive repairs."},
				{Title: "Schedule a repair", Description: "Based on the code severity, schedule an appointment with a trusted mechanic to address the root cause."},
			},
		},
		{
			Slug: "brake-warning-light",
			Title: "Brake warning light or brake failure",
			Summary: "The brake warning light needs prompt attention. Brake issues are safety-critical.",
			SafetyTips: "If you lose brake pressure or the pedal feels spongy, stop driving immediately. Do not ignore brake warning lights.",
			Steps: []Step{
				{Title: "Note how the brakes feel", Description: "Is the pedal firm or spongy? Are the brakes responsive or soft? This helps a mechanic diagnose the issue."},
				{Title: "Check the parking brake", Description: "If the parking brake is engaged, release it. Sometimes this alone will turn off the light."},
				{Title: "Stop safely", Description: "If the light is on and the brakes feel abnormal, pull over in a safe area and call for a tow."},
				{Title: "Do not ignore it", Description: "Brake issues can worsen quickly. A spongy pedal, grinding noise, or loss of braking power means stop driving."},
				{Title: "Get professional help immediately", Description: "Brake system problems require immediate professional inspection and repair. Do not delay."},
			},
		},
	}
}

func getLessons() []Lesson {
	return []Lesson{
		{ID: 1, Title: "How your cooling system works", Description: "Learn why coolant, the radiator, and thermostat matter for engine health.", Content: []string{"The cooling system keeps your engine from overheating by circulating coolant through the engine and radiator.", "Check coolant level regularly and look for leaks around hoses or the radiator cap.", "If the temperature gauge climbs or you see steam, stop safely and let the engine cool before checking."}, Tags: []string{"cooling", "engine", "maintenance"}},
		{ID: 2, Title: "Tire wear and pressure basics", Description: "Simple checks to keep your tires safe and efficient.", Content: []string{"Proper tire pressure improves fuel economy and braking performance.", "Inspect tread depth and wear pattern every month; uneven wear can mean alignment or balance issues.", "Rotate tires every 5,000–7,000 miles to extend their life."}, Tags: []string{"tires", "safety", "maintenance"}},
		{ID: 3, Title: "Understanding dashboard warning lights", Description: "Learn which lights need immediate action and which can wait for a checkup.", Content: []string{"Red lights usually mean stop driving or pull over safely. Orange/yellow lights mean inspect soon.", "A check engine light can indicate many issues, from a loose gas cap to engine trouble.", "If a light comes on with strange noises or smoke, stop driving and get help."}, Tags: []string{"warning lights", "safety"}},
		{ID: 4, Title: "When to change engine oil", Description: "Oil changes are one of the most important simple maintenance tasks.", Content: []string{"Your owner’s manual tells you the right oil type and interval for your car.", "Dark, dirty oil or a burning smell are signs you may need a change sooner.", "Regular oil changes protect engine parts and keep your car running smoothly."}, Tags: []string{"oil", "engine"}},
		{ID: 5, Title: "Brake system checks every driver should know", Description: "Recognize early brake wear and stay safe on the road.", Content: []string{"Listen for squealing, grinding, or a spongy brake pedal.", "Brake fluid should be topped up and changed per the manufacturer’s schedule.", "If your car pulls to one side during braking, have the brakes inspected."}, Tags: []string{"brakes", "safety"}},
		{ID: 6, Title: "Battery health for cold starts", Description: "Keep your battery strong with these quick inspections.", Content: []string{"Check the battery terminals for corrosion and make sure connections are tight.", "A weak battery can cause slow engine cranking or trouble starting on cold mornings.", "If your battery is older than three years, consider testing it before it fails."}, Tags: []string{"battery", "starting"}},
	}
}

func getDailyLesson() Lesson {
	lessons := getLessons()
	index := int(time.Now().Unix()/86400) % len(lessons)
	return lessons[index]
}

func calculateNotificationAt(dueDate *string, notificationDays *int) *string {
	if dueDate == nil || *dueDate == "" {
		return nil
	}
	parsed, err := time.Parse("2006-01-02", *dueDate)
	if err != nil {
		return nil
	}
	days := 7
	if notificationDays != nil {
		days = *notificationDays
	}
	parsed = parsed.AddDate(0, 0, -days)
	formatted := parsed.Format("2006-01-02")
	return &formatted
}

func callClaudeAPI(apiKey, url string, payload any, dest any) error {
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("Claude API returned status %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(dest)
}

func callGroqAPI(apiKey, url string, payload any, dest any) error {
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("Groq API returned status %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(dest)
}

func summaryFromText(text string) string {
	lines := strings.Split(strings.TrimSpace(text), "\n")
	if len(lines) == 0 {
		return ""
	}
	if len(lines) <= 3 {
		return strings.Join(lines, " ")
	}
	return strings.Join(lines[len(lines)-3:], " ")
}

func firstLine(text string) string {
	lines := strings.Split(strings.TrimSpace(text), "\n")
	if len(lines) == 0 {
		return ""
	}
	return lines[0]
}

func emptyIfNil(value *string) string {
	if value == nil {
		return ""
	}
	return " " + *value
}

func optionalInt(value *int) string {
	if value == nil {
		return "unknown"
	}
	return fmt.Sprintf("%d", *value)
}

func parseWarningLightResponse(raw string) ([]string, string, string, string, string, string) {
	identified := []string{}
	confidence := "unknown"
	meaning := "Unable to determine"
	urgency := "🟡 Unknown"
	recommendation := "Consult a mechanic"
	uncertainty := ""

	start := strings.Index(raw, "{")
	end := strings.LastIndex(raw, "}")
	if start >= 0 && end >= 0 && end > start {
		jsonText := raw[start : end+1]
		var data map[string]any
		if err := json.Unmarshal([]byte(jsonText), &data); err == nil {
			if values, ok := data["identified"].([]any); ok {
				for _, value := range values {
					if s, ok := value.(string); ok {
						identified = append(identified, s)
					}
				}
			}
			if s, ok := data["confidence"].(string); ok {
				confidence = s
			}
			if s, ok := data["meaning"].(string); ok {
				meaning = s
			}
			if s, ok := data["urgency"].(string); ok {
				urgency = s
			}
			if s, ok := data["recommendation"].(string); ok {
				recommendation = s
			}
			if s, ok := data["uncertainty"].(string); ok {
				uncertainty = s
			}
		}
	}

	return identified, confidence, meaning, urgency, recommendation, uncertainty
}
