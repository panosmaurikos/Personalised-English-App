//  Business logic

package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/lib/pq"
	"github.com/panosmaurikos/personalisedenglish/backend/models"
	"github.com/panosmaurikos/personalisedenglish/backend/repositories"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo      *repositories.UserRepository
	validator *validator.Validate
}

func NewUserService(repo *repositories.UserRepository) *UserService {
	return &UserService{
		repo:      repo,
		validator: validator.New(),
	}
}

func (s *UserService) Register(ctx context.Context, req *models.RegisterRequest) (*models.User, error) {
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hash),
		Role:     req.Role,
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := s.repo.CreateUser(ctx, user); err != nil {
		if pgErr, ok := err.(*pq.Error); ok && pgErr.Code == "23505" {
			switch pgErr.Constraint {
			case "users_email_key":
				return nil, errors.New("email already exists")
			case "users_username_key":
				return nil, errors.New("username already exists")
			default:
				return nil, errors.New("username or email already exists")
			}
		}
		return nil, err
	}

	user.Password = ""
	return user, nil
}

func (s *UserService) Authenticate(ctx context.Context, identifier, password string) (*models.User, error) {
	user, err := s.repo.GetUserByUsernameOrEmail(ctx, identifier)
	if err != nil {
		log.Printf("Authenticate: error fetching user: %v", err)
		return nil, err
	}
	if user == nil {
		log.Printf("Authenticate: user not found: %s", identifier)
		return nil, errors.New("user not found")
	}
	log.Printf("Authenticate: user found: %s", user.Username)
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		log.Printf("Authenticate: invalid password for user: %s", identifier)
		return nil, errors.New("invalid credentials")
	}
	log.Printf("Authenticate: successful login for user: %s", user.Username)
	user.Password = ""
	return user, nil
}

func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return s.repo.GetUserByEmail(ctx, email)
}

func (s *UserService) CreatePasswordResetOTP(ctx context.Context, email string) (string, error) {
	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil || user == nil {
		return "", errors.New("user not found")
	}
	otp := fmt.Sprintf("%06d", rand.Intn(1000000)) // 6-digit code
	expiresAt := time.Now().Add(10 * time.Minute)
	if err := s.repo.CreatePasswordResetOTP(ctx, user.ID, otp, expiresAt); err != nil {
		return "", err
	}
	return otp, nil
}

func (s *UserService) ResetPasswordWithOTP(ctx context.Context, otp, newPassword string) error {
	userID, err := s.repo.GetUserIDByOTP(ctx, otp)
	if err != nil || userID == 0 {
		log.Printf("ResetPasswordWithOTP: invalid or expired code: %s", otp)
		return errors.New("invalid or expired code")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("ResetPasswordWithOTP: bcrypt error: %v", err)
		return err
	}
	if err := s.repo.UpdateUserPassword(ctx, userID, string(hash)); err != nil {
		log.Printf("ResetPasswordWithOTP: update password error: %v", err)
		return err
	}
	log.Printf("ResetPasswordWithOTP: password updated for userID: %d", userID)
	return s.repo.DeletePasswordResetOTP(ctx, otp)
}
