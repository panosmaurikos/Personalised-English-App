import styles from "../../css/TestForm.module.css";

function TestForm({ form, setForm, onSubmit, onClose, title }) {
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, e) => {
    const newQuestions = [...form.questions];
    if (e.target.name === "points") {
      newQuestions[index][e.target.name] = Number(e.target.value);
    } else {
      newQuestions[index][e.target.name] = e.target.value;
      // always enforce multiple choice type in data
      newQuestions[index].question_type = "multiple_choice";
    }
    setForm({ ...form, questions: newQuestions });
  };

  const handleOptionChange = (qIndex, key, e) => {
    const newQuestions = [...form.questions];
    newQuestions[qIndex].options[key] = e.target.value;
    setForm({ ...form, questions: newQuestions });
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        {
          question_text: "",
          question_type: "multiple_choice",
          category: "vocabulary",
          options: { A: "", B: "", C: "", D: "" },
          correct_answer: "",
          points: 1,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = form.questions.filter((_, i) => i !== index);
    setForm({ ...form, questions: newQuestions });
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>{title}</h3>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            className={styles.textarea}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleFormChange}
            className={styles.select}
          >
            <option value="vocabulary">Vocabulary</option>
            <option value="grammar">Grammar</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <h4 className={styles.questionsHeader}>Questions</h4>
        {form.questions.map((q, index) => (
          <div key={index} className={styles.questionBlock}>
            <div className={styles.formGroup}>
              <label>Question Text</label>
              <input
                name="question_text"
                value={q.question_text}
                onChange={(e) => handleQuestionChange(index, e)}
                required
                className={styles.input}
              />
            </div>

            {/* Category instead of type; all are multiple choice */}
            <div className={styles.formGroup}>
              <label>Category</label>
              <select
                name="category"
                value={q.category || "vocabulary"}
                onChange={(e) => handleQuestionChange(index, e)}
                className={styles.select}
              >
                <option value="vocabulary">Vocabulary</option>
                <option value="grammar">Grammar</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>

            {/* Multiple choice options */}
            <>
              {["A", "B", "C", "D"].map((key) => (
                <div key={key} className={styles.formGroup}>
                  <label>Option {key}</label>
                  <input
                    value={q.options[key] || ""}
                    onChange={(e) => handleOptionChange(index, key, e)}
                    required
                    className={styles.input}
                  />
                </div>
              ))}
              <div className={styles.formGroup}>
                <label>Correct Answer</label>
                <select
                  name="correct_answer"
                  value={q.correct_answer}
                  onChange={(e) => handleQuestionChange(index, e)}
                  required
                  className={styles.select}
                >
                  <option value="">Select</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </>

            <div className={styles.formGroup}>
              <label>Points</label>
              <input
                type="number"
                name="points"
                value={q.points}
                onChange={(e) => handleQuestionChange(index, e)}
                min="1"
                required
                className={styles.input}
              />
            </div>
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              className={styles.removeBtn}
            >
              Remove Question
            </button>
          </div>
        ))}
        <button type="button" onClick={addQuestion} className={styles.addBtn}>
          Add Question
        </button>
        <button type="submit" className={styles.submitBtn}>
          {title.includes("Create") ? "Create" : "Save Changes"}
        </button>
      </form>
      <button onClick={onClose} className={styles.cancelBtn}>
        Cancel
      </button>
    </div>
  );
}

export default TestForm;
