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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}
