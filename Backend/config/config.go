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
	wd, err := os.Getwd()
	if err != nil {
		log.Printf("Could not get working directory: %v", err)
		return
	}
	projectRoot := filepath.Dir(wd)
	envPath := filepath.Join(projectRoot, ".env")
	if err := godotenv.Load(envPath); err != nil {
		log.Printf("No .env file found at %s: %v", envPath, err)
	} else {
		log.Printf("Loaded .env file from %s", envPath)
	}
}

func GetDB() (*sql.DB, error) {
	// Print env vars for debugging
	log.Printf("DB_HOST: %s", os.Getenv("DB_HOST"))
	log.Printf("DB_PORT: %s", os.Getenv("DB_PORT"))
	log.Printf("DB_USER: %s", os.Getenv("DB_USER"))
	log.Printf("DB_PASS: %s", os.Getenv("DB_PASS"))
	log.Printf("DB_NAME: %s", os.Getenv("DB_NAME"))

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
