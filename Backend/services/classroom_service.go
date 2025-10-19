package services

import (
	"context"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/panosmaurikos/personalisedenglish/backend/models"
	"github.com/panosmaurikos/personalisedenglish/backend/repositories"
)

type ClassroomService struct {
	repo      *repositories.ClassroomRepository
	userRepo  *repositories.UserRepository
	testRepo  *repositories.TestRepository
	validator *validator.Validate
}

func NewClassroomService(repo *repositories.ClassroomRepository, userRepo *repositories.UserRepository, testRepo *repositories.TestRepository) *ClassroomService {
	return &ClassroomService{
		repo:      repo,
		userRepo:  userRepo,
		testRepo:  testRepo,
		validator: validator.New(),
	}
}

// ΠΡΟΣΘΗΚΗ: GetStudentClassrooms method
func (s *ClassroomService) GetStudentClassrooms(ctx context.Context, userID int) ([]models.Classroom, error) {
	return s.repo.GetClassroomsByStudent(ctx, userID)
}

func (s *ClassroomService) CreateClassroom(ctx context.Context, userID int, req *models.CreateClassroomRequest) (*models.Classroom, error) {
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "teacher" {
		return nil, errors.New("unauthorized: only teachers can create classrooms")
	}
	classroom := &models.Classroom{
		TeacherID:   userID,
		Name:        req.Name,
		Description: req.Description,
	}
	if err := s.repo.CreateClassroom(ctx, classroom); err != nil {
		return nil, err
	}
	return classroom, nil
}

func (s *ClassroomService) JoinClassroom(ctx context.Context, userID int, req *models.JoinClassroomRequest) (*models.Classroom, error) {
	if err := s.validator.Struct(req); err != nil {
		return nil, err
	}
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != "student" {
		return nil, errors.New("unauthorized: only students can join classrooms")
	}
	classroom, err := s.repo.GetClassroomByInviteCode(ctx, req.InviteCode)
	if err != nil {
		return nil, err
	}
	if classroom == nil {
		return nil, errors.New("invalid invite code")
	}
	if err := s.repo.JoinClassroom(ctx, classroom.ID, userID); err != nil {
		return nil, err
	}
	return classroom, nil
}

// ΔΙΟΡΘΩΣΗ: Χρησιμοποίησε repository methods
func (s *ClassroomService) GetClassrooms(ctx context.Context, userID int) ([]models.Classroom, error) {
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil {
		return nil, errors.New("unauthorized")
	}
	if user.Role == "teacher" {
		return s.repo.GetClassroomsByTeacher(ctx, userID)
	}
	// For students, use repository method
	return s.repo.GetClassroomsByStudent(ctx, userID)
}

// ΔΙΟΡΘΩΣΗ: Χρησιμοποίησε repository methods
func (s *ClassroomService) GetClassroom(ctx context.Context, userID, classroomID int) (*models.Classroom, error) {
	classroom, err := s.repo.GetClassroomByID(ctx, classroomID)
	if err != nil {
		return nil, err
	}
	if classroom == nil {
		return nil, errors.New("classroom not found")
	}
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil {
		return nil, errors.New("unauthorized")
	}
	if user.Role == "teacher" && classroom.TeacherID != userID {
		return nil, errors.New("unauthorized: not the classroom teacher")
	}
	if user.Role == "student" {
		// Check if student is a member using repository method
		isMember, err := s.repo.IsStudentInClassroom(ctx, classroomID, userID)
		if err != nil || !isMember {
			return nil, errors.New("unauthorized: not a classroom member")
		}
	}
	return classroom, nil
}

func (s *ClassroomService) AssignTest(ctx context.Context, userID, classroomID, testID int) error {
	classroom, err := s.GetClassroom(ctx, userID, classroomID)
	if err != nil {
		return err
	}
	if classroom.TeacherID != userID {
		return errors.New("unauthorized: only the classroom teacher can assign tests")
	}
	test, err := s.testRepo.GetTestByID(ctx, testID)
	if err != nil {
		return err
	}
	if test == nil || test.TeacherID != userID {
		return errors.New("test not found or unauthorized")
	}
	return s.repo.AssignTestToClassroom(ctx, classroomID, testID)
}

func (s *ClassroomService) GetClassroomResults(ctx context.Context, userID, classroomID, testID int) ([]map[string]interface{}, error) {
	classroom, err := s.GetClassroom(ctx, userID, classroomID)
	if err != nil {
		return nil, err
	}
	if classroom.TeacherID != userID {
		return nil, errors.New("unauthorized: only the classroom teacher can view results")
	}
	return s.repo.GetClassroomResults(ctx, classroomID, testID)
}
