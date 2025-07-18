// Manager for routing HTTP requests in the application

package router

import (
	"net/http"

	"github.com/gorilla/mux"
)

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	// Define your routes here
	router.HandleFunc("/register", h.RegisterHandler).Methods("POST")
	router.HandleFunc("/login", h.LoginHandler).Methods("POST")
}

func (h *Handler) SetupRouter(registerHandler http.Handler) http.Handler {
	r := mux.NewRouter()
	r.Handle("/register", registerHandler)
	h.RegisterRoutes(r)
	return r
}

func (h *Handler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User registered successfully"))
}

func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User logged in successfully"))
}
