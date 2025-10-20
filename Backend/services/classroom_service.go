package services

import (
	"context"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/panosmaurikos/personalisedenglish/backend/models"
	"github.com/panosmaurikos/personalisedenglish/backend/repositories"
)

// ClassroomService provides methods for managing classrooms
type ClassroomService struct {
	repo      *repositories.ClassroomRepository
	userRepo  *repositories.UserRepository
	testRepo  *repositories.TestRepository
	validator *validator.Validate
}

// NewClassroomService creates a new ClassroomService instance
func NewClassroomService(
	repo *repositories.ClassroomRepository,
	userRepo *repositories.UserRepository,
	testRepo *repositories.TestRepository,
) *ClassroomService {
	return &ClassroomService{
		repo:      repo,
		userRepo:  userRepo,
		testRepo:  testRepo,
		validator: validator.New(),
	}
}

// CreateClassroom creates a new classroom if the user is a teacher
func (s *ClassroomService) CreateClassroom(ctx context.Context, userID int, req *models.CreateClassroomRequest) (*models.Classroom, error) {
	// Validate request
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	// Check user role
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "teacher" {
		return nil, errors.New("unauthorized: only teachers can create classrooms")
	}

	// Build classroom model
	classroom := &models.Classroom{
		TeacherID:   userID,
		Name:        req.Name,
		Description: req.Description,
	}

	// Save classroom to repository (invite code generated automatically)
	if err := s.repo.CreateClassroom(ctx, classroom); err != nil {
		return nil, err
	}

	return classroom, nil
}

// GetClassrooms returns all classrooms created by the teacher
func (s *ClassroomService) GetClassrooms(ctx context.Context, userID int) ([]models.Classroom, error) {
	// Check user role
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "teacher" {
		return nil, errors.New("unauthorized: only teachers can view their classrooms")
	}

	return s.repo.GetClassroomsByTeacher(ctx, userID)
}

// GetClassroom returns a specific classroom with members and tests
func (s *ClassroomService) GetClassroom(ctx context.Context, userID, classroomID int) (*models.Classroom, error) {
	classroom, err := s.repo.GetClassroomByID(ctx, classroomID)
	if err != nil {
		return nil, err
	}

	if classroom == nil {
		return nil, errors.New("classroom not found")
	}

	// Check if user is the teacher or a member
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil {
		return nil, errors.New("unauthorized")
	}

	// Teachers can view their own classrooms
	if user.Role == "teacher" && classroom.TeacherID == userID {
		return classroom, nil
	}

	// Students can view classrooms they are members of
	if user.Role == "student" {
		for _, member := range classroom.Members {
			if member.ID == userID {
				return classroom, nil
			}
		}
	}

	return nil, errors.New("unauthorized: you don't have access to this classroom")
}

// JoinClassroom allows a student to join a classroom using an invite code
func (s *ClassroomService) JoinClassroom(ctx context.Context, userID int, req *models.JoinClassroomRequest) (*models.Classroom, error) {
	// Validate request
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}

	// Check user role
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "student" {
		return nil, errors.New("unauthorized: only students can join classrooms")
	}

	// Find classroom by invite code
	classroom, err := s.repo.GetClassroomByInviteCode(ctx, req.InviteCode)
	if err != nil {
		return nil, err
	}

	if classroom == nil {
		return nil, errors.New("invalid invite code")
	}

	// Join classroom
	if err := s.repo.JoinClassroom(ctx, classroom.ID, userID); err != nil {
		return nil, err
	}

	// Return full classroom details
	return s.repo.GetClassroomByID(ctx, classroom.ID)
}

// AssignTest assigns a test to a classroom
func (s *ClassroomService) AssignTest(ctx context.Context, userID, classroomID int, req *models.AssignTestRequest) error {
	// Validate request
	if err := s.validator.Struct(req); err != nil {
		return err
	}

	// Get classroom
	classroom, err := s.repo.GetClassroomByID(ctx, classroomID)
	if err != nil {
		return err
	}

	if classroom == nil || classroom.TeacherID != userID {
		return errors.New("classroom not found or unauthorized")
	}

	// Check if test exists and belongs to teacher
	test, err := s.testRepo.GetTestByID(ctx, req.TestID)
	if err != nil {
		return err
	}

	if test == nil || test.TeacherID != userID {
		return errors.New("test not found or unauthorized")
	}

	// Assign test to classroom
	return s.repo.AssignTestToClassroom(ctx, classroomID, req.TestID)
}

// GetClassroomResults returns test results for a classroom
func (s *ClassroomService) GetClassroomResults(ctx context.Context, userID, classroomID, testID int) ([]map[string]interface{}, error) {
	// Get classroom
	classroom, err := s.repo.GetClassroomByID(ctx, classroomID)
	if err != nil {
		return nil, err
	}

	if classroom == nil || classroom.TeacherID != userID {
		return nil, errors.New("classroom not found or unauthorized")
	}

	// Get results
	return s.repo.GetClassroomResults(ctx, classroomID, testID)
}

// GetStudentClassrooms returns all classrooms a student is a member of
func (s *ClassroomService) GetStudentClassrooms(ctx context.Context, userID int) ([]models.Classroom, error) {
	// Check user role
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "student" {
		return nil, errors.New("unauthorized: only students can view their classrooms")
	}

	return s.repo.GetClassroomsByStudent(ctx, userID)
}

// GetStudentTestDetails returns detailed test results including mistakes for a student
func (s *ClassroomService) GetStudentTestDetails(ctx context.Context, teacherID, studentID, testID int) (map[string]interface{}, error) {
	// Verify teacher owns the test
	test, err := s.testRepo.GetTestByID(ctx, testID)
	if err != nil {
		return nil, err
	}

	if test == nil || test.TeacherID != teacherID {
		return nil, errors.New("test not found or unauthorized")
	}

	// Get student test details
	return s.repo.GetStudentTestDetails(ctx, studentID, testID)
}

// SubmitTeacherTestResult allows a student to submit their test results
func (s *ClassroomService) SubmitTeacherTestResult(ctx context.Context, userID int, req *models.SubmitTestResultRequest) error {
	// Validate request
	if err := s.validator.Struct(req); err != nil {
		return err
	}

	// Verify user is a student
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "student" {
		return errors.New("unauthorized: only students can submit test results")
	}

	// Verify test exists
	test, err := s.testRepo.GetTestByID(ctx, req.TestID)
	if err != nil || test == nil {
		return errors.New("test not found")
	}

	// Calculate score
	totalQuestions := len(req.Answers)
	correctAnswers := 0
	var totalResponseTime float64

	for _, answer := range req.Answers {
		if answer["is_correct"].(bool) {
			correctAnswers++
		}
		if rt, ok := answer["response_time"].(float64); ok {
			totalResponseTime += rt
		}
	}

	score := (float64(correctAnswers) / float64(totalQuestions)) * 100
	avgResponseTime := totalResponseTime / float64(totalQuestions)

	// Submit result
	return s.repo.SubmitTeacherTestResult(ctx, userID, req.TestID, score, totalQuestions, correctAnswers, avgResponseTime, req.Answers)
}

// RemoveStudentFromClassroom removes a student from a classroom
func (s *ClassroomService) RemoveStudentFromClassroom(ctx context.Context, teacherID, classroomID, studentID int) error {
	// Get classroom
	classroom, err := s.repo.GetClassroomByID(ctx, classroomID)
	if err != nil {
		return err
	}

	if classroom == nil || classroom.TeacherID != teacherID {
		return errors.New("classroom not found or unauthorized")
	}

	return s.repo.RemoveStudentFromClassroom(ctx, classroomID, studentID)
}

// RemoveTestFromClassroom removes a test from a classroom
func (s *ClassroomService) RemoveTestFromClassroom(ctx context.Context, teacherID, classroomID, testID int) error {
	// Get classroom
	classroom, err := s.repo.GetClassroomByID(ctx, classroomID)
	if err != nil {
		return err
	}

	if classroom == nil || classroom.TeacherID != teacherID {
		return errors.New("classroom not found or unauthorized")
	}

	return s.repo.RemoveTestFromClassroom(ctx, classroomID, testID)
}
