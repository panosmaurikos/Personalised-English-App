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
CREATE TABLE IF NOT EXISTS test_results_level (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE
    SET NULL,
        score REAL NOT NULL,
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
VALUES (
        'panosmaurikos',
        'panosmauros89@gmail.com',
        '$2a$10$sa.IKNfhz9GUdViuWLspCu2I49W1jJwy2vzNhIa2.OoOujESRR2fW',
        'student'
    ) ON CONFLICT (username) DO NOTHING;
CREATE TABLE Teachers_tests (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Teachers_questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES Teachers_tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(1) NOT NULL,
    points INTEGER NOT NULL,
    order_index INTEGER NOT NULL
);
CREATE TABLE placement_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT,
    question_type VARCHAR(50),
    options JSONB,
    correct_answer VARCHAR(1),
    points INTEGER,
    category VARCHAR(50),
    difficulty INTEGER,
    phenomenon VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
INSERT INTO placement_questions (
        question_text,
        question_type,
        options,
        correct_answer,
        points,
        category,
        difficulty,
        created_at,
        phenomenon
    )
VALUES (
        'Choose the best option to complete the conversation: "Can I park here?"',
        'multiple',
        '["Sorry, I did that.", "It''s the same place.", "Only for half an hour."]',
        'C',
        1,
        'speaking',
        1,
        now(),
        'Appropriate situational response'
    ),
    (
        'Choose the best option to complete the conversation: "What colour will you paint the children''s bedroom?"',
        'multiple',
        '["I hope it was right.", "We can''t decide.", "It wasn''t very difficult."]',
        'B',
        1,
        'speaking',
        1,
        now(),
        'Contextual conversation response'
    ),
    (
        'Choose the best option to complete the conversation: "I can''t understand this email."',
        'multiple',
        '["Would you like some help?", "Don''t you know?", "I suppose you can."]',
        'A',
        1,
        'speaking',
        1,
        now(),
        'Offering help / polite suggestion'
    ),
    (
        'Choose the best option to complete the conversation: "I''d like two tickets for tomorrow night."',
        'multiple',
        '["How much did you pay?", "Afternoon and evening.", "I''ll just check for you."]',
        'C',
        1,
        'speaking',
        1,
        now(),
        'Service / polite response'
    ),
    (
        'Choose the best option to complete the conversation: "Shall we go to the gym now?"',
        'multiple',
        '["I''m too tired.", "It''s very good.", "Not at all."]',
        'A',
        1,
        'speaking',
        1,
        now(),
        'Expressing preference / refusal'
    ),
    (
        'Choose the correct word to complete the sentence: "His eyes were ...... bad that he couldn''t read the number plate of the car in front."',
        'multiple',
        '["such", "too", "so", "very"]',
        'C',
        1,
        'grammar',
        2,
        now(),
        'Result clause (so...that)'
    ),
    (
        'Choose the correct word to complete the sentence: "The company needs to decide ...... and for all what its position is on this point."',
        'multiple',
        '["here", "once", "first", "finally"]',
        'B',
        1,
        'vocabulary',
        2,
        now(),
        'Fixed expression (once and for all)'
    ),
    (
        'Choose the correct word to complete the sentence: "Don''t put your cup on the ...... of the table - someone will knock it off."',
        'multiple',
        '["outside", "edge", "boundary", "border"]',
        'B',
        1,
        'vocabulary',
        1,
        now(),
        'Word meaning (edge of an object)'
    ),
    (
        'Choose the correct word to complete the sentence: "I''m sorry - I didn''t ...... to disturb you."',
        'multiple',
        '["hope", "think", "mean", "suppose"]',
        'C',
        1,
        'grammar',
        2,
        now(),
        'Verb usage (mean to + infinitive)'
    ),
    (
        'Choose the correct word to complete the sentence: "The singer ended the concert ...... her most popular song."',
        'multiple',
        '["by", "with", "in", "as"]',
        'B',
        1,
        'grammar',
        1,
        now(),
        'Preposition use (end with)'
    ),
    (
        'Choose the correct word to complete the sentence: "Would you mind ...... these plates a wipe before putting them in the cupboard?"',
        'multiple',
        '["making", "doing", "getting", "giving"]',
        'D',
        1,
        'grammar',
        2,
        now(),
        'Collocation (give something a wipe)'
    ),
    (
        'Choose the correct word to complete the sentence: "I was looking forward ...... at the new restaurant, but it was closed."',
        'multiple',
        '["to eat", "to have eaten", "to eating", "eating"]',
        'C',
        1,
        'grammar',
        3,
        now(),
        'Gerund after preposition (look forward to + -ing)'
    ),
    (
        'Choose the correct word to complete the sentence: "...... tired Melissa is when she gets home from work, she always makes time to say goodnight to the children."',
        'multiple',
        '["Whatever", "No matter how", "However much", "Although"]',
        'B',
        1,
        'grammar',
        3,
        now(),
        'Concession clause (no matter how + adjective)'
    ),
    (
        'Choose the correct word to complete the sentence: "It was only ten days ago ...... she started her new job."',
        'multiple',
        '["then", "since", "after", "that"]',
        'D',
        1,
        'grammar',
        2,
        now(),
        'Relative clause (It was ... ago that ...)'
    ),
    (
        'Choose the correct word to complete the sentence: "The shop didn''t have the shoes I wanted, but they''ve ...... a pair specially for me."',
        'multiple',
        '["booked", "ordered", "commanded", "asked"]',
        'B',
        1,
        'vocabulary',
        2,
        now(),
        'Word choice (order vs. book)'
    ),
    (
        'Choose the correct word to complete the sentence: "Have you got time to discuss your work now or are you ...... to leave?"',
        'multiple',
        '["thinking", "round", "planned", "about"]',
        'D',
        1,
        'grammar',
        2,
        now(),
        'Preposition use (about to + verb)'
    ),
    (
        'Choose the correct word to complete the sentence: "She came to live here ...... a month ago."',
        'multiple',
        '["quite", "beyond", "already", "almost"]',
        'D',
        1,
        'grammar',
        1,
        now(),
        'Adverb of time (almost + time expression)'
    ),
    (
        'Choose the correct word to complete the sentence: "Once the plane is in the air, you can ...... your seat belts if you wish."',
        'multiple',
        '["undress", "unfasten", "unlock", "untie"]',
        'B',
        1,
        'vocabulary',
        1,
        now(),
        'Word meaning (unfasten a seat belt)'
    ),
    (
        'Choose the correct word to complete the sentence: "I left my last job because I had no ...... to travel."',
        'multiple',
        '["place", "position", "opportunity", "possibility"]',
        'C',
        1,
        'vocabulary',
        2,
        now(),
        'Word choice (opportunity to + verb)'
    ),
    (
        'Choose the correct word to complete the sentence: "It wasn''t a bad crash and ...... damage was done to my car."',
        'multiple',
        '["little", "small", "light", "mere"]',
        'A',
        1,
        'grammar',
        2,
        now(),
        'Quantifier (little + uncountable noun)'
    ),
    (
        'Choose the correct word to complete the sentence: "I''d rather you ...... to her why we can''t go."',
        'multiple',
        '["would explain", "explained", "to explain", "will explain"]',
        'B',
        1,
        'grammar',
        3,
        now(),
        'Subjunctive preference (I''d rather + past tense)'
    ),
    (
        'Choose the correct word to complete the sentence: "Before making a decision, the leader considered all ...... of the argument."',
        'multiple',
        '["sides", "features", "perspectives", "shades"]',
        'A',
        1,
        'vocabulary',
        2,
        now(),
        'Fixed expression (both/all sides of an argument)'
    ),
    (
        'Choose the correct word to complete the sentence: "This new printer is recommended as being ...... reliable."',
        'multiple',
        '["greatly", "highly", "strongly", "readily"]',
        'B',
        1,
        'vocabulary',
        2,
        now(),
        'Collocation (highly reliable)'
    ),
    (
        'Choose the correct word to complete the sentence: "When I realised I had dropped my gloves, I decided to ...... my steps."',
        'multiple',
        '["retrace", "regress", "resume", "return"]',
        'A',
        1,
        'vocabulary',
        3,
        now(),
        'Phrasal/verb meaning (retrace one''s steps)'
    ),
    (
        'Choose the correct word to complete the sentence: "Anne''s house is somewhere in the ...... of the railway station."',
        'multiple',
        '["region", "quarter", "vicinity", "district"]',
        'C',
        1,
        'vocabulary',
        2,
        now(),
        'Word meaning (vicinity = nearby area)'
    ),
    (
        'Choose the correct word to complete the sentence: "She ___ to the gym every day after work."',
        'multiple',
        '["go", "goes", "going", "went"]',
        'B',
        1,
        'vocabulary',
        1,
        now(),
        'Present Simple tense (verb form)'
    ),
    (
        'Select the most appropriate word: "The CEO made a ___ that changed the company''s future."',
        'multiple',
        '["decision", "decisive", "decide", "deciding"]',
        'A',
        1,
        'vocabulary',
        2,
        now(),
        'Word formation (noun form)'
    ),
    (
        'Identify the synonym of "BENEFICIAL":',
        'multiple',
        '["Harmful", "Advantageous", "Useless", "Trivial"]',
        'B',
        1,
        'vocabulary',
        3,
        now(),
        'Synonym recognition'
    ),
    (
        'Choose the word that is closest in meaning to "AMBIGUOUS":',
        'multiple',
        '["Clear", "Uncertain", "Obvious", "Simple"]',
        'B',
        1,
        'vocabulary',
        3,
        now(),
        'Word meaning (ambiguity)'
    ),
    (
        'Select the correct phrasal verb: "We need to ___ a solution to this problem quickly."',
        'multiple',
        '["come up with", "come across as", "come down with", "come about"]',
        'A',
        1,
        'vocabulary',
        4,
        now(),
        'Phrasal verbs'
    ),
    (
        'Which sentence is grammatically correct?',
        'multiple',
        '["She don''t like coffee.", "She doesn''t likes coffee.", "She doesn''t like coffee.", "She not like coffee."]',
        'C',
        1,
        'grammar',
        1,
        now(),
        'Subject-verb agreement'
    ),
    (
        'Choose the correct tense: "By the time we arrived, the movie ___."',
        'multiple',
        '["already started", "has already started", "had already started", "would already start"]',
        'C',
        1,
        'grammar',
        3,
        now(),
        'Past Perfect tense'
    ),
    (
        'Identify the sentence with correct conditional form:',
        'multiple',
        '["If I will see him, I will tell him.", "If I saw him, I will tell him.", "If I see him, I will tell him.", "If I would see him, I will tell him."]',
        'C',
        1,
        'grammar',
        3,
        now(),
        'Zero and First conditionals'
    ),
    (
        'Select the properly structured passive voice sentence:',
        'multiple',
        '["The report was written by the team yesterday.", "The report written by the team yesterday.", "The report was wrote by the team yesterday.", "The report is written by the team yesterday."]',
        'A',
        1,
        'grammar',
        4,
        now(),
        'Passive voice formation'
    ),
    (
        'Choose the sentence with correct subject-verb agreement:',
        'multiple',
        '["Neither the manager nor the employees is aware of the changes.", "Neither the manager nor the employees are aware of the changes.", "Neither the manager nor the employees was aware of the changes.", "Neither the manager nor the employees has been aware of the changes."]',
        'B',
        1,
        'grammar',
        4,
        now(),
        'Compound subject-verb agreement'
    ),
    (
        'Read the text and answer: "The company announced quarterly results that exceeded expectations. Revenue grew by 15% compared to the same period last year, while profits saw a 22% increase. The CEO attributed this success to new product lines and expanding markets." What increased by 22%?',
        'multiple',
        '["Revenue", "Expectations", "Markets", "Profits"]',
        'D',
        1,
        'reading',
        2,
        now(),
        'Detail identification'
    ),
    (
        'Based on the passage: "Climate change poses significant challenges for coastal communities. Rising sea levels threaten infrastructure, while changing weather patterns affect local economies dependent on fishing and tourism." What TWO main challenges are mentioned?',
        'multiple',
        '["Economic sanctions and political instability", "Rising sea levels and changing weather patterns", "Overpopulation and pollution", "Droughts and wildfires"]',
        'B',
        1,
        'reading',
        3,
        now(),
        'Identifying key ideas'
    ),
    (
        'Analyze this text: "The author argues that technological advancement, while beneficial, often creates unintended social consequences. The rapid adoption of automation, for instance, displaces workers but also creates new opportunities in emerging fields." What is the author''s main point about technology?',
        'multiple',
        '["It is entirely beneficial", "It has mixed consequences", "It should be avoided", "It only creates problems"]',
        'B',
        1,
        'reading',
        4,
        now(),
        'Inference and main idea'
    ),
    (
        'You hear: "I''m sorry, but Dr. Johnson won''t be available until next Tuesday." When will Dr. Johnson be available?',
        'multiple',
        '["Today", "Next Tuesday", "Next month", "Tomorrow"]',
        'B',
        1,
        'listening',
        1,
        now(),
        'Time inference from spoken text'
    ),
    (
        'Listen to this conversation: "Should we take the highway or the scenic route? The highway is faster, but the scenic route is more pleasant." What are they discussing?',
        'multiple',
        '["Weather conditions", "Travel routes", "Restaurant choices", "Time management"]',
        'B',
        1,
        'listening',
        2,
        now(),
        'Understanding context (topic identification)'
    ),
    (
        'You hear this announcement: "Due to unforeseen circumstances, flight BA 245 to Madrid has been delayed. Passengers are requested to proceed to Gate 12 for further information." What should passengers do?',
        'multiple',
        '["Board immediately", "Go to Gate 12", "Check in again", "Cancel tickets"]',
        'B',
        1,
        'listening',
        3,
        now(),
        'Understanding instructions'
    ),
    (
        'Listen to this dialogue: "I think the marketing proposal needs more concrete data to support its claims. The concept is solid, but without statistical backing, it might not convince the board." What is the main criticism?',
        'multiple',
        '["The concept is weak", "It lacks statistical data", "The board will definitely reject it", "It''s too expensive"]',
        'B',
        1,
        'listening',
        4,
        now(),
        'Identifying speaker attitude'
    ),
    (
        'What would you say in this situation: You need to interrupt a meeting to deliver an urgent message.',
        'multiple',
        '["Wait silently until someone notices you", "Barg in and speak loudly", "Knock politely and say ''Excuse me for the interruption, but I have an urgent message''", "Send a text message instead"]',
        'C',
        1,
        'speaking',
        3,
        now(),
        'Politeness strategy'
    ),
    (
        'Your colleague seems upset about a missed deadline. What is the most appropriate response?',
        'multiple',
        '["Ignore them - it''s their problem", "Say ''You should have worked harder''", "Offer help and ask ''Is there anything I can do to assist?''", "Complain to your manager"]',
        'C',
        1,
        'speaking',
        3,
        now(),
        'Empathy and workplace communication'
    ),
    (
        'How would you politely decline an invitation you can''t accept?',
        'multiple',
        '["Sorry, I''m busy", "No, I don''t want to", "Thank you for the invitation, but I have a prior commitment", "Maybe next time"]',
        'C',
        1,
        'speaking',
        2,
        now(),
        'Politeness / refusal expression'
    ),
    (
        'Identify the error in this sentence: "The collection of rare coins and antique jewelry were stolen from the museum last night."',
        'multiple',
        '["collection of", "rare coins and", "were stolen", "from the museum"]',
        'C',
        1,
        'grammar',
        5,
        now(),
        'Subject-verb agreement (collective noun)'
    ),
    (
        'What is the implied meaning of this statement: "The project proposal, while ambitious, may require more resources than initially anticipated."',
        'multiple',
        '["The proposal is perfect as is", "The proposal will definitely fail", "The proposal might be too expensive or demanding", "The proposal lacks ambition"]',
        'C',
        1,
        'reading',
        5,
        now(),
        'Inference / implied meaning'
    ),
    (
        'Choose the most formal and professional response: "I haven''t received the documents yet."',
        'multiple',
        '["Where are my documents?", "Hey, send me those papers!", "I was wondering if you could provide an update on the documents I requested.", "I need those docs ASAP!"]',
        'C',
        1,
        'speaking',
        4,
        now(),
        'Register and tone (formality)'
    );
CREATE TABLE IF NOT EXISTS test_answers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    test_result_id INTEGER REFERENCES test_results_level(id) ON DELETE CASCADE,
    question_id INTEGER,
    selected_option VARCHAR(255),
    correct_option VARCHAR(255),
    is_correct BOOLEAN,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);