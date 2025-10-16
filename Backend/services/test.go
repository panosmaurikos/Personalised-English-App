package services

import (
	"context"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/panosmaurikos/personalisedenglish/backend/models"
	"github.com/panosmaurikos/personalisedenglish/backend/repositories"
)

type TestService struct {
	repo      *repositories.TestRepository
	userRepo  *repositories.UserRepository
	validator *validator.Validate
}

func NewTestService(repo *repositories.TestRepository, userRepo *repositories.UserRepository) *TestService {
	return &TestService{
		repo:      repo,
		userRepo:  userRepo,
		validator: validator.New(),
	}
}

func (s *TestService) CreateTest(ctx context.Context, userID int, req *models.CreateTestRequest) (*models.Test, error) {
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	user, err := s.userRepo.GetUserByID(ctx, userID) // Assume added GetUserByID
	if err != nil || user == nil || user.Role != "teacher" {
		return nil, errors.New("unauthorized: only teachers can create tests")
	}

	test := &models.Test{
		TeacherID:   userID,
		Title:       req.Title,
		Description: req.Description,
		Type:        req.Type,
		Questions:   req.Questions,
	}

	if err := s.repo.CreateTest(ctx, test); err != nil {
		return nil, err
	}
	return test, nil
}

func (s *TestService) GetTests(ctx context.Context, userID int) ([]models.Test, error) {
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "teacher" {
		return nil, errors.New("unauthorized")
	}
	return s.repo.GetTestsByTeacher(ctx, userID)
}

func (s *TestService) GetTest(ctx context.Context, userID, testID int) (*models.Test, error) {
	test, err := s.repo.GetTestByID(ctx, testID)
	if err != nil {
		return nil, err
	}
	if test == nil || test.TeacherID != userID {
		return nil, errors.New("test not found or unauthorized")
	}
	return test, nil
}

func (s *TestService) UpdateTest(ctx context.Context, userID, testID int, req *models.UpdateTestRequest) (*models.Test, error) {
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	test, err := s.repo.GetTestByID(ctx, testID)
	if err != nil {
		return nil, err
	}
	if test == nil || test.TeacherID != userID {
		return nil, errors.New("test not found or unauthorized")
	}

	if req.Title != "" {
		test.Title = req.Title
	}
	if req.Description != "" {
		test.Description = req.Description
	}
	if req.Type != "" {
		test.Type = req.Type
	}
	if len(req.Questions) > 0 {
		test.Questions = req.Questions
	}

	if err := s.repo.UpdateTest(ctx, test); err != nil {
		return nil, err
	}
	return test, nil
}

func (s *TestService) DeleteTest(ctx context.Context, userID, testID int) error {
	test, err := s.repo.GetTestByID(ctx, testID)
	if err != nil {
		return err
	}
	if test == nil || test.TeacherID != userID {
		return errors.New("test not found or unauthorized")
	}
	return s.repo.DeleteTest(ctx, testID)
}
