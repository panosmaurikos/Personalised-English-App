package models

import "time"

type Test struct {
	ID          int        `json:"id"`
	TeacherID   int        `json:"teacher_id"`
	Title       string     `json:"title" validate:"required,min=1,max=255"`
	Description string     `json:"description" validate:"max=1000"`
	Type        string     `json:"type" validate:"required,oneof=vocabulary grammar reading listening mixed"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Questions   []Question `json:"questions,omitempty"`
}

type Question struct {
	ID            int               `json:"id"`
	TestID        int               `json:"test_id"`
	QuestionText  string            `json:"question_text" validate:"required"`
	QuestionType  string            `json:"question_type" validate:"required,oneof=vocabulary grammar reading listening"`
	Options       map[string]string `json:"options" validate:"required"`
	CorrectAnswer string            `json:"correct_answer" validate:"required,oneof=A B C D"`
	Points        int               `json:"points" validate:"required,min=1,max=10"`
	OrderIndex    int               `json:"order_index"`
}

type CreateTestRequest struct {
	Title       string     `json:"title" validate:"required,min=1,max=255"`
	Description string     `json:"description" validate:"max=1000"`
	Type        string     `json:"type" validate:"required,oneof=vocabulary grammar reading listening mixed"`
	Questions   []Question `json:"questions" validate:"required,dive"`
}

type UpdateTestRequest struct {
	Title       string     `json:"title" validate:"omitempty,min=1,max=255"`
	Description string     `json:"description" validate:"omitempty,max=1000"`
	Type        string     `json:"type" validate:"omitempty,oneof=vocabulary grammar reading listening mixed"`
	Questions   []Question `json:"questions" validate:"omitempty,dive"`
}
