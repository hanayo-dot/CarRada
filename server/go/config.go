package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	DatabaseURL  string
	JWTSecret    string
	ClaudeAPIKey string
	GroqAPIKey   string
}

func LoadConfig() Config {
	_ = godotenv.Load()

	cfg := Config{
		Port:         getEnv("PORT", "4000"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgresql://carbuddy:carbuddy@localhost:5432/carbuddy"),
		JWTSecret:    getEnv("JWT_SECRET", "unsafe-default-jwt-secret"),
		ClaudeAPIKey: os.Getenv("CLAUDE_API_KEY"),
		GroqAPIKey:   os.Getenv("GROQ_API_KEY"),
	}

	if cfg.Port == "" {
		log.Println("PORT not set, using 4000")
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
