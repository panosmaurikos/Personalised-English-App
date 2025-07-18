// Define the User model
package models

import "time"

type User struct {
	ID         int       `json:"id"`
	CreateTime time.Time `json:"create_time"`
	Username   string    `json:"username" validate:"required,min=3,max=50,alphanum"`
	Email      string    `json:"email" validate:"required,email"`
	Password   string    `json:"-"`
	Role       string    `json:"role" validate:"required,oneof=student teacher"`
}

type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50,alphanum"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Role     string `json:"role" validate:"required,oneof=student teacher"`
}
