// Http handlers
package api

import (
	"encoding/json"
	"net/http"

	"github.com/panosmaurikos/personalisedenglish/backend/models"
	"github.com/panosmaurikos/personalisedenglish/backend/services"
)

type RegisterHandler struct {
	userService *services.UserService
}

func NewRegisterHandler(us *services.UserService) *RegisterHandler {
	return &RegisterHandler{userService: us}
}

func (h *RegisterHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	user, err := h.userService.Register(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	token, err := GenerateJWT(user.ID, user.Username, user.Role)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to generate token"))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"token":    token,
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
	})
}
