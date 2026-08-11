package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const userContextKey = "userID"

func authRouter(cfg Config) http.Handler {
	r := chi.NewRouter()
	r.Post("/signup", signupHandler(cfg))
	r.Post("/login", loginHandler(cfg))
	return r
}

func signupHandler(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			Name     string `json:"name"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
			return
		}

		if strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Password) == "" {
			respondError(w, http.StatusBadRequest, "Email and password are required.")
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to hash password", err.Error())
			return
		}

		var user User
		var namePtr *string
		if strings.TrimSpace(input.Name) != "" {
			namePtr = &input.Name
		}

		row := pool.QueryRow(r.Context(),
			"INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at, updated_at",
			input.Email, string(hash), namePtr,
		)
		if err := row.Scan(&user.ID, &user.Email, &user.Name, &user.CreatedAt, &user.UpdatedAt); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create user", err.Error())
			return
		}

		token, err := generateToken(cfg.JWTSecret, user.ID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create auth token", err.Error())
			return
		}

		respondJSON(w, http.StatusCreated, map[string]any{"user": user, "token": token})
	}
}

func loginHandler(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
			return
		}

		if strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Password) == "" {
			respondError(w, http.StatusBadRequest, "Email and password are required.")
			return
		}

		var id int
		var email string
		var name *string
		var passwordHash string
		row := pool.QueryRow(r.Context(), "SELECT id, email, name, password_hash FROM users WHERE email = $1", input.Email)
		if err := row.Scan(&id, &email, &name, &passwordHash); err != nil {
			respondError(w, http.StatusUnauthorized, "Invalid credentials.")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(input.Password)); err != nil {
			respondError(w, http.StatusUnauthorized, "Invalid credentials.")
			return
		}

		token, err := generateToken(cfg.JWTSecret, id)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create auth token", err.Error())
			return
		}

		respondJSON(w, http.StatusOK, map[string]any{"user": map[string]any{"id": id, "email": email, "name": name}, "token": token})
	}
}

func generateToken(secret string, userID int) (string, error) {
	claims := jwt.MapClaims{
		"userId": userID,
		"exp":    time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

func authMiddleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				respondError(w, http.StatusUnauthorized, "Missing authorization token.")
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			parsed, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method")
				}
				return []byte(secret), nil
			})
			if err != nil || !parsed.Valid {
				respondError(w, http.StatusUnauthorized, "Invalid token.")
				return
			}

			claims, ok := parsed.Claims.(jwt.MapClaims)
			if !ok {
				respondError(w, http.StatusUnauthorized, "Invalid token.")
				return
			}

			userIDFloat, ok := claims["userId"].(float64)
			if !ok {
				respondError(w, http.StatusUnauthorized, "Invalid token.")
				return
			}

			ctx := context.WithValue(r.Context(), userContextKey, int(userIDFloat))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func getUserID(r *http.Request) (int, bool) {
	val := r.Context().Value(userContextKey)
	id, ok := val.(int)
	return id, ok
}
