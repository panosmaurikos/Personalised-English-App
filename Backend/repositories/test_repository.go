package repositories

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/panosmaurikos/personalisedenglish/backend/models"
)

type TestRepository struct {
	db *sql.DB
}

func NewTestRepository(db *sql.DB) *TestRepository {
	return &TestRepository{db: db}
}

func (r *TestRepository) CreateTest(ctx context.Context, test *models.Test) error {
	query := `
		INSERT INTO Teachers_tests (teacher_id, title, description, type, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at`
	err := r.db.QueryRowContext(ctx, query, test.TeacherID, test.Title, test.Description, test.Type).Scan(&test.ID, &test.CreatedAt, &test.UpdatedAt)
	if err != nil {
		return err
	}

	for i := range test.Questions {
		q := &test.Questions[i]
		q.TestID = test.ID
		q.OrderIndex = i
		err := r.CreateQuestion(ctx, q)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *TestRepository) CreateQuestion(ctx context.Context, q *models.Question) error {
	optionsJSON, err := json.Marshal(q.Options)
	if err != nil {
		return err
	}
	query := `
		INSERT INTO Teachers_questions (test_id, question_text, question_type, options, correct_answer, points, order_index)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id`
	return r.db.QueryRowContext(ctx, query, q.TestID, q.QuestionText, q.QuestionType, optionsJSON, q.CorrectAnswer, q.Points, q.OrderIndex).Scan(&q.ID)
}

func (r *TestRepository) GetTestsByTeacher(ctx context.Context, teacherID int) ([]models.Test, error) {
	query := `
		SELECT id, title, description, type, created_at, updated_at
		FROM Teachers_tests
		WHERE teacher_id = $1
		ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, teacherID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tests := []models.Test{}
	for rows.Next() {
		var t models.Test
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Type, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		t.TeacherID = teacherID
		tests = append(tests, t)
	}
	return tests, rows.Err()
}

func (r *TestRepository) GetTestByID(ctx context.Context, id int) (*models.Test, error) {
	query := `
		SELECT id, teacher_id, title, description, type, created_at, updated_at
		FROM Teachers_tests  
		WHERE id = $1`
	var t models.Test
	err := r.db.QueryRowContext(ctx, query, id).Scan(&t.ID, &t.TeacherID, &t.Title, &t.Description, &t.Type, &t.CreatedAt, &t.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	qQuery := `
		SELECT id, question_text, question_type, options, correct_answer, points, order_index
		FROM Teachers_questions
		WHERE test_id = $1
		ORDER BY order_index ASC`
	rows, err := r.db.QueryContext(ctx, qQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var q models.Question
		var optionsBytes []byte
		if err := rows.Scan(&q.ID, &q.QuestionText, &q.QuestionType, &optionsBytes, &q.CorrectAnswer, &q.Points, &q.OrderIndex); err != nil {
			return nil, err
		}
		q.TestID = id
		// Unmarshal options JSON
		if err := json.Unmarshal(optionsBytes, &q.Options); err != nil {
			return nil, err
		}
		t.Questions = append(t.Questions, q)
	}
	return &t, rows.Err()
}

func (r *TestRepository) UpdateTest(ctx context.Context, test *models.Test) error {
	query := `
		UPDATE Teachers_tests  
		SET title = $1, description = $2, type = $3, updated_at = NOW()
		WHERE id = $4`
	_, err := r.db.ExecContext(ctx, query, test.Title, test.Description, test.Type, test.ID)
	if err != nil {
		return err
	}

	// Delete existing questions
	delQuery := `DELETE FROM Teachers_questions WHERE test_id = $1`
	_, err = r.db.ExecContext(ctx, delQuery, test.ID)
	if err != nil {
		return err
	}

	// Insert updated questions
	for i := range test.Questions {
		q := &test.Questions[i]
		q.TestID = test.ID
		q.OrderIndex = i
		err := r.CreateQuestion(ctx, q)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *TestRepository) DeleteTest(ctx context.Context, id int) error {
	// Delete questions first
	delQuestions := `DELETE FROM Teachers_questions WHERE test_id = $1`
	_, err := r.db.ExecContext(ctx, delQuestions, id)
	if err != nil {
		return err
	}

	// Then delete test
	query := `DELETE FROM Teachers_tests WHERE id = $1`
	_, err = r.db.ExecContext(ctx, query, id)
	return err
}
