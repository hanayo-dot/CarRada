package main

import "time"

type User struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Name      *string   `json:"name,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Vehicle struct {
	ID           int        `json:"id"`
	UserID       int        `json:"user_id"`
	Name         string     `json:"name"`
	Make         string     `json:"make"`
	Model        string     `json:"model"`
	Year         int        `json:"year"`
	Trim         *string    `json:"trim,omitempty"`
	Engine       *string    `json:"engine,omitempty"`
	FuelType     *string    `json:"fuel_type,omitempty"`
	Transmission *string    `json:"transmission,omitempty"`
	Mileage      *int       `json:"mileage,omitempty"`
	VIN          *string    `json:"vin,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type ConversationMessage struct {
	Role    string `json:"role"`
	Message string `json:"message"`
}

type SafetyResult struct {
	Alert   bool    `json:"alert"`
	Issue   *string `json:"issue,omitempty"`
	Message string  `json:"message"`
}

type AssistantResponse struct {
	Text    string `json:"text"`
	Summary string `json:"summary,omitempty"`
}

type WarningLightAnalysis struct {
	Identified    []string `json:"identified"`
	Confidence    string   `json:"confidence"`
	Meaning       string   `json:"meaning"`
	Urgency       string   `json:"urgency"`
	Recommendation string   `json:"recommendation"`
	Uncertainty   string   `json:"uncertainty,omitempty"`
}

type DiagnosticSession struct {
	ID        int        `json:"id"`
	SessionName string   `json:"session_name"`
	Status    string     `json:"status"`
	VehicleID *int       `json:"vehicle_id,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Make      *string    `json:"make,omitempty"`
	Model     *string    `json:"model,omitempty"`
	Year      *int       `json:"year,omitempty"`
}

type MessageRecord struct {
	Role      string    `json:"role"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

type Reminder struct {
	ID                 int     `json:"id"`
	Description        string  `json:"description"`
	DueDate            *string `json:"due_date,omitempty"`
	DueMileage         *int    `json:"due_mileage,omitempty"`
	Completed          *bool   `json:"completed,omitempty"`
	NotificationEnabled *bool  `json:"notification_enabled,omitempty"`
	NotificationDays   *int    `json:"notification_days,omitempty"`
	NotificationAt     *string `json:"notification_at,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type EmergencyProcedure struct {
	Slug       string      `json:"slug"`
	Title      string      `json:"title"`
	Summary    string      `json:"summary"`
	SafetyTips string      `json:"safety_tips"`
	Steps      []Step      `json:"steps"`
}

type Step struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type Lesson struct {
	ID          int      `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Content     []string `json:"content"`
	Tags        []string `json:"tags"`
}

type DiagnosticSummary struct {
	Summary string `json:"summary"`
}

type ErrorResponse struct {
	Message string `json:"message"`
	Detail  string `json:"detail,omitempty"`
}
