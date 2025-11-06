package router

import (
	"database/sql"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"sort"
	"strconv"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/lib/pq"
	"github.com/panosmaurikos/personalisedenglish/backend/api"
	"github.com/panosmaurikos/personalisedenglish/backend/feedback"
	"github.com/panosmaurikos/personalisedenglish/backend/fuzzylogic"
	"github.com/panosmaurikos/personalisedenglish/backend/models"
	"github.com/panosmaurikos/personalisedenglish/backend/personalization"
	"github.com/panosmaurikos/personalisedenglish/backend/services"
	"github.com/rs/cors"
)

// Helper function to get absolute value of an integer
func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) SetupRouter(
	registerHandler http.Handler,
	loginHandler http.Handler,
	forgotPasswordHandler http.Handler,
	resetPasswordOTPHandler http.Handler,
	testService *services.TestService,
	classroomService *services.ClassroomService,
	db *sql.DB,
) http.Handler {
	r := mux.NewRouter()
	r.Handle("/register", registerHandler).Methods("POST")
	r.Handle("/login", loginHandler).Methods("POST")
	r.Handle("/forgot-password", forgotPasswordHandler).Methods("POST")
	r.Handle("/reset-password", resetPasswordOTPHandler).Methods("POST")

	r.HandleFunc("/placement-questions", func(w http.ResponseWriter, r *http.Request) {
		limit := 20

		// Try to get userID from token (optional - works for both logged in and anonymous users)
		var userID int
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" && len(authHeader) > 7 {
			tokenString := authHeader[7:] // Remove "Bearer " prefix
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				return []byte("your-secret-key"), nil
			})
			if err == nil && token.Valid {
				if claims, ok := token.Claims.(jwt.MapClaims); ok {
					if id, ok := claims["user_id"].(float64); ok {
						userID = int(id)
					}
				}
			}
		}

		rows, err := db.Query(`SELECT id, question_text, question_type, options, correct_answer, points, category FROM placement_questions ORDER BY RANDOM() LIMIT $1`, limit)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch questions"}`, http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		var questions []map[string]interface{}

		// Get user's learning preferences if logged in
		var preferences map[string]string
		if userID > 0 {
			learningAnalyzer := personalization.NewLearningStyleAnalyzer(db)
			preferences, _ = learningAnalyzer.GetRecommendedQuestionTypes(userID)
		}

		for rows.Next() {
			var q struct {
				ID            int
				QuestionText  string
				QuestionType  string
				Options       []byte
				CorrectAnswer string
				Points        int
				Category      string
			}
			if err := rows.Scan(&q.ID, &q.QuestionText, &q.QuestionType, &q.Options, &q.CorrectAnswer, &q.Points, &q.Category); err != nil {
				http.Error(w, `{"error": "Failed to scan question"}`, http.StatusInternalServerError)
				return
			}

			// Check if there's a better alternative for this question based on user preferences
			finalQuestion := q.QuestionText
			finalType := q.QuestionType
			finalOptions := q.Options
			finalAnswer := q.CorrectAnswer

			if userID > 0 && preferences != nil {
				preferredType, hasPreference := preferences[q.Category]
				if hasPreference && preferredType != q.QuestionType {
					// Look for alternative question with preferred type
					var altText string
					var altOptions []byte
					var altAnswer string
					err := db.QueryRow(`
						SELECT question_text, options, correct_answer
						FROM question_alternatives
						WHERE base_question_id = $1 AND question_type = $2
						LIMIT 1
					`, q.ID, preferredType).Scan(&altText, &altOptions, &altAnswer)

					if err == nil {
						// Use alternative question
						finalQuestion = altText
						finalType = preferredType
						finalOptions = altOptions
						finalAnswer = altAnswer
					}
				}
			}

			var opts []string
			_ = json.Unmarshal(finalOptions, &opts)
			questions = append(questions, map[string]interface{}{
				"id":       q.ID,
				"question": finalQuestion,
				"type":     finalType,
				"options":  opts,
				"answer":   finalAnswer,
				"points":   q.Points,
				"category": q.Category,
			})
		}
		json.NewEncoder(w).Encode(questions)
	}).Methods("GET")

	// Apply AuthMiddleware to protected routes
	protectedRouter := r.PathPrefix("/").Subrouter()
	protectedRouter.Use(api.AuthMiddleware)

	// Current user info endpoint
	protectedRouter.HandleFunc("/user", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}
		var username, email, role string
		err := db.QueryRow("SELECT username, email, role FROM users WHERE id = $1", userID).Scan(&username, &email, &role)
		if err != nil {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(map[string]interface{}{
			"username": username,
			"email":    email,
			"role":     role,
		})
	}).Methods("GET")

	// Personalized practice questions endpoint - ALWAYS uses learning preferences
	protectedRouter.HandleFunc("/personalized-practice-questions", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		limit := 20

		// Get user's learning preferences
		learningAnalyzer := personalization.NewLearningStyleAnalyzer(db)
		preferences, err := learningAnalyzer.GetRecommendedQuestionTypes(userID)
		if err != nil {
			log.Printf("Warning: Failed to get recommendations: %v", err)
		}

		// Get user's mistake counts by category to weight question distribution
		mistakeRows, err := db.Query(`
			SELECT pq.category, COUNT(*) as mistake_count
			FROM test_answers ta
			JOIN placement_questions pq ON ta.question_id = pq.id
			WHERE ta.user_id = $1 AND ta.is_correct = FALSE
			GROUP BY pq.category
			ORDER BY mistake_count DESC
		`, userID)
		if err != nil {
			log.Printf("Warning: Failed to get mistake counts: %v", err)
		}

		// Build mistake count map and calculate total mistakes
		mistakeCounts := make(map[string]int)
		totalMistakes := 0
		if mistakeRows != nil {
			defer mistakeRows.Close()
			for mistakeRows.Next() {
				var category string
				var count int
				if err := mistakeRows.Scan(&category, &count); err == nil {
					mistakeCounts[category] = count
					totalMistakes += count
				}
			}
		}

		var questions []map[string]interface{}
		categories := []string{"grammar", "vocabulary", "reading", "listening", "speaking"}
		
		// If no mistakes yet, fall back to equal distribution
		if totalMistakes == 0 {
			questionsPerCategory := limit / len(categories)
			if questionsPerCategory < 1 {
				questionsPerCategory = 1
			}
			for _, category := range categories {
				mistakeCounts[category] = questionsPerCategory
			}
			totalMistakes = limit
		}

		// Sort categories by mistake count (highest to lowest)
		sortedCategories := make([]string, len(categories))
		copy(sortedCategories, categories)
		sort.Slice(sortedCategories, func(i, j int) bool {
			return mistakeCounts[sortedCategories[i]] > mistakeCounts[sortedCategories[j]]
		})

		// Enhanced distribution with amplified differences
		idealDistribution := make(map[string]int)
		totalAllocated := 0
		
		if totalMistakes > 0 {
			// Calculate base distribution with amplified differences
			for i, category := range sortedCategories {
				mistakeCount := mistakeCounts[category]
				basePercentage := float64(mistakeCount) / float64(totalMistakes)
				
				// Amplify differences: give more weight to top problem areas, less to bottom
				var amplifiedPercentage float64
				switch i {
				case 0, 1: // Top 2 problem areas get boosted
					amplifiedPercentage = basePercentage * 1.3
				case 2: // Middle area stays similar
					amplifiedPercentage = basePercentage * 1.0
				case 3, 4: // Bottom 2 areas get reduced
					amplifiedPercentage = basePercentage * 0.6
				}
				
				questions := int(math.Round(amplifiedPercentage * float64(limit)))
				
				// Apply minimum/maximum bounds more aggressively
				if i <= 1 { // Top 2: minimum 5, maximum 8
					if questions < 5 {
						questions = 5
					}
					if questions > 8 {
						questions = 8
					}
				} else if i == 2 { // Middle: 3-5 questions
					if questions < 3 {
						questions = 3
					}
					if questions > 5 {
						questions = 5
					}
				} else { // Bottom 2: maximum 3 questions
					if questions > 3 {
						questions = 3
					}
					if questions < 1 {
						questions = 1
					}
				}
				
				idealDistribution[category] = questions
				totalAllocated += questions
			}
		} else {
			// Equal distribution if no mistake data
			questionsPerCategory := limit / len(categories)
			for _, category := range categories {
				idealDistribution[category] = questionsPerCategory
				totalAllocated += questionsPerCategory
			}
		}

		// Adjust for any rounding differences
		difference := limit - totalAllocated
		if difference != 0 {
			// Sort categories by mistake count to allocate remaining questions to biggest problem areas
			sortedCategories := make([]string, len(categories))
			copy(sortedCategories, categories)
			sort.Slice(sortedCategories, func(i, j int) bool {
				return mistakeCounts[sortedCategories[i]] > mistakeCounts[sortedCategories[j]]
			})
			
			// Distribute remaining questions to categories with most mistakes
			for i := 0; i < abs(difference); i++ {
				category := sortedCategories[i%len(sortedCategories)]
				if difference > 0 {
					idealDistribution[category]++
				} else if idealDistribution[category] > 0 {
					idealDistribution[category]--
				}
			}
		}

		for _, category := range categories {
			preferredType := preferences[category]
			if preferredType == "" {
				preferredType = "multiple_choice"
			}

			questionsForCategory := idealDistribution[category]
			mistakeCount := mistakeCounts[category]
			
			// Skip categories with 0 questions
			if questionsForCategory == 0 {
				continue
			}

			log.Printf("Personalized practice questions - Category: %s, Mistakes: %d, Questions: %d (%.1f%%)", 
				category, mistakeCount, questionsForCategory, 
				float64(mistakeCount)/float64(totalMistakes)*100)

			rows, err := db.Query(`
				SELECT id, question_text, question_type, options, correct_answer, points, category
				FROM placement_questions
				WHERE category = $1 AND question_type = $2
				ORDER BY RANDOM()
				LIMIT $3
			`, category, preferredType, questionsForCategory)

			if err != nil {
				log.Printf("Warning: Failed to fetch questions for category %s: %v", category, err)
				continue
			}

			for rows.Next() {
				var q struct {
					ID            int
					QuestionText  string
					QuestionType  string
					Options       []byte
					CorrectAnswer string
					Points        int
					Category      string
				}
				if err := rows.Scan(&q.ID, &q.QuestionText, &q.QuestionType, &q.Options, &q.CorrectAnswer, &q.Points, &q.Category); err != nil {
					continue
				}
				var opts []string
				json.Unmarshal(q.Options, &opts)
				questions = append(questions, map[string]interface{}{
					"id":               q.ID,
					"question":         q.QuestionText,
					"type":             q.QuestionType,
					"options":          opts,
					"answer":           q.CorrectAnswer,
					"points":           q.Points,
					"category":         q.Category,
					"usedAlternative":  false,
				})
			}
			rows.Close()
		}

		// If we don't have enough questions, fill with random ones
		if len(questions) < limit {
			remaining := limit - len(questions)
			rows, err := db.Query(`
				SELECT id, question_text, question_type, options, correct_answer, points, category
				FROM placement_questions
				ORDER BY RANDOM()
				LIMIT $1
			`, remaining)
			if err == nil {
				defer rows.Close()
				for rows.Next() {
					var q struct {
						ID            int
						QuestionText  string
						QuestionType  string
						Options       []byte
						CorrectAnswer string
						Points        int
						Category      string
					}
					if err := rows.Scan(&q.ID, &q.QuestionText, &q.QuestionType, &q.Options, &q.CorrectAnswer, &q.Points, &q.Category); err != nil {
						continue
					}
					var opts []string
					json.Unmarshal(q.Options, &opts)
					questions = append(questions, map[string]interface{}{
						"id":               q.ID,
						"question":         q.QuestionText,
						"type":             q.QuestionType,
						"options":          opts,
						"answer":           q.CorrectAnswer,
						"points":           q.Points,
						"category":         q.Category,
						"usedAlternative":  false,
					})
				}
			}
		}

		// Check if user has enough data (3+ attempts) to show personalized message
		hasEnoughData := false
		var totalAttempts int
		db.QueryRow(`SELECT COALESCE(SUM(total_attempts), 0) FROM learning_preferences WHERE user_id = $1`, userID).Scan(&totalAttempts)
		if totalAttempts >= 3 {
			hasEnoughData = true
		}

		response := map[string]interface{}{
			"questions":      questions,
			"hasEnoughData":  hasEnoughData,
			"totalAttempts":  totalAttempts,
		}
		json.NewEncoder(w).Encode(response)
	}).Methods("GET")

	protectedRouter.HandleFunc("/complete-test", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Score    float64 `json:"score"`
			AvgTime  float64 `json:"avg_time"`
			TestType string  `json:"test_type"`
			Answers  []struct {
				QuestionID     int     `json:"question_id"`
				SelectedOption string  `json:"selected_option"`
				CorrectOption  string  `json:"correct_option"`
				ResponseTime   float64 `json:"response_time"`
			} `json:"answers"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}

		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		// Calculate fuzzy level and difficulty
		level, difficulty, err := fuzzylogic.EvaluateLevel(req.Score, req.AvgTime)
		if err != nil {
			http.Error(w, `{"error": "Failed to evaluate level: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}

		// Collect question IDs
		var questionIDs []int
		for _, ans := range req.Answers {
			questionIDs = append(questionIDs, ans.QuestionID)
		}

		// Fetch categories and question types for questions
		catQuery := `
        SELECT id, category, question_type
        FROM placement_questions
        WHERE id = ANY($1)
    `
		rows, err := db.Query(catQuery, pq.Array(questionIDs))
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch question categories: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		catMap := make(map[int]string)
		qTypeMap := make(map[int]string)
		for rows.Next() {
			var id int
			var category string
			var questionType string
			if err := rows.Scan(&id, &category, &questionType); err != nil {
				http.Error(w, `{"error": "Failed to scan categories: `+err.Error()+`"}`, http.StatusInternalServerError)
				return
			}
			catMap[id] = category
			qTypeMap[id] = questionType
		}

		// Calculate totals and corrects per category
		totalMap := make(map[string]int)
		correctMap := make(map[string]int)
		for _, ans := range req.Answers {
			cat := catMap[ans.QuestionID]
			if cat == "" {
				continue // Skip if no category
			}
			totalMap[cat]++
			if ans.SelectedOption == ans.CorrectOption {
				correctMap[cat]++
			}
		}

		// Function to get pct or nil
		getPct := func(cat string) *float64 {
			if total, ok := totalMap[cat]; ok && total > 0 {
				pct := float64(correctMap[cat]) / float64(total) * 100
				rounded := math.Round(pct*100) / 100
				return &rounded
			}
			return nil
		}

		vocabPct := getPct("vocabulary")
		grammarPct := getPct("grammar")
		readingPct := getPct("reading")
		listeningPct := getPct("listening")

		// Insert test result with all fields
		var testResultID int
		testType := req.TestType
		if testType == "" {
			testType = "regular"
		}
		err = db.QueryRow(`
			INSERT INTO test_results_level (
			   user_id, score, avg_response_time, vocabulary_pct, grammar_pct, 
			   reading_pct, listening_pct, difficulty, fuzzy_level, test_type
		   )
		   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		   RETURNING id
	   `, userID, req.Score, req.AvgTime, vocabPct, grammarPct, readingPct, listeningPct, difficulty, level, testType).Scan(&testResultID)
		if err != nil {
			http.Error(w, `{"error": "Failed to save test result: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}

		// Save answers with question type and response time
		learningAnalyzer := personalization.NewLearningStyleAnalyzer(db)
		for _, ans := range req.Answers {
			questionType := qTypeMap[ans.QuestionID]
			category := catMap[ans.QuestionID]
			isCorrect := ans.SelectedOption == ans.CorrectOption

			_, err := db.Exec(`
            INSERT INTO test_answers (user_id, test_result_id, question_id, selected_option, correct_option, is_correct, question_type, response_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, userID, testResultID, ans.QuestionID, ans.SelectedOption, ans.CorrectOption, isCorrect, questionType, ans.ResponseTime)
			if err != nil {
				http.Error(w, `{"error": "Failed to save answer: `+err.Error()+`"}`, http.StatusInternalServerError)
				return
			}

			// Update learning preferences for personalization
			if category != "" && questionType != "" && ans.ResponseTime > 0 {
				err = learningAnalyzer.UpdatePreference(userID, questionType, category, isCorrect, ans.ResponseTime)
				if err != nil {
					// Log error but don't fail the request
					log.Printf("Warning: Failed to update learning preference: %v", err)
				}
			}
		}

		json.NewEncoder(w).Encode(map[string]string{"level": level})
	}).Methods("POST")

	protectedRouter.HandleFunc("/user-mistakes", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		rows, err := db.Query(`
			SELECT pq.category, COUNT(*) as mistake_count
			FROM test_answers ta
			JOIN placement_questions pq ON ta.question_id = pq.id
			WHERE ta.user_id = $1 AND ta.is_correct = FALSE
			GROUP BY pq.category
			ORDER BY mistake_count DESC
		`, userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch mistakes: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var mistakes []map[string]interface{}
		for rows.Next() {
			var category string
			var count int
			if err := rows.Scan(&category, &count); err != nil {
				http.Error(w, `{"error": "Failed to scan mistakes: `+err.Error()+`"}`, http.StatusInternalServerError)
				return
			}
			mistakes = append(mistakes, map[string]interface{}{
				"category": category,
				"count":    count,
			})
		}
		json.NewEncoder(w).Encode(mistakes)
	}).Methods("GET")

	// Endpoint for user mistakes by phenomenon
	protectedRouter.HandleFunc("/user-phenomenon-mistakes", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}
		rows, err := db.Query(`
			SELECT pq.phenomenon, COUNT(*) as mistake_count
			FROM test_answers ta
			JOIN placement_questions pq ON ta.question_id = pq.id
			WHERE ta.user_id = $1 AND ta.is_correct = FALSE AND pq.phenomenon IS NOT NULL
			GROUP BY pq.phenomenon
			ORDER BY mistake_count DESC
			LIMIT 5
		`, userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch phenomenon mistakes: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		var mistakes []map[string]interface{}
		for rows.Next() {
			var phenomenon string
			var count int
			if err := rows.Scan(&phenomenon, &count); err != nil {
				http.Error(w, `{"error": "Failed to scan mistakes"}`, http.StatusInternalServerError)
				return
			}
			mistakes = append(mistakes, map[string]interface{}{
				"phenomenon": phenomenon,
				"count":      count,
			})
		}
		json.NewEncoder(w).Encode(mistakes)
	}).Methods("GET")

	// Learning preferences endpoint - view user's learning preferences by question type
	protectedRouter.HandleFunc("/learning-preferences", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		learningAnalyzer := personalization.NewLearningStyleAnalyzer(db)
		prefs, err := learningAnalyzer.GetPreferencesByUser(userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch learning preferences: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(prefs)
	}).Methods("GET")

	// Last 5 tests endpoint - returns user's last 5 test results with learning preferences
	protectedRouter.HandleFunc("/last-five-tests", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		// Get last 5 test results
		rows, err := db.Query(`
			SELECT id, score, avg_response_time, vocabulary_pct, grammar_pct, reading_pct, listening_pct,
			       fuzzy_level, taken_at
			FROM test_results_level
			WHERE user_id = $1
			ORDER BY taken_at DESC
			LIMIT 5
		`, userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch test results: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var tests []map[string]interface{}
		for rows.Next() {
			var id int
			var score, avgTime, vocabPct, grammarPct, readingPct, listeningPct float64
			var fuzzyLevel string
			var takenAt string
			if err := rows.Scan(&id, &score, &avgTime, &vocabPct, &grammarPct, &readingPct, &listeningPct, &fuzzyLevel, &takenAt); err != nil {
				continue
			}

			// Get learning preferences for this test period
			learningAnalyzer := personalization.NewLearningStyleAnalyzer(db)
			recommendations, _ := learningAnalyzer.GetRecommendedQuestionTypes(userID)

			tests = append(tests, map[string]interface{}{
				"id":                    id,
				"score":                 score,
				"avg_response_time":     avgTime,
				"vocabulary_percentage": vocabPct,
				"grammar_percentage":    grammarPct,
				"reading_percentage":    readingPct,
				"listening_percentage":  listeningPct,
				"level":                 fuzzyLevel,
				"taken_at":              takenAt,
				"recommended_types":     recommendations,
			})
		}

		json.NewEncoder(w).Encode(tests)
	}).Methods("GET")

	// Learning style analysis endpoint - provides comprehensive learning style analysis
	protectedRouter.HandleFunc("/learning-style-analysis", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		learningAnalyzer := personalization.NewLearningStyleAnalyzer(db)
		analysis, err := learningAnalyzer.AnalyzeOverallLearningStyle(userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to analyze learning style: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(analysis)
	}).Methods("GET")

	// Recommended question types endpoint - returns best question type per category
	protectedRouter.HandleFunc("/recommended-question-types", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		learningAnalyzer := personalization.NewLearningStyleAnalyzer(db)
		recommendations, err := learningAnalyzer.GetRecommendedQuestionTypes(userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to get recommendations: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(recommendations)
	}).Methods("GET")

	protectedRouter.HandleFunc("/recommended-questions", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		// Find user's most recent test
		var testID int
		var fuzzyLevel string
		err := db.QueryRow(`
		SELECT id, fuzzy_level
		FROM test_results_level
		WHERE user_id = $1
		ORDER BY taken_at DESC
		LIMIT 1
	`, userID).Scan(&testID, &fuzzyLevel)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]map[string]interface{}{})
			return
		}

		// Fetch top phenomena with most mistakes
		var phenomena []string
		rows, err := db.Query(`
			SELECT pq.phenomenon
			FROM test_answers ta
			JOIN placement_questions pq ON ta.question_id = pq.id
			WHERE ta.user_id = $1 AND ta.is_correct = FALSE AND pq.phenomenon IS NOT NULL
			GROUP BY pq.phenomenon
			ORDER BY COUNT(*) DESC
			LIMIT 2
		`, userID)
		if err == nil {
			for rows.Next() {
				var p string
				_ = rows.Scan(&p)
				phenomena = append(phenomena, p)
			}
			rows.Close()
		}

		var questions []map[string]interface{}
		// Fetch questions based on phenomena
		if len(phenomena) > 0 {
			rows, err := db.Query(`
				SELECT id, question_text, question_type, options, correct_answer, points, category, difficulty, phenomenon
				FROM placement_questions
				WHERE phenomenon = ANY($1)
				ORDER BY RANDOM()
				LIMIT 4
			`, pq.Array(phenomena))
			if err == nil {
				for rows.Next() {
					var q struct {
						ID            int
						QuestionText  string
						QuestionType  string
						Options       []byte
						CorrectAnswer string
						Points        int
						Category      string
						Difficulty    int
						Phenomenon    string
					}
					if err := rows.Scan(&q.ID, &q.QuestionText, &q.QuestionType, &q.Options, &q.CorrectAnswer, &q.Points, &q.Category, &q.Difficulty, &q.Phenomenon); err == nil {
						var opts []string
						_ = json.Unmarshal(q.Options, &opts)
						questions = append(questions, map[string]interface{}{
							"id":         q.ID,
							"question":   q.QuestionText,
							"type":       q.QuestionType,
							"options":    opts,
							"answer":     q.CorrectAnswer,
							"points":     q.Points,
							"category":   q.Category,
							"difficulty": q.Difficulty,
							"phenomenon": q.Phenomenon,
						})
					}
				}
				rows.Close()
			}
		}

		// Continue with misconceptions and top categories
		misconceptions, err := feedback.DetectMisconceptions(db, testID)
		categories := []string{}
		if err == nil && len(misconceptions) > 0 {
			for _, m := range misconceptions {
				categories = append(categories, m.Category)
			}
		}
		if len(categories) == 0 {
			rows, err := db.Query(`
				SELECT pq.category
				FROM test_answers ta
				JOIN placement_questions pq ON ta.question_id = pq.id
				WHERE ta.user_id = $1 AND ta.is_correct = FALSE
				GROUP BY pq.category
				ORDER BY COUNT(*) DESC
				LIMIT 2
			`, userID)
			if err == nil {
				for rows.Next() {
					var category string
					_ = rows.Scan(&category)
					categories = append(categories, category)
				}
				rows.Close()
			}
		}

		// Select difficulty bounds based on fuzzy_level
		difficultyMin, difficultyMax := 1, 5
		switch fuzzyLevel {
		case "Beginner":
			difficultyMin, difficultyMax = 1, 2
		case "Intermediate":
			difficultyMin, difficultyMax = 2, 3
		case "Advanced":
			difficultyMin, difficultyMax = 3, 5
		}

		// Fetch additional questions from categories
		if len(categories) > 0 {
			rows, err := db.Query(`
				SELECT id, question_text, question_type, options, correct_answer, points, category, difficulty, phenomenon
				FROM placement_questions
				WHERE category = ANY($1)
				  AND difficulty BETWEEN $2 AND $3
				ORDER BY RANDOM()
				LIMIT 6
			`, pq.Array(categories), difficultyMin, difficultyMax)
			if err == nil {
				for rows.Next() {
					var q struct {
						ID            int
						QuestionText  string
						QuestionType  string
						Options       []byte
						CorrectAnswer string
						Points        int
						Category      string
						Difficulty    int
						Phenomenon    string
					}
					if err := rows.Scan(&q.ID, &q.QuestionText, &q.QuestionType, &q.Options, &q.CorrectAnswer, &q.Points, &q.Category, &q.Difficulty, &q.Phenomenon); err == nil {
						var opts []string
						_ = json.Unmarshal(q.Options, &opts)
						questions = append(questions, map[string]interface{}{
							"id":         q.ID,
							"question":   q.QuestionText,
							"type":       q.QuestionType,
							"options":    opts,
							"answer":     q.CorrectAnswer,
							"points":     q.Points,
							"category":   q.Category,
							"difficulty": q.Difficulty,
							"phenomenon": q.Phenomenon,
						})
					}
				}
				rows.Close()
			}
		}
		if len(questions) == 0 {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]map[string]interface{}{}) // empty array
			return
		}
		json.NewEncoder(w).Encode(questions)
	}).Methods("GET")

	protectedRouter.HandleFunc("/user-history", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		rows, err := db.Query(`
			   SELECT id, score, avg_response_time, fuzzy_level, test_type, taken_at
			   FROM test_results_level
			   WHERE user_id = $1
			   ORDER BY taken_at DESC
		   `, userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch history: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var history []map[string]interface{}
		for rows.Next() {
			var h struct {
				ID              int
				Score           float64
				AvgResponseTime float64
				FuzzyLevel      string
				TestType        string
				TakenAt         string
			}
			if err := rows.Scan(&h.ID, &h.Score, &h.AvgResponseTime, &h.FuzzyLevel, &h.TestType, &h.TakenAt); err != nil {
				http.Error(w, `{"error": "Failed to scan history: `+err.Error()+`"}`, http.StatusInternalServerError)
				return
			}
			history = append(history, map[string]interface{}{
				"test_id":      h.ID,
				"score":        h.Score,
				"avg_time":     h.AvgResponseTime,
				"level":        h.FuzzyLevel,
				"test_type":    h.TestType,
				"completed_at": h.TakenAt,
			})
		}
		json.NewEncoder(w).Encode(history)
	}).Methods("GET")

	// Misconceptions endpoint
	protectedRouter.HandleFunc("/misconceptions/{testID}", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		testID, err := strconv.Atoi(vars["testID"])
		if err != nil {
			http.Error(w, `{"error": "Invalid test ID"}`, http.StatusBadRequest)
			return
		}

		var testUserID int
		err = db.QueryRow("SELECT user_id FROM test_results_level WHERE id = $1", testID).Scan(&testUserID)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, `{"error": "Test not found"}`, http.StatusNotFound)
				return
			}
			http.Error(w, `{"error": "Failed to verify test ownership"}`, http.StatusInternalServerError)
			return
		}
		if testUserID != userID {
			http.Error(w, `{"error": "Test not found"}`, http.StatusNotFound)
			return
		}

		misconceptions, err := feedback.DetectMisconceptions(db, testID)
		if err != nil {
			log.Printf("Error detecting misconceptions: %v", err)
			http.Error(w, `{"error": "Failed to detect misconceptions"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(misconceptions)
	}).Methods("GET")

	// Teacher routes
	teacherRouter := r.PathPrefix("/teacher").Subrouter()
	teacherRouter.Use(api.TeacherOnlyMiddleware)

	teacherRouter.HandleFunc("/tests", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		tests, err := testService.GetTests(r.Context(), userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch tests: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(tests)
	}).Methods("GET")

	teacherRouter.HandleFunc("/tests", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		var req models.CreateTestRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		test, err := testService.CreateTest(r.Context(), userID, &req)
		if err != nil {
			http.Error(w, `{"error": "Failed to create test: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(test)
	}).Methods("POST")

	teacherRouter.HandleFunc("/tests/{id}", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		id, _ := strconv.Atoi(vars["id"])
		log.Printf("Received PUT /teacher/tests/%d by user %d", id, userID)
		var req models.UpdateTestRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		test, err := testService.UpdateTest(r.Context(), userID, id, &req)
		if err != nil {
			http.Error(w, `{"error": "Failed to update test: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(test)
	}).Methods("PUT")

	teacherRouter.HandleFunc("/tests/{id}", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		id, _ := strconv.Atoi(vars["id"])
		test, err := testService.GetTest(r.Context(), userID, id)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch test: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		if test == nil {
			http.Error(w, `{"error": "Test not found"}`, http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(test)
	}).Methods("GET")

	teacherRouter.HandleFunc("/tests/{id}", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		id, _ := strconv.Atoi(vars["id"])
		err := testService.DeleteTest(r.Context(), userID, id)
		if err != nil {
			http.Error(w, `{"error": "Failed to delete test: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}).Methods("DELETE")

	// Teacher classroom routes
	teacherRouter.HandleFunc("/classrooms", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		classrooms, err := classroomService.GetClassrooms(r.Context(), userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch classrooms: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(classrooms)
	}).Methods("GET")

	teacherRouter.HandleFunc("/classrooms", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		var req models.CreateClassroomRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		classroom, err := classroomService.CreateClassroom(r.Context(), userID, &req)
		if err != nil {
			http.Error(w, `{"error": "Failed to create classroom: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(classroom)
	}).Methods("POST")

	teacherRouter.HandleFunc("/classrooms/{id}", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		id, _ := strconv.Atoi(vars["id"])
		classroom, err := classroomService.GetClassroom(r.Context(), userID, id)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch classroom: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(classroom)
	}).Methods("GET")

	teacherRouter.HandleFunc("/classrooms/{id}/assign-test", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		classroomID, _ := strconv.Atoi(vars["id"])
		var req models.AssignTestRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		err := classroomService.AssignTest(r.Context(), userID, classroomID, &req)
		if err != nil {
			http.Error(w, `{"error": "Failed to assign test: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Test assigned successfully"})
	}).Methods("POST")

	teacherRouter.HandleFunc("/classrooms/{id}/results/{testID}", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		classroomID, _ := strconv.Atoi(vars["id"])
		testID, _ := strconv.Atoi(vars["testID"])
		results, err := classroomService.GetClassroomResults(r.Context(), userID, classroomID, testID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch results: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(results)
	}).Methods("GET")

	teacherRouter.HandleFunc("/students/{studentID}/tests/{testID}/details", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		studentID, _ := strconv.Atoi(vars["studentID"])
		testID, _ := strconv.Atoi(vars["testID"])
		details, err := classroomService.GetStudentTestDetails(r.Context(), userID, studentID, testID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch student test details: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(details)
	}).Methods("GET")

	teacherRouter.HandleFunc("/classrooms/{classroomID}/members/{studentID}", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		classroomID, _ := strconv.Atoi(vars["classroomID"])
		studentID, _ := strconv.Atoi(vars["studentID"])
		err := classroomService.RemoveStudentFromClassroom(r.Context(), userID, classroomID, studentID)
		if err != nil {
			http.Error(w, `{"error": "Failed to remove student: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}).Methods("DELETE")

	teacherRouter.HandleFunc("/classrooms/{classroomID}/tests/{testID}", func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)
		vars := mux.Vars(r)
		classroomID, _ := strconv.Atoi(vars["classroomID"])
		testID, _ := strconv.Atoi(vars["testID"])
		err := classroomService.RemoveTestFromClassroom(r.Context(), userID, classroomID, testID)
		if err != nil {
			http.Error(w, `{"error": "Failed to remove test: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}).Methods("DELETE")

	// Student classroom routes (protected, but for students)
	protectedRouter.HandleFunc("/classrooms/join", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
			return
		}
		var req models.JoinClassroomRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		classroom, err := classroomService.JoinClassroom(r.Context(), userID, &req)
		if err != nil {
			http.Error(w, `{"error": "Failed to join classroom: `+err.Error()+`"}`, http.StatusBadRequest)
			return
		}
		json.NewEncoder(w).Encode(classroom)
	}).Methods("POST")

	protectedRouter.HandleFunc("/student/classrooms", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
			return
		}
		classrooms, err := classroomService.GetStudentClassrooms(r.Context(), userID)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch classrooms: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(classrooms)
	}).Methods("GET")

	protectedRouter.HandleFunc("/student/classrooms/{id}", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
			return
		}
		vars := mux.Vars(r)
		id, _ := strconv.Atoi(vars["id"])
		classroom, err := classroomService.GetClassroom(r.Context(), userID, id)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch classroom: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(classroom)
	}).Methods("GET")

	// Get test questions (accessible by both teachers and students)
	protectedRouter.HandleFunc("/tests/{id}/questions", func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, _ := strconv.Atoi(vars["id"])
		test, err := testService.GetTestByID(r.Context(), id)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch test questions: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		if test == nil {
			http.Error(w, `{"error": "Test not found"}`, http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(test.Questions)
	}).Methods("GET")

	protectedRouter.HandleFunc("/tests/submit", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
			return
		}
		var req models.SubmitTestResultRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
			return
		}
		err := classroomService.SubmitTeacherTestResult(r.Context(), userID, &req)
		if err != nil {
			http.Error(w, `{"error": "Failed to submit test: `+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Test submitted successfully"})
	}).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	return c.Handler(r)
}
