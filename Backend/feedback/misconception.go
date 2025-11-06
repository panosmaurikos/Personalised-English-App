// feedback/misconception.go
package feedback

import (
	"database/sql"
)

// Misconception represents a detected weakness in a specific category
type Misconception struct {
	Category       string  `json:"category"`
	Percentage     float64 `json:"percentage"`
	WrongQuestions []int   `json:"wrong_questions"` // Προσθήκη του πεδίου για τα λάθη
}

// DetectMisconceptions identifies weaknesses based on test results and fetches wrong question IDs
func DetectMisconceptions(db *sql.DB, testResultID int) ([]Misconception, error) {
	// Get mistake counts by category for this specific test
	rows, err := db.Query(`
		SELECT pq.category, COUNT(*) as mistake_count
		FROM test_answers ta
		JOIN placement_questions pq ON ta.question_id = pq.id
		WHERE ta.test_result_id = $1 AND ta.is_correct = FALSE
		GROUP BY pq.category
		ORDER BY mistake_count DESC
	`, testResultID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Calculate total mistakes for this test
	var totalMistakes int
	mistakeCounts := make(map[string]int)
	
	for rows.Next() {
		var category string
		var count int
		if err := rows.Scan(&category, &count); err != nil {
			return nil, err
		}
		mistakeCounts[category] = count
		totalMistakes += count
	}

	// If no mistakes, return empty
	if totalMistakes == 0 {
		return []Misconception{}, nil
	}

	// Calculate percentages and create misconceptions
	misconceptions := []Misconception{}
	for category, count := range mistakeCounts {
		percentage := float64(count) / float64(totalMistakes) * 100
		misconceptions = append(misconceptions, Misconception{
			Category:   category,
			Percentage: percentage,
		})
	}

	// Fetch wrong question IDs for each detected misconception
	for i, m := range misconceptions {
		rows, err := db.Query(`
            SELECT q.id
            FROM test_answers ua
            JOIN placement_questions q ON ua.question_id = q.id
            WHERE ua.test_result_id = $1 AND ua.is_correct = false AND q.category = $2`,
			testResultID, m.Category)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		var wrongQuestions []int
		for rows.Next() {
			var qID int
			if err := rows.Scan(&qID); err != nil {
				rows.Close()
				return nil, err
			}
			wrongQuestions = append(wrongQuestions, qID)
		}
		if err = rows.Err(); err != nil {
			return nil, err
		}
		misconceptions[i].WrongQuestions = wrongQuestions
	}

	return misconceptions, nil
}
