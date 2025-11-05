// backend/personalization/learning_style.go
package personalization

import (
	"database/sql"
	"fmt"
	"time"
)

// QuestionType represents the format of a question
type QuestionType string

const (
	MultipleChoice QuestionType = "multiple_choice"
	FillInBlank    QuestionType = "fill_in_blank"
	TrueFalse      QuestionType = "true_false"
	Matching       QuestionType = "matching"
	ShortAnswer    QuestionType = "short_answer"
)

// LearningPreference tracks a student's performance with a specific question type
type LearningPreference struct {
	ID               int
	UserID           int
	QuestionType     string
	Category         string
	TotalAttempts    int
	CorrectAttempts  int
	AvgResponseTime  float64
	SuccessRate      float64
	LastUpdated      time.Time
}

// LearningStyleAnalyzer provides methods for analyzing and adapting to student learning preferences
type LearningStyleAnalyzer struct {
	db *sql.DB
}

// NewLearningStyleAnalyzer creates a new analyzer instance
func NewLearningStyleAnalyzer(db *sql.DB) *LearningStyleAnalyzer {
	return &LearningStyleAnalyzer{db: db}
}

// UpdatePreference updates or creates a learning preference record
func (lsa *LearningStyleAnalyzer) UpdatePreference(userID int, questionType, category string, isCorrect bool, responseTime float64) error {
	// First, try to get existing preference
	var pref LearningPreference
	err := lsa.db.QueryRow(`
		SELECT id, total_attempts, correct_attempts, avg_response_time
		FROM learning_preferences
		WHERE user_id = $1 AND question_type = $2 AND category = $3
	`, userID, questionType, category).Scan(&pref.ID, &pref.TotalAttempts, &pref.CorrectAttempts, &pref.AvgResponseTime)

	if err == sql.ErrNoRows {
		// Create new preference record
		correctCount := 0
		if isCorrect {
			correctCount = 1
		}
		successRate := float64(correctCount) / 1.0 * 100

		_, err = lsa.db.Exec(`
			INSERT INTO learning_preferences
			(user_id, question_type, category, total_attempts, correct_attempts, avg_response_time, success_rate, last_updated)
			VALUES ($1, $2, $3, 1, $4, $5, $6, NOW())
		`, userID, questionType, category, correctCount, responseTime, successRate)
		return err
	} else if err != nil {
		return err
	}

	// Update existing preference
	newTotal := pref.TotalAttempts + 1
	newCorrect := pref.CorrectAttempts
	if isCorrect {
		newCorrect++
	}

	// Calculate new average response time (weighted average)
	newAvgTime := ((pref.AvgResponseTime * float64(pref.TotalAttempts)) + responseTime) / float64(newTotal)
	newSuccessRate := (float64(newCorrect) / float64(newTotal)) * 100

	_, err = lsa.db.Exec(`
		UPDATE learning_preferences
		SET total_attempts = $1, correct_attempts = $2, avg_response_time = $3, success_rate = $4, last_updated = NOW()
		WHERE id = $5
	`, newTotal, newCorrect, newAvgTime, newSuccessRate, pref.ID)

	return err
}

// GetBestQuestionType determines the optimal question type for a user and category
// Returns the question type with the highest success rate and reasonable response time
func (lsa *LearningStyleAnalyzer) GetBestQuestionType(userID int, category string) (string, error) {
	// Minimum attempts required before we trust the data
	const minAttempts = 3

	// Query to find the best performing question type for this user and category
	var bestType string
	err := lsa.db.QueryRow(`
		SELECT question_type
		FROM learning_preferences
		WHERE user_id = $1 AND category = $2 AND total_attempts >= $3
		ORDER BY
			success_rate DESC,
			avg_response_time ASC
		LIMIT 1
	`, userID, category, minAttempts).Scan(&bestType)

	if err == sql.ErrNoRows {
		// No data yet, default to multiple choice
		return string(MultipleChoice), nil
	} else if err != nil {
		return "", err
	}

	return bestType, nil
}

// GetPreferencesByUser retrieves all learning preferences for a user
func (lsa *LearningStyleAnalyzer) GetPreferencesByUser(userID int) ([]LearningPreference, error) {
	rows, err := lsa.db.Query(`
		SELECT id, user_id, question_type, category, total_attempts, correct_attempts,
		       avg_response_time, success_rate, last_updated
		FROM learning_preferences
		WHERE user_id = $1
		ORDER BY category, success_rate DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prefs []LearningPreference
	for rows.Next() {
		var p LearningPreference
		err := rows.Scan(&p.ID, &p.UserID, &p.QuestionType, &p.Category, &p.TotalAttempts,
			&p.CorrectAttempts, &p.AvgResponseTime, &p.SuccessRate, &p.LastUpdated)
		if err != nil {
			return nil, err
		}
		prefs = append(prefs, p)
	}

	return prefs, rows.Err()
}

// GetRecommendedQuestionTypes returns a map of category -> recommended question type
func (lsa *LearningStyleAnalyzer) GetRecommendedQuestionTypes(userID int) (map[string]string, error) {
	categories := []string{"grammar", "vocabulary", "reading", "listening", "speaking"}
	recommendations := make(map[string]string)

	for _, category := range categories {
		qType, err := lsa.GetBestQuestionType(userID, category)
		if err != nil {
			return nil, fmt.Errorf("error getting best type for %s: %w", category, err)
		}
		recommendations[category] = qType
	}

	return recommendations, nil
}

// AnalyzeOverallLearningStyle provides a summary of how a student learns best
func (lsa *LearningStyleAnalyzer) AnalyzeOverallLearningStyle(userID int) (map[string]interface{}, error) {
	prefs, err := lsa.GetPreferencesByUser(userID)
	if err != nil {
		return nil, err
	}

	if len(prefs) == 0 {
		return map[string]interface{}{
			"status": "insufficient_data",
			"message": "Not enough data to analyze learning style yet",
		}, nil
	}

	// Calculate overall statistics
	typeStats := make(map[string]struct {
		totalAttempts int
		successRate   float64
		avgTime       float64
	})

	for _, p := range prefs {
		stats := typeStats[p.QuestionType]
		stats.totalAttempts += p.TotalAttempts
		stats.successRate += p.SuccessRate
		stats.avgTime += p.AvgResponseTime
		typeStats[p.QuestionType] = stats
	}

	// Find the best overall question type
	var bestType string
	var bestScore float64 = 0

	for qType, stats := range typeStats {
		// Composite score: higher success rate and lower response time is better
		avgSuccess := stats.successRate / float64(len(prefs))
		avgTime := stats.avgTime / float64(len(prefs))

		// Normalize and combine (success rate weighted more heavily)
		score := (avgSuccess * 0.7) + ((20.0 - avgTime) / 20.0 * 100 * 0.3)

		if score > bestScore {
			bestScore = score
			bestType = qType
		}
	}

	// Get recommendations per category
	recommendations, _ := lsa.GetRecommendedQuestionTypes(userID)

	// Calculate overall success rate for best type
	var overallSuccessRate float64
	if stats, ok := typeStats[bestType]; ok {
		overallSuccessRate = stats.successRate / float64(len(prefs)) / 100 // Convert to 0-1 range
	}

	return map[string]interface{}{
		"status":               "analyzed",
		"best_question_type":   bestType,
		"overall_best_type":    bestType, // Add this for Dashboard compatibility
		"overall_success_rate": overallSuccessRate,
		"overall_score":        bestScore,
		"recommendations":      recommendations, // Add this for Dashboard
		"preferences":          prefs,
		"type_statistics":      typeStats,
	}, nil
}
