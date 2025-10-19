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
        SELECT u.id, u.email, tr.score, tr.avg_response_time, tr.fuzzy_level, tr.taken_at
        FROM test_results_level tr
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
			FuzzyLevel      string
			TakenAt         time.Time
		}
		if err := rows.Scan(&r.UserID, &r.Email, &r.Score, &r.AvgResponseTime, &r.FuzzyLevel, &r.TakenAt); err != nil {
			return nil, err
		}
		results = append(results, map[string]interface{}{
			"user_id":      r.UserID,
			"email":        r.Email,
			"score":        r.Score,
			"avg_time":     r.AvgResponseTime,
			"level":        r.FuzzyLevel,
			"completed_at": r.TakenAt,
		})
	}
	return results, rows.Err()
}
func (r *ClassroomRepository) GetClassroomsByStudent(ctx context.Context, userID int) ([]models.Classroom, error) {
	query := `
        SELECT c.id, c.teacher_id, c.name, c.description, c.invite_code, c.created_at, c.updated_at
        FROM Classrooms c
        JOIN Classroom_members cm ON c.id = cm.classroom_id
        WHERE cm.user_id = $1
        ORDER BY c.created_at DESC`
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

func (r *ClassroomRepository) IsStudentInClassroom(ctx context.Context, classroomID, userID int) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM Classroom_members WHERE classroom_id = $1 AND user_id = $2`,
		classroomID, userID).Scan(&count)
	return count > 0, err
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
