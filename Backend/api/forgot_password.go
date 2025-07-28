package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/panosmaurikos/personalisedenglish/backend/services"
)

type ForgotPasswordHandler struct {
	UserService *services.UserService
}

func NewForgotPasswordHandler(userService *services.UserService) http.Handler {
	return &ForgotPasswordHandler{UserService: userService}
}

func (h *ForgotPasswordHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	otp, err := h.UserService.CreatePasswordResetOTP(r.Context(), req.Email)
	if err != nil {
		log.Printf("ForgotPassword error: %v", err) // <-- προσθήκη logging
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	subject := "Your Password Reset Code"
	body := "Your password reset code is: " + otp + "\nThis code will expire in 10 minutes."
	err = services.SendNoReplyEmail(req.Email, subject, body)
	if err != nil {
		log.Printf("SendNoReplyEmail error: %v", err) // <-- προσθήκη logging
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset code sent"))
}
