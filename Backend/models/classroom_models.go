package models

import "time"

// Classroom represents a teacher's classroom
type Classroom struct {
	ID          int       `json:"id"`
	TeacherID   int       `json:"teacher_id"`
	Name        string    `json:"name" validate:"required,min=1,max=255"`
	Description string    `json:"description" validate:"max=1000"`
	InviteCode  string    `json:"invite_code"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Members     []User    `json:"members,omitempty"`
	Tests       []Test    `json:"tests,omitempty"`
}

// CreateClassroomRequest represents the request to create a classroom
type CreateClassroomRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"max=1000"`
}

// JoinClassroomRequest represents the request to join a classroom
type JoinClassroomRequest struct {
	InviteCode string `json:"invite_code" validate:"required,len=10"`
}

// AssignTestRequest represents the request to assign a test to a classroom
type AssignTestRequest struct {
	TestID int `json:"test_id" validate:"required,min=1"`
}

// SubmitTestResultRequest represents a student's test submission
type SubmitTestResultRequest struct {
	TestID  int                      `json:"test_id" validate:"required,min=1"`
	Answers []map[string]interface{} `json:"answers" validate:"required,min=1"`
}
