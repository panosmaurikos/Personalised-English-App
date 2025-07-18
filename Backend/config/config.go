// DB connection and configuration
package config

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func Init() {
	// Always try to load .env from the project root
	if err := godotenv.Load(filepath.Join("C:/Users/Panos/Desktop/Personalised-English-App", ".env")); err != nil {
		log.Printf("No .env file found at project root: %v", err)
	} else {
		log.Println("Loaded .env file from project root")
	}
}

func GetDB() (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_NAME"),
	)
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return nil, err
	}
	return db, nil
}
