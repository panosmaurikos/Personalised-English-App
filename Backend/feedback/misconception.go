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
	var vocabPct, grammarPct, readingPct, listeningPct *float64
	err := db.QueryRow(`
        SELECT vocabulary_pct, grammar_pct, reading_pct, listening_pct
        FROM test_results_level WHERE id = $1`, testResultID).Scan(&vocabPct, &grammarPct, &readingPct, &listeningPct)
	if err != nil {
		return nil, err
	}

	misconceptions := []Misconception{}
	if vocabPct != nil && *vocabPct < 60 {
		misconceptions = append(misconceptions, Misconception{Category: "vocabulary", Percentage: *vocabPct})
	}
	if grammarPct != nil && *grammarPct < 60 {
		misconceptions = append(misconceptions, Misconception{Category: "grammar", Percentage: *grammarPct})
	}
	if readingPct != nil && *readingPct < 60 {
		misconceptions = append(misconceptions, Misconception{Category: "reading", Percentage: *readingPct})
	}
	if listeningPct != nil && *listeningPct < 60 {
		misconceptions = append(misconceptions, Misconception{Category: "listening", Percentage: *listeningPct})
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
