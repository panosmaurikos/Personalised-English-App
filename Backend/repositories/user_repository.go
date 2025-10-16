// Contains the logic for the interaction with the database
package repositories

import (
	"context"
	"database/sql"
	"time"

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

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
        SELECT id, username, email, password, role, create_time
        FROM users
        WHERE email = $1
        LIMIT 1`
	row := r.db.QueryRowContext(ctx, query, email)

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

func (r *UserRepository) CreatePasswordResetOTP(ctx context.Context, userID int, otp string, expiresAt time.Time) error {
	query := `
        INSERT INTO password_resets (user_id, token, expires_at)
        VALUES ($1, $2, $3)`
	_, err := r.db.ExecContext(ctx, query, userID, otp, expiresAt)
	return err
}

func (r *UserRepository) GetUserIDByOTP(ctx context.Context, otp string) (int, error) {
	query := `
        SELECT user_id FROM password_resets
        WHERE token = $1 AND expires_at > NOW()
        LIMIT 1`
	var userID int
	err := r.db.QueryRowContext(ctx, query, otp).Scan(&userID)
	if err != nil {
		return 0, err
	}
	return userID, nil
}

func (r *UserRepository) DeletePasswordResetOTP(ctx context.Context, otp string) error {
	query := `DELETE FROM password_resets WHERE token = $1`
	_, err := r.db.ExecContext(ctx, query, otp)
	return err
}

func (r *UserRepository) UpdateUserPassword(ctx context.Context, userID int, hashedPassword string) error {
	query := `UPDATE users SET password = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, hashedPassword, userID)
	return err
}

func (r *UserRepository) GetUserByUsernameOrEmail(ctx context.Context, identifier string) (*models.User, error) {
	query := `
        SELECT id, username, email, password, role, create_time
        FROM users
        WHERE username = $1 OR email = $1
        LIMIT 1`
	row := r.db.QueryRowContext(ctx, query, identifier)

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

func (r *UserRepository) GetUserByID(ctx context.Context, id int) (*models.User, error) {
	query := `
        SELECT id, username, email, password, role, create_time
        FROM users
        WHERE id = $1
        LIMIT 1`
	row := r.db.QueryRowContext(ctx, query, id)

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
