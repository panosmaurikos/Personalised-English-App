package services

import (
	"context"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/panosmaurikos/personalisedenglish/backend/models"
	"github.com/panosmaurikos/personalisedenglish/backend/repositories"
)

// TestService provides methods for managing tests
type TestService struct {
	repo      *repositories.TestRepository // Handles test data operations
	userRepo  *repositories.UserRepository // Handles user data operations
	validator *validator.Validate          // Validates request structs
}

// NewTestService creates a new TestService instance
func NewTestService(repo *repositories.TestRepository, userRepo *repositories.UserRepository) *TestService {
	return &TestService{
		repo:      repo,
		userRepo:  userRepo,
		validator: validator.New(),
	}
}

// CreateTest creates a new test if the user is a teacher
func (s *TestService) CreateTest(ctx context.Context, userID int, req *models.CreateTestRequest) (*models.Test, error) {
	// Validate request struct
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	// Check user role
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "teacher" {
		return nil, errors.New("unauthorized: only teachers can create tests")
	}

	// Build test model
	test := &models.Test{
		TeacherID:   userID,
		Title:       req.Title,
		Description: req.Description,
		Type:        req.Type,
		Questions:   req.Questions,
	}

	// Save test to repository
	if err := s.repo.CreateTest(ctx, test); err != nil {
		return nil, err
	}
	return test, nil
}

// GetTests returns all tests created by the teacher
func (s *TestService) GetTests(ctx context.Context, userID int) ([]models.Test, error) {
	// Check user role
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "teacher" {
		return nil, errors.New("unauthorized")
	}
	return s.repo.GetTestsByTeacher(ctx, userID)
}

// GetTest returns a specific test if the user is authorized
func (s *TestService) GetTest(ctx context.Context, userID, testID int) (*models.Test, error) {
	test, err := s.repo.GetTestByID(ctx, testID)
	if err != nil {
		return nil, err
	}
	// Check ownership
	if test == nil || test.TeacherID != userID {
		return nil, errors.New("test not found or unauthorized")
	}
	return test, nil
}

// UpdateTest updates an existing test if the user is authorized
func (s *TestService) UpdateTest(ctx context.Context, userID, testID int, req *models.UpdateTestRequest) (*models.Test, error) {
	// Validate request struct
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	test, err := s.repo.GetTestByID(ctx, testID)
	if err != nil {
		return nil, err
	}
	// Check ownership
	if test == nil || test.TeacherID != userID {
		return nil, errors.New("test not found or unauthorized")
	}

	// Update fields if provided
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

	// Save changes
	if err := s.repo.UpdateTest(ctx, test); err != nil {
		return nil, err
	}
	return test, nil
}

// DeleteTest deletes a test if the user is authorized
func (s *TestService) DeleteTest(ctx context.Context, userID, testID int) error {
	test, err := s.repo.GetTestByID(ctx, testID)
	if err != nil {
		return err
	}
	// Check ownership
	if test == nil || test.TeacherID != userID {
		return errors.New("test not found or unauthorized")
	}
	return s.repo.DeleteTest(ctx, testID)
}

// GetTestByID returns a test by ID without authorization checks (for students to take tests)
func (s *TestService) GetTestByID(ctx context.Context, testID int) (*models.Test, error) {
	return s.repo.GetTestByID(ctx, testID)
}
