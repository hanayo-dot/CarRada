package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

var appConfig Config

func main() {
	cfg := LoadConfig()
	appConfig = cfg

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := ConnectDatabase(ctx, cfg.DatabaseURL); err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer pool.Close()

	r := chi.NewRouter()
	r.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}).Handler)
	r.Use(jsonContentTypeMiddleware)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		respondJSON(w, http.StatusOK, map[string]string{"message": "CarRada Go server is running."})
	})

	r.Mount("/auth", authRouter(cfg))
	r.With(authMiddleware(cfg.JWTSecret)).Mount("/vehicles", vehiclesRouter())
	r.With(authMiddleware(cfg.JWTSecret)).Mount("/assistant", assistantRouter())
	r.With(authMiddleware(cfg.JWTSecret)).Mount("/conversations", conversationsRouter())
	r.With(authMiddleware(cfg.JWTSecret)).Mount("/diagnostics", diagnosticsRouter())
	r.With(authMiddleware(cfg.JWTSecret)).Mount("/emergencies", emergenciesRouter())
	r.With(authMiddleware(cfg.JWTSecret)).Mount("/reminders", remindersRouter())
	r.With(authMiddleware(cfg.JWTSecret)).Mount("/lessons", lessonsRouter())

    // Start background schedulers (reminders delivery, etc.)
    startReminderScheduler(cfg)

	port := cfg.Port
	if port == "" {
		port = "4000"
	}
	addr := ":" + port
	log.Printf("CarRada Go server listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func jsonContentTypeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}
