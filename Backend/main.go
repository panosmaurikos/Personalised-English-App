package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/panosmaurikos/personalisedenglish/backend/api"
	"github.com/panosmaurikos/personalisedenglish/backend/config"
	"github.com/panosmaurikos/personalisedenglish/backend/repositories"
	"github.com/panosmaurikos/personalisedenglish/backend/router"
	"github.com/panosmaurikos/personalisedenglish/backend/services"
	"github.com/rs/cors"
)

func main() {
	// 1. Load .env
	config.Init()

	// 2. Συνέδεση DB
	db, err := config.GetDB()
	if err != nil {
		log.Fatalf("DB connection error: %v", err)
	}
	defer db.Close()

	// 3. Dependency injection
	userRepo := repositories.NewUserRepository(db)
	userSvc := services.NewUserService(userRepo)
	registerHandler := api.NewRegisterHandler(userSvc)
	loginHandler := api.NewLoginHandler(userSvc)

	// 4. Router setup
	h := router.NewHandler()
	r := h.SetupRouter(registerHandler, loginHandler)

	// 5. CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// 6. Server setup
	srv := &http.Server{
		Addr:         ":" + os.Getenv("SERVER_PORT"),
		Handler:      c.Handler(r), // CORS wraps the router
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// 7. Graceful shutdown
	go func() {
		log.Printf("Server starting on %s\n", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exiting")
}
