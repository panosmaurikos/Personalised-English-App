// Manager for routing HTTP requests in the application

package router

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) SetupRouter(registerHandler http.Handler, loginHandler http.Handler, forgotPasswordHandler http.Handler, resetPasswordOTPHandler http.Handler) http.Handler {
	r := mux.NewRouter()
	r.Handle("/register", registerHandler).Methods("POST")
	r.Handle("/login", loginHandler).Methods("POST")
	r.Handle("/forgot-password", forgotPasswordHandler).Methods("POST")
	r.Handle("/reset-password", resetPasswordOTPHandler).Methods("POST")

	// Add CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true, // Set to true if withCredentials is used in the frontend
	})
	return c.Handler(r)
}

// func (h *Handler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
// 	w.WriteHeader(http.StatusOK)
// 	w.Write([]byte("User registered successfully"))
// }

// func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {
// 	w.WriteHeader(http.StatusOK)
// 	w.Write([]byte("User logged in successfully"))
// }

// func (h *Handler) ForgotPasswordHandler(w http.ResponseWriter, r *http.Request) {
// 	w.WriteHeader(http.StatusOK)
// 	w.Write([]byte("Password reset link sent"))
// }

// func (h *Handler) ResetPasswordHandler(w http.ResponseWriter, r *http.Request) {
// 	w.WriteHeader(http.StatusOK)
// 	w.Write([]byte("Password has been reset successfully"))
// }
