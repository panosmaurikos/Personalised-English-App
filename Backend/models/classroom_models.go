package models

import "time"

type Classroom struct {
	ID          int       `json:"id"`
	TeacherID   int       `json:"teacher_id"`
	Name        string    `json:"name" validate:"required,min=1,max=100"`
	Description string    `json:"description" validate:"max=500"`
	InviteCode  string    `json:"invite_code"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Members     []User    `json:"members,omitempty"`
	Tests       []Test    `json:"tests,omitempty"`
}

type ClassroomMember struct {
	ClassroomID int       `json:"classroom_id"`
	UserID      int       `json:"user_id"`
	JoinedAt    time.Time `json:"joined_at"`
}

type CreateClassroomRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=100"`
	Description string `json:"description" validate:"max=500"`
}

type JoinClassroomRequest struct {
	InviteCode string `json:"invite_code" validate:"required,len=10"`
}

type AssignTestRequest struct {
	TestID int `json:"test_id" validate:"required,min=1"`
}
