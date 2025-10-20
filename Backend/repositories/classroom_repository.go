package repositories

import (
	"context"
	"database/sql"
	"math/rand"
	"time"

	"github.com/panosmaurikos/personalisedenglish/backend/models"
)

type ClassroomRepository struct {
	db *sql.DB
}

func NewClassroomRepository(db *sql.DB) *ClassroomRepository {
	return &ClassroomRepository{db: db}
}

func (r *ClassroomRepository) CreateClassroom(ctx context.Context, classroom *models.Classroom) error {
	// Generate a unique invite code
	classroom.InviteCode = generateInviteCode()
	query := `
        INSERT INTO Classrooms (teacher_id, name, description, invite_code, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, created_at, updated_at, invite_code`
	err := r.db.QueryRowContext(ctx, query, classroom.TeacherID, classroom.Name, classroom.Description, classroom.InviteCode).
		Scan(&classroom.ID, &classroom.CreatedAt, &classroom.UpdatedAt, &classroom.InviteCode)
	return err
}

func (r *ClassroomRepository) GetClassroomByInviteCode(ctx context.Context, inviteCode string) (*models.Classroom, error) {
	query := `
        SELECT id, teacher_id, name, description, invite_code, created_at, updated_at
        FROM Classrooms
        WHERE invite_code = $1`
	var c models.Classroom
	err := r.db.QueryRowContext(ctx, query, inviteCode).Scan(&c.ID, &c.TeacherID, &c.Name, &c.Description, &c.InviteCode, &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ClassroomRepository) GetClassroomsByTeacher(ctx context.Context, teacherID int) ([]models.Classroom, error) {
	query := `
        SELECT id, teacher_id, name, description, invite_code, created_at, updated_at
        FROM Classrooms
        WHERE teacher_id = $1
        ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, teacherID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	classrooms := []models.Classroom{}
	for rows.Next() {
		var c models.Classroom
		if err := rows.Scan(&c.ID, &c.TeacherID, &c.Name, &c.Description, &c.InviteCode, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}

		// Fetch members for this classroom
		mQuery := `
			SELECT u.id, u.email, u.role
			FROM Classroom_members cm
			JOIN users u ON cm.user_id = u.id
			WHERE cm.classroom_id = $1`
		mRows, err := r.db.QueryContext(ctx, mQuery, c.ID)
		if err != nil {
			return nil, err
		}
		for mRows.Next() {
			var u models.User
			if err := mRows.Scan(&u.ID, &u.Email, &u.Role); err != nil {
				mRows.Close()
				return nil, err
			}
			c.Members = append(c.Members, u)
		}
		mRows.Close()

		// Fetch tests for this classroom
		tQuery := `
			SELECT t.id, t.teacher_id, t.title, t.description, t.type, t.created_at, t.updated_at
			FROM Classroom_tests ct
			JOIN Teachers_tests t ON ct.test_id = t.id
			WHERE ct.classroom_id = $1`
		tRows, err := r.db.QueryContext(ctx, tQuery, c.ID)
		if err != nil {
			return nil, err
		}
		for tRows.Next() {
			var t models.Test
			if err := tRows.Scan(&t.ID, &t.TeacherID, &t.Title, &t.Description, &t.Type, &t.CreatedAt, &t.UpdatedAt); err != nil {
				tRows.Close()
				return nil, err
			}
			c.Tests = append(c.Tests, t)
		}
		tRows.Close()

		classrooms = append(classrooms, c)
	}
	return classrooms, rows.Err()
}

func (r *ClassroomRepository) GetClassroomByID(ctx context.Context, id int) (*models.Classroom, error) {
	query := `
        SELECT id, teacher_id, name, description, invite_code, created_at, updated_at
        FROM Classrooms
        WHERE id = $1`
	var c models.Classroom
	err := r.db.QueryRowContext(ctx, query, id).Scan(&c.ID, &c.TeacherID, &c.Name, &c.Description, &c.InviteCode, &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	// Fetch members
	mQuery := `
        SELECT u.id, u.email, u.role
        FROM Classroom_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.classroom_id = $1`
	rows, err := r.db.QueryContext(ctx, mQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Email, &u.Role); err != nil {
			return nil, err
		}
		c.Members = append(c.Members, u)
	}
	// Fetch tests
	tQuery := `
        SELECT t.id, t.teacher_id, t.title, t.description, t.type, t.created_at, t.updated_at
        FROM Classroom_tests ct
        JOIN Teachers_tests t ON ct.test_id = t.id
        WHERE ct.classroom_id = $1`
	tRows, err := r.db.QueryContext(ctx, tQuery, id)
	if err != nil {
		return nil, err
	}
	defer tRows.Close()
	for tRows.Next() {
		var t models.Test
		if err := tRows.Scan(&t.ID, &t.TeacherID, &t.Title, &t.Description, &t.Type, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		c.Tests = append(c.Tests, t)
	}
	return &c, nil
}

func (r *ClassroomRepository) JoinClassroom(ctx context.Context, classroomID, userID int) error {
	query := `
        INSERT INTO Classroom_members (classroom_id, user_id, joined_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, classroomID, userID)
	return err
}

func (r *ClassroomRepository) AssignTestToClassroom(ctx context.Context, classroomID, testID int) error {
	query := `
        INSERT INTO Classroom_tests (classroom_id, test_id, assigned_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, classroomID, testID)
	return err
}

func (r *ClassroomRepository) GetClassroomResults(ctx context.Context, classroomID, testID int) ([]map[string]interface{}, error) {
	query := `
        SELECT u.id, u.email, tr.score, tr.avg_response_time, tr.total_questions, tr.correct_answers, tr.taken_at
        FROM Teacher_test_results tr
        JOIN users u ON tr.user_id = u.id
        JOIN Classroom_members cm ON cm.user_id = u.id
        WHERE cm.classroom_id = $1 AND tr.test_id = $2
        ORDER BY tr.taken_at DESC`
	rows, err := r.db.QueryContext(ctx, query, classroomID, testID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	results := []map[string]interface{}{}
	for rows.Next() {
		var r struct {
			UserID          int
			Email           string
			Score           float64
			AvgResponseTime float64
			TotalQuestions  int
			CorrectAnswers  int
			TakenAt         time.Time
		}
		if err := rows.Scan(&r.UserID, &r.Email, &r.Score, &r.AvgResponseTime, &r.TotalQuestions, &r.CorrectAnswers, &r.TakenAt); err != nil {
			return nil, err
		}
		results = append(results, map[string]interface{}{
			"user_id":         r.UserID,
			"email":           r.Email,
			"score":           r.Score,
			"avg_time":        r.AvgResponseTime,
			"total_questions": r.TotalQuestions,
			"correct_answers": r.CorrectAnswers,
			"completed_at":    r.TakenAt,
		})
	}
	return results, rows.Err()
}

func (r *ClassroomRepository) GetStudentTestDetails(ctx context.Context, userID, testID int) (map[string]interface{}, error) {
	// Get test result
	var result struct {
		ID              int
		Score           float64
		TotalQuestions  int
		CorrectAnswers  int
		AvgResponseTime float64
		TakenAt         time.Time
	}
	resultQuery := `
        SELECT id, score, total_questions, correct_answers, avg_response_time, taken_at
        FROM Teacher_test_results
        WHERE user_id = $1 AND test_id = $2
        ORDER BY taken_at DESC
        LIMIT 1`
	err := r.db.QueryRowContext(ctx, resultQuery, userID, testID).Scan(
		&result.ID, &result.Score, &result.TotalQuestions, &result.CorrectAnswers,
		&result.AvgResponseTime, &result.TakenAt,
	)
	if err != nil {
		return nil, err
	}

	// Get individual answers with question details
	answersQuery := `
        SELECT
            tq.id, tq.question_text, tq.question_type, tq.options,
            tq.correct_answer, tq.points,
            tta.selected_answer, tta.is_correct, tta.response_time
        FROM Teacher_test_answers tta
        JOIN Teachers_questions tq ON tta.question_id = tq.id
        WHERE tta.result_id = $1
        ORDER BY tq.order_index`
	rows, err := r.db.QueryContext(ctx, answersQuery, result.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	answers := []map[string]interface{}{}
	for rows.Next() {
		var a struct {
			QuestionID     int
			QuestionText   string
			QuestionType   string
			Options        string
			CorrectAnswer  string
			Points         int
			SelectedAnswer string
			IsCorrect      bool
			ResponseTime   float64
		}
		if err := rows.Scan(&a.QuestionID, &a.QuestionText, &a.QuestionType, &a.Options,
			&a.CorrectAnswer, &a.Points, &a.SelectedAnswer, &a.IsCorrect, &a.ResponseTime); err != nil {
			return nil, err
		}
		answers = append(answers, map[string]interface{}{
			"question_id":     a.QuestionID,
			"question_text":   a.QuestionText,
			"question_type":   a.QuestionType,
			"options":         a.Options,
			"correct_answer":  a.CorrectAnswer,
			"points":          a.Points,
			"selected_answer": a.SelectedAnswer,
			"is_correct":      a.IsCorrect,
			"response_time":   a.ResponseTime,
		})
	}

	return map[string]interface{}{
		"score":           result.Score,
		"total_questions": result.TotalQuestions,
		"correct_answers": result.CorrectAnswers,
		"avg_time":        result.AvgResponseTime,
		"completed_at":    result.TakenAt,
		"answers":         answers,
	}, rows.Err()
}

func (r *ClassroomRepository) GetClassroomsByStudent(ctx context.Context, userID int) ([]models.Classroom, error) {
	query := `
        SELECT c.id, c.teacher_id, c.name, c.description, c.invite_code, c.created_at, c.updated_at
        FROM Classrooms c
        JOIN Classroom_members cm ON c.id = cm.classroom_id
        WHERE cm.user_id = $1
        ORDER BY cm.joined_at DESC`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	classrooms := []models.Classroom{}
	for rows.Next() {
		var c models.Classroom
		if err := rows.Scan(&c.ID, &c.TeacherID, &c.Name, &c.Description, &c.InviteCode, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		classrooms = append(classrooms, c)
	}
	return classrooms, rows.Err()
}

func (r *ClassroomRepository) SubmitTeacherTestResult(ctx context.Context, userID, testID int, score float64, totalQuestions, correctAnswers int, avgResponseTime float64, answers []map[string]interface{}) error {
	// Start transaction
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert test result
	var resultID int
	resultQuery := `
        INSERT INTO Teacher_test_results (user_id, test_id, score, total_questions, correct_answers, avg_response_time, taken_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id`
	err = tx.QueryRowContext(ctx, resultQuery, userID, testID, score, totalQuestions, correctAnswers, avgResponseTime).Scan(&resultID)
	if err != nil {
		return err
	}

	// Insert individual answers
	answerQuery := `
        INSERT INTO Teacher_test_answers (result_id, question_id, selected_answer, is_correct, response_time, answered_at)
        VALUES ($1, $2, $3, $4, $5, NOW())`
	for _, answer := range answers {
		_, err = tx.ExecContext(ctx, answerQuery,
			resultID,
			answer["question_id"],
			answer["selected_answer"],
			answer["is_correct"],
			answer["response_time"],
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *ClassroomRepository) RemoveStudentFromClassroom(ctx context.Context, classroomID, userID int) error {
	query := `DELETE FROM Classroom_members WHERE classroom_id = $1 AND user_id = $2`
	_, err := r.db.ExecContext(ctx, query, classroomID, userID)
	return err
}

func (r *ClassroomRepository) RemoveTestFromClassroom(ctx context.Context, classroomID, testID int) error {
	query := `DELETE FROM Classroom_tests WHERE classroom_id = $1 AND test_id = $2`
	_, err := r.db.ExecContext(ctx, query, classroomID, testID)
	return err
}

// Helper function to generate a random invite code
func generateInviteCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, 10)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
