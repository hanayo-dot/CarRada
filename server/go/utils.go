package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func respondJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func respondError(w http.ResponseWriter, status int, message string, detail ...string) {
	payload := ErrorResponse{Message: message}
	if len(detail) > 0 {
		payload.Detail = detail[0]
	}
	respondJSON(w, status, payload)
}

func parseIntPathParam(r *http.Request, name string) (int, error) {
	value := chi.URLParam(r, name)
	if value == "" {
		return 0, errMissingParam(name)
	}
	return strconv.Atoi(value)
}

func errMissingParam(name string) error {
	return fmt.Errorf("missing path param %s", name)
}
