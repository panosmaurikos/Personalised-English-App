CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- ο καθηγητής που έφτιαξε το τεστ
    score INTEGER NOT NULL,
    avg_response_time REAL,
    vocabulary_pct REAL,
    grammar_pct REAL,
    reading_pct REAL,
    listening_pct REAL,
    difficulty INTEGER,
    fuzzy_level VARCHAR(50),
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password, role)
VALUES ('panosmaurikos', 'panosmauros89@gmail.com', '$2a$10$sa.IKNfhz9GUdViuWLspCu2I49W1jJwy2vzNhIa2.OoOujESRR2fW', 'student')
ON CONFLICT (username) DO NOTHING;