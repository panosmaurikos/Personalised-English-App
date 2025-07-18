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

func (r *UserRepository) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	query := `
        SELECT id, username, email, password, role, create_time
        FROM users
        WHERE username = $1
        LIMIT 1`
	row := r.db.QueryRowContext(ctx, query, username)

	var user models.User
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Role, &user.CreateTime)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
}
