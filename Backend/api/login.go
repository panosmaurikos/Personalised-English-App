package api

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/panosmaurikos/personalisedenglish/backend/services"
)

type APIError struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
}

type LoginHandler struct {
	UserService *services.UserService
}

func NewLoginHandler(userService *services.UserService) http.Handler {
	return &LoginHandler{UserService: userService}
}

func (h *LoginHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	// Log request body for debugging
	body, _ := io.ReadAll(r.Body)
	//log.Printf("Received login body: %s", string(body))
	r.Body = io.NopCloser(bytes.NewReader(body)) // Restore body for decoding

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		log.Printf("JSON decode error: %v", err)
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	authenticated, err := h.UserService.Authenticate(r.Context(), creds.Username, creds.Password)
	if err != nil || !authenticated {
		//log.Printf("Authentication failed: %v", err)
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "User logged in successfully"})
}

func respondWithError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIError{Message: message, Code: status})
}
