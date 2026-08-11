package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

func vehiclesRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", getVehiclesHandler)
	r.Post("/", createVehicleHandler)
	r.Get("/{id}", getVehicleHandler)
	r.Put("/{id}", updateVehicleHandler)
	r.Delete("/{id}", deleteVehicleHandler)
	return r
}

func assistantRouter() http.Handler {
	r := chi.NewRouter()
	r.Post("/chat", assistantChatHandler)
	r.Post("/translate", assistantTranslateHandler)
	r.Post("/analyze-warning-light", assistantAnalyzeWarningLightHandler)
	r.Post("/analyze-audio", assistantAnalyzeAudioHandler)
	r.Post("/cost-estimate", assistantCostEstimateHandler)
	return r
}

func conversationsRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/history", conversationsHistoryHandler)
	return r
}

func diagnosticsRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", listDiagnosticSessionsHandler)
	r.Post("/", createDiagnosticSessionHandler)
	r.Get("/{id}", getDiagnosticSessionHandler)
	r.Post("/{id}/summary", generateDiagnosticSummaryHandler)
	return r
}

func emergenciesRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", listEmergencyHandler)
	r.Get("/{slug}", getEmergencyHandler)
	return r
}

func remindersRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", listRemindersHandler)
	r.Post("/", createReminderHandler)
	r.Put("/{id}", updateReminderHandler)
	r.Delete("/{id}", deleteReminderHandler)
	return r
}

func lessonsRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", lessonsHandler)
	return r
}

func getVehiclesHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	rows, err := pool.Query(r.Context(), "SELECT id, user_id, name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin, created_at, updated_at FROM vehicles WHERE user_id = $1 ORDER BY updated_at DESC", userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load vehicles", err.Error())
		return
	}
	defer rows.Close()

	vehicles := []Vehicle{}
	for rows.Next() {
		var v Vehicle
		var trim, engine, fuelType, transmission, vin *string
		var mileage *int
		if err := rows.Scan(&v.ID, &v.UserID, &v.Name, &v.Make, &v.Model, &v.Year, &trim, &engine, &fuelType, &transmission, &mileage, &vin, &v.CreatedAt, &v.UpdatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to parse vehicles", err.Error())
			return
		}
		v.Trim = trim
		v.Engine = engine
		v.FuelType = fuelType
		v.Transmission = transmission
		v.Mileage = mileage
		v.VIN = vin
		vehicles = append(vehicles, v)
	}

	respondJSON(w, http.StatusOK, vehicles)
}

func createVehicleHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		Name         string  `json:"name"`
		Make         string  `json:"make"`
		Model        string  `json:"model"`
		Year         int     `json:"year"`
		Trim         *string `json:"trim"`
		Engine       *string `json:"engine"`
		FuelType     *string `json:"fuel_type"`
		Transmission *string `json:"transmission"`
		Mileage      *int    `json:"mileage"`
		VIN          *string `json:"vin"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	var v Vehicle
	row := pool.QueryRow(r.Context(),
		`INSERT INTO vehicles (user_id, name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, user_id, name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin, created_at, updated_at`,
		userID, input.Name, input.Make, input.Model, input.Year, input.Trim, input.Engine, input.FuelType, input.Transmission, input.Mileage, input.VIN,
	)
	var trim, engine, fuelType, transmission, vin *string
	var mileage *int
	if err := row.Scan(&v.ID, &v.UserID, &v.Name, &v.Make, &v.Model, &v.Year, &trim, &engine, &fuelType, &transmission, &mileage, &vin, &v.CreatedAt, &v.UpdatedAt); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create vehicle", err.Error())
		return
	}
	v.Trim = trim
	v.Engine = engine
	v.FuelType = fuelType
	v.Transmission = transmission
	v.Mileage = mileage
	v.VIN = vin

	respondJSON(w, http.StatusCreated, v)
}

func getVehicleHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	vehicleID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid vehicle ID", err.Error())
		return
	}

	row := pool.QueryRow(r.Context(), "SELECT id, user_id, name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin, created_at, updated_at FROM vehicles WHERE id=$1 AND user_id=$2", vehicleID, userID)
	var v Vehicle
	var trim, engine, fuelType, transmission, vin *string
	var mileage *int
	if err := row.Scan(&v.ID, &v.UserID, &v.Name, &v.Make, &v.Model, &v.Year, &trim, &engine, &fuelType, &transmission, &mileage, &vin, &v.CreatedAt, &v.UpdatedAt); err != nil {
		respondError(w, http.StatusNotFound, "Vehicle not found")
		return
	}
	v.Trim = trim
	v.Engine = engine
	v.FuelType = fuelType
	v.Transmission = transmission
	v.Mileage = mileage
	v.VIN = vin

	respondJSON(w, http.StatusOK, v)
}

func updateVehicleHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	vehicleID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid vehicle ID", err.Error())
		return
	}

	var input struct {
		Name         *string `json:"name"`
		Make         *string `json:"make"`
		Model        *string `json:"model"`
		Year         *int    `json:"year"`
		Trim         *string `json:"trim"`
		Engine       *string `json:"engine"`
		FuelType     *string `json:"fuel_type"`
		Transmission *string `json:"transmission"`
		Mileage      *int    `json:"mileage"`
		VIN          *string `json:"vin"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	query := `UPDATE vehicles SET name=COALESCE($1, name), make=COALESCE($2, make), model=COALESCE($3, model), year=COALESCE($4, year),
		trim=COALESCE($5, trim), engine=COALESCE($6, engine), fuel_type=COALESCE($7, fuel_type), transmission=COALESCE($8, transmission),
		mileage=COALESCE($9, mileage), vin=COALESCE($10, vin), updated_at=now()
		WHERE id=$11 AND user_id=$12 RETURNING id, user_id, name, make, model, year, trim, engine, fuel_type, transmission, mileage, vin, created_at, updated_at`

	row := pool.QueryRow(r.Context(), query,
		input.Name, input.Make, input.Model, input.Year, input.Trim, input.Engine, input.FuelType, input.Transmission, input.Mileage, input.VIN,
		vehicleID, userID,
	)
	var v Vehicle
	var trim, engine, fuelType, transmission, vin *string
	var mileage *int
	if err := row.Scan(&v.ID, &v.UserID, &v.Name, &v.Make, &v.Model, &v.Year, &trim, &engine, &fuelType, &transmission, &mileage, &vin, &v.CreatedAt, &v.UpdatedAt); err != nil {
		respondError(w, http.StatusNotFound, "Vehicle not found")
		return
	}
	v.Trim = trim
	v.Engine = engine
	v.FuelType = fuelType
	v.Transmission = transmission
	v.Mileage = mileage
	v.VIN = vin

	respondJSON(w, http.StatusOK, v)
}

func deleteVehicleHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	vehicleID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid vehicle ID", err.Error())
		return
	}

	_, err = pool.Exec(r.Context(), "DELETE FROM vehicles WHERE id=$1 AND user_id=$2", vehicleID, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete vehicle", err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func assistantChatHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		Messages  []ConversationMessage `json:"messages"`
		VehicleID *int                `json:"vehicleId"`
		SessionID *int                `json:"sessionId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	if len(input.Messages) == 0 {
		respondError(w, http.StatusBadRequest, "Conversation messages are required.")
		return
	}

	textPayload := strings.Builder{}
	for _, msg := range input.Messages {
		textPayload.WriteString(msg.Message)
		textPayload.WriteString(" ")
	}

	safety := classifySafetyIssue(textPayload.String())
	if safety.Alert {
		respondJSON(w, http.StatusOK, map[string]any{"safety": safety, "assistant": nil})
		return
	}

	var vehicle *Vehicle
	if input.VehicleID != nil {
		v, err := getVehicleByID(r.Context(), *input.VehicleID, userID)
		if err == nil {
			vehicle = v
		}
	}

	user, err := getUserByID(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load user", err.Error())
		return
	}

	assistantResponse, err := generateAssistantResponse(appConfig.ClaudeAPIKey, input.Messages, user, vehicle)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Assistant generation failed", err.Error())
		return
	}

	if _, err := pool.Exec(r.Context(),
		"INSERT INTO conversations (user_id, vehicle_id, diagnostic_session_id, role, message) VALUES ($1,$2,$3,$4,$5)",
		userID, input.VehicleID, input.SessionID, "user", textPayload.String(),
	); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to save conversation", err.Error())
		return
	}

	if _, err := pool.Exec(r.Context(),
		"INSERT INTO conversations (user_id, vehicle_id, diagnostic_session_id, role, message) VALUES ($1,$2,$3,$4,$5)",
		userID, input.VehicleID, input.SessionID, "assistant", assistantResponse.Text,
	); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to save assistant response", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"safety": safety, "assistant": assistantResponse})
}

func assistantTranslateHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Text string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if strings.TrimSpace(input.Text) == "" {
		respondError(w, http.StatusBadRequest, "Mechanic note text is required.")
		return
	}

	summary, err := generateMechanicSummary(appConfig.ClaudeAPIKey, input.Text)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate mechanic summary", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"summary": summary})
}

func assistantAnalyzeWarningLightHandler(w http.ResponseWriter, r *http.Request) {
	_, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		ImageBase64 string `json:"imageBase64"`
		MimeType    string `json:"mimeType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if strings.TrimSpace(input.ImageBase64) == "" || strings.TrimSpace(input.MimeType) == "" {
		respondError(w, http.StatusBadRequest, "Image data and MIME type are required.")
		return
	}

	analysis, err := analyzeWarningLightImage(appConfig.ClaudeAPIKey, input.ImageBase64, input.MimeType)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Image analysis failed", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"analysis": analysis})
}

func assistantAnalyzeAudioHandler(w http.ResponseWriter, r *http.Request) {
	_, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		AudioBase64 string `json:"audioBase64"`
		MimeType    string `json:"mimeType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if strings.TrimSpace(input.AudioBase64) == "" || strings.TrimSpace(input.MimeType) == "" {
		respondError(w, http.StatusBadRequest, "Audio data and MIME type are required.")
		return
	}

	analysis, err := analyzeAudio(appConfig.ClaudeAPIKey, input.AudioBase64, input.MimeType)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Audio analysis failed", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"analysis": analysis})
}

func assistantCostEstimateHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		Description string `json:"description"`
		VehicleID   *int   `json:"vehicleId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if strings.TrimSpace(input.Description) == "" {
		respondError(w, http.StatusBadRequest, "Repair description is required.")
		return
	}

	var vehicle *Vehicle
	if input.VehicleID != nil {
		v, err := getVehicleByID(r.Context(), *input.VehicleID, userID)
		if err == nil {
			vehicle = v
		}
	}

	estimate, err := generateRepairCostEstimate(appConfig.ClaudeAPIKey, input.Description, vehicle)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Cost estimate generation failed.", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, estimate)
}

func conversationsHistoryHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	rows, err := pool.Query(r.Context(), "SELECT id, role, message, created_at FROM conversations WHERE user_id = $1 ORDER BY created_at ASC LIMIT 200", userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load conversations", err.Error())
		return
	}
	defer rows.Close()

	messages := []MessageRecord{}
	for rows.Next() {
		var m MessageRecord
		if err := rows.Scan(&m.Role, &m.Message, &m.CreatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to parse conversations", err.Error())
			return
		}
		messages = append(messages, m)
	}

	respondJSON(w, http.StatusOK, messages)
}

func listDiagnosticSessionsHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	sessions, err := listDiagnosticSessions(r.Context(), userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load diagnostic sessions", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, sessions)
}

func createDiagnosticSessionHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		VehicleID   *int   `json:"vehicleId"`
		SessionName string `json:"sessionName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if strings.TrimSpace(input.SessionName) == "" {
		respondError(w, http.StatusBadRequest, "Session name is required.")
		return
	}

	session, err := createDiagnosticSession(r.Context(), userID, input.VehicleID, input.SessionName)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create diagnostic session", err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, session)
}

func getDiagnosticSessionHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	sessionID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid session ID", err.Error())
		return
	}

	session, err := getDiagnosticSession(r.Context(), userID, sessionID)
	if err != nil {
		respondError(w, http.StatusNotFound, "Diagnostic session not found")
		return
	}
	messages, err := getSessionMessages(r.Context(), userID, sessionID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load session messages", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"session": session, "messages": messages})
}

func generateDiagnosticSummaryHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	sessionID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid session ID", err.Error())
		return
	}

	summary, err := generateDiagnosticSummary(appConfig.ClaudeAPIKey, userID, sessionID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate summary", err.Error())
		return
	}

	respondJSON(w, http.StatusOK, summary)
}

func listEmergencyHandler(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, getEmergencyList())
}

func getEmergencyHandler(w http.ResponseWriter, r *http.Request) {
	procedure := getEmergencyProcedure(chi.URLParam(r, "slug"))
	if procedure == nil {
		respondError(w, http.StatusNotFound, "Emergency flow not found.")
		return
	}
	respondJSON(w, http.StatusOK, procedure)
}

func listRemindersHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	rows, err := pool.Query(r.Context(), `SELECT id, description, due_date, due_mileage, completed, notification_enabled, notification_days, notification_at, created_at, updated_at
		FROM maintenance_reminders WHERE user_id=$1 ORDER BY completed, due_date NULLS LAST, due_mileage NULLS LAST, updated_at DESC`, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to load reminders", err.Error())
		return
	}
	defer rows.Close()

	reminders := []Reminder{}
	for rows.Next() {
		var rmd Reminder
		if err := rows.Scan(&rmd.ID, &rmd.Description, &rmd.DueDate, &rmd.DueMileage, &rmd.Completed, &rmd.NotificationEnabled, &rmd.NotificationDays, &rmd.NotificationAt, &rmd.CreatedAt, &rmd.UpdatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to parse reminders", err.Error())
			return
		}
		reminders = append(reminders, rmd)
	}

	respondJSON(w, http.StatusOK, reminders)
}

func createReminderHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		Description        string  `json:"description"`
		DueDate            *string `json:"due_date"`
		DueMileage         *int    `json:"due_mileage"`
		NotificationEnabled *bool   `json:"notification_enabled"`
		NotificationDays   *int    `json:"notification_days"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if strings.TrimSpace(input.Description) == "" {
		respondError(w, http.StatusBadRequest, "Reminder description is required.")
		return
	}

	enabled := true
	if input.NotificationEnabled != nil {
		enabled = *input.NotificationEnabled
	}
	days := 7
	if input.NotificationDays != nil {
		days = *input.NotificationDays
	}
	notificationAt := calculateNotificationAt(input.DueDate, &days)

	row := pool.QueryRow(r.Context(), `INSERT INTO maintenance_reminders (user_id, description, due_date, due_mileage, notification_enabled, notification_days, notification_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, description, due_date, due_mileage, completed, notification_enabled, notification_days, notification_at, created_at, updated_at`,
		userID, strings.TrimSpace(input.Description), input.DueDate, input.DueMileage, enabled, days, notificationAt)
	var rmd Reminder
	if err := row.Scan(&rmd.ID, &rmd.Description, &rmd.DueDate, &rmd.DueMileage, &rmd.Completed, &rmd.NotificationEnabled, &rmd.NotificationDays, &rmd.NotificationAt, &rmd.CreatedAt, &rmd.UpdatedAt); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create reminder", err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, rmd)
}

func updateReminderHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	reminderID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid reminder ID", err.Error())
		return
	}

	var input struct {
		Description        *string `json:"description"`
		DueDate            *string `json:"due_date"`
		DueMileage         *int    `json:"due_mileage"`
		Completed          *bool   `json:"completed"`
		NotificationEnabled *bool   `json:"notification_enabled"`
		NotificationDays   *int    `json:"notification_days"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	notificationAt := calculateNotificationAt(input.DueDate, input.NotificationDays)
	query := `UPDATE maintenance_reminders
		SET description = COALESCE($1, description),
		    due_date = COALESCE($2, due_date),
		    due_mileage = COALESCE($3, due_mileage),
		    completed = COALESCE($4, completed),
		    notification_enabled = COALESCE($5, notification_enabled),
		    notification_days = COALESCE($6, notification_days),
		    notification_at = COALESCE($7, notification_at),
		    updated_at = now()
		WHERE id = $8 AND user_id = $9
		RETURNING id, description, due_date, due_mileage, completed, notification_enabled, notification_days, notification_at, created_at, updated_at`

	row := pool.QueryRow(r.Context(), query, input.Description, input.DueDate, input.DueMileage, input.Completed, input.NotificationEnabled, input.NotificationDays, notificationAt, reminderID, userID)
	var rmd Reminder
	if err := row.Scan(&rmd.ID, &rmd.Description, &rmd.DueDate, &rmd.DueMileage, &rmd.Completed, &rmd.NotificationEnabled, &rmd.NotificationDays, &rmd.NotificationAt, &rmd.CreatedAt, &rmd.UpdatedAt); err != nil {
		respondError(w, http.StatusNotFound, "Reminder not found")
		return
	}

	respondJSON(w, http.StatusOK, rmd)
}

func deleteReminderHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	reminderID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid reminder ID", err.Error())
		return
	}

	_, err = pool.Exec(r.Context(), "DELETE FROM maintenance_reminders WHERE id=$1 AND user_id=$2", reminderID, userID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete reminder", err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func lessonsHandler(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]any{"dailyLesson": getDailyLesson(), "lessons": getLessons()})
}
