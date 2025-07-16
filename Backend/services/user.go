package services

import (
	"context"
	"errors"
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
