package router

import (
	"net/http"

	"github.com/rs/cors"
)

func NewRouter(registerHandler http.Handler) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/register", registerHandler)

	// προσθήκη CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})
	return c.Handler(mux)
}
