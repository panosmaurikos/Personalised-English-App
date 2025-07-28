package api

import (
	"encoding/json"
	"net/http"

	"github.com/panosmaurikos/personalisedenglish/backend/services"
)

type ResetPasswordOTPHandler struct {
	UserService *services.UserService
}

func NewResetPasswordOTPHandler(userService *services.UserService) http.Handler {
	return &ResetPasswordOTPHandler{UserService: userService}
}

func (h *ResetPasswordOTPHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Code        string `json:"code"`
		NewPassword string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Code == "" || req.NewPassword == "" {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	err := h.UserService.ResetPasswordWithOTP(r.Context(), req.Code, req.NewPassword)
	if err != nil {
		http.Error(w, "Invalid or expired code", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password has been reset successfully"))
}
