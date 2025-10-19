package router

import (
	"database/sql"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/lib/pq"
	"github.com/panosmaurikos/personalisedenglish/backend/api"
	"github.com/panosmaurikos/personalisedenglish/backend/feedback"
	"github.com/panosmaurikos/personalisedenglish/backend/fuzzylogic"
	"github.com/panosmaurikos/personalisedenglish/backend/models"
	"github.com/panosmaurikos/personalisedenglish/backend/services"
	"github.com/rs/cors"
)

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
	db *sql.DB,
) http.Handler {
	r := mux.NewRouter()
	r.Handle("/register", registerHandler).Methods("POST")
	r.Handle("/login", loginHandler).Methods("POST")
	r.Handle("/forgot-password", forgotPasswordHandler).Methods("POST")
	r.Handle("/reset-password", resetPasswordOTPHandler).Methods("POST")

	r.HandleFunc("/placement-questions", func(w http.ResponseWriter, r *http.Request) {
		limit := 20
		rows, err := db.Query(`SELECT id, question_text, question_type, options, correct_answer, points, category FROM placement_questions ORDER BY RANDOM() LIMIT $1`, limit)
		if err != nil {
			http.Error(w, `{"error": "Failed to fetch questions"}`, http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		var questions []map[string]interface{}
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
			var opts []string
			_ = json.Unmarshal(q.Options, &opts)
			questions = append(questions, map[string]interface{}{
				"id":       q.ID,
				"question": q.QuestionText,
				"type":     q.QuestionType,
				"options":  opts,
				"answer":   q.CorrectAnswer,
				"points":   q.Points,
				"category": q.Category,
			})
		}
		json.NewEncoder(w).Encode(questions)
	}).Methods("GET")

	// Apply AuthMiddleware to protected routes
	protectedRouter := r.PathPrefix("/").Subrouter()
	protectedRouter.Use(api.AuthMiddleware)

	protectedRouter.HandleFunc("/complete-test", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Score    float64 `json:"score"`
			AvgTime  float64 `json:"avg_time"`
			TestType string  `json:"test_type"`
			Answers  []struct {
				QuestionID     int    `json:"question_id"`
				SelectedOption string `json:"selected_option"`
				CorrectOption  string `json:"correct_option"`
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

		// Fetch categories for questions
		catQuery := `
        SELECT id, category
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
		for rows.Next() {
			var id int
			var category string
			if err := rows.Scan(&id, &category); err != nil {
				http.Error(w, `{"error": "Failed to scan categories: `+err.Error()+`"}`, http.StatusInternalServerError)
				return
			}
			catMap[id] = category
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

		// Save answers (unchanged)
		for _, ans := range req.Answers {
			_, err := db.Exec(`
            INSERT INTO test_answers (user_id, test_result_id, question_id, selected_option, correct_option, is_correct)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, userID, testResultID, ans.QuestionID, ans.SelectedOption, ans.CorrectOption, ans.SelectedOption == ans.CorrectOption)
			if err != nil {
				http.Error(w, `{"error": "Failed to save answer: `+err.Error()+`"}`, http.StatusInternalServerError)
				return
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

	// Νέο endpoint για λάθη ανά phenomenon
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

	protectedRouter.HandleFunc("/recommended-questions", func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok || userID == 0 {
			http.Error(w, `{"error": "User ID not found in context"}`, http.StatusUnauthorized)
			return
		}

		// Βρες το τελευταίο test του χρήστη
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
			json.NewEncoder(w).Encode([]map[string]interface{}{}) // empty array
			return
		}

		// 1. Φέρε top phenomena με τα περισσότερα λάθη
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
		// 2. Φέρε ερωτήσεις με βάση τα phenomena
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

		// Συνέχισε με misconceptions/top categories όπως πριν
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

		// Επιλογή difficulty bounds με βάση fuzzy_level
		difficultyMin, difficultyMax := 1, 5
		switch fuzzyLevel {
		case "Beginner":
			difficultyMin, difficultyMax = 1, 2
		case "Intermediate":
			difficultyMin, difficultyMax = 2, 3
		case "Advanced":
			difficultyMin, difficultyMax = 3, 5
		}

		// Φέρε επιπλέον ερωτήσεις από categories
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

	// Misconceptions endpoint (όπως πριν)
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

	// -- Teacher routes (όπως πριν) --
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

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	return c.Handler(r)
}
