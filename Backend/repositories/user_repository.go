// Contains the logic for the interaction with the database
package repositories

import (
	"context"
	"database/sql"

	"github.com/panosmaurikos/personalisedenglish/backend/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, u *models.User) error {
	query := `
        INSERT INTO users (username, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, create_time`
	return r.db.QueryRowContext(
		ctx,
		query,
		u.Username, u.Email, u.Password, u.Role,
	).Scan(&u.ID, &u.CreateTime)
}
