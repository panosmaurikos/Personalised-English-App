CREATE TABLE
    IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS test_results_level (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        teacher_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
        score REAL NOT NULL,
        avg_response_time REAL,
        vocabulary_pct REAL,
        grammar_pct REAL,
        reading_pct REAL,
        listening_pct REAL,
        difficulty INTEGER,
        fuzzy_level VARCHAR(50),
        test_type VARCHAR(32) NOT NULL DEFAULT 'regular',
        taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

INSERT INTO
    users (username, email, password, role)
VALUES
    (
        'panosmaurikos',
        'panosmauros89@gmail.com',
        '$2a$10$sa.IKNfhz9GUdViuWLspCu2I49W1jJwy2vzNhIa2.OoOujESRR2fW',
        'student'
    ) ON CONFLICT (username) DO NOTHING;

CREATE TABLE
    Teachers_tests (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    Teachers_questions (
        id SERIAL PRIMARY KEY,
        test_id INTEGER NOT NULL REFERENCES Teachers_tests (id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        options JSONB NOT NULL,
        correct_answer VARCHAR(1) NOT NULL,
        points INTEGER NOT NULL,
        order_index INTEGER NOT NULL
    );

CREATE TABLE
    placement_questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT,
        question_type VARCHAR(50),
        options JSONB,
        correct_answer VARCHAR(1),
        points INTEGER,
        category VARCHAR(50),
        difficulty INTEGER,
        phenomenon VARCHAR(100),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now ()
    );

INSERT INTO
    placement_questions (
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
VALUES
    (
        'Choose the best option to complete the conversation: "Can I park here?"',
        'multiple_choice',
        '["Sorry, I did that.", "It''s the same place.", "Only for half an hour."]',
        'C',
        1,
        'speaking',
        1,
        now (),
        'Conversational responses'
    ),
    (
        'Choose the best option to complete the conversation: "What colour will you paint the children''s bedroom?"',
        'multiple_choice',
        '["I hope it was right.", "We can''t decide.", "It wasn''t very difficult."]',
        'B',
        1,
        'speaking',
        1,
        now (),
        'Conversational responses'
    ),
    (
        'Choose the best option to complete the conversation: "I can''t understand this email."',
        'multiple_choice',
        '["Would you like some help?", "Don''t you know?", "I suppose you can."]',
        'A',
        1,
        'speaking',
        1,
        now (),
        'Functional language'
    ),
    (
        'Choose the best option to complete the conversation: "I''d like two tickets for tomorrow night."',
        'multiple_choice',
        '["How much did you pay?", "Afternoon and evening.", "I''ll just check for you."]',
        'C',
        1,
        'speaking',
        1,
        now (),
        'Functional language'
    ),
    (
        'Choose the best option to complete the conversation: "Shall we go to the gym now?"',
        'multiple_choice',
        '["I''m too tired.", "It''s very good.", "Not at all."]',
        'A',
        1,
        'speaking',
        1,
        now (),
        'Conversational responses'
    ),
    (
        'Choose the correct word to complete the sentence: "His eyes were ...... bad that he couldn''t read the number plate of the car in front."',
        'multiple_choice',
        '["such", "too", "so", "very"]',
        'C',
        1,
        'grammar',
        2,
        now (),
        'Result clauses (so...that)'
    ),
    (
        'Choose the correct word to complete the sentence: "The company needs to decide ...... and for all what its position is on this point."',
        'multiple_choice',
        '["here", "once", "first", "finally"]',
        'B',
        1,
        'vocabulary',
        2,
        now (),
        'Fixed expressions'
    ),
    (
        'Choose the correct word to complete the sentence: "Don''t put your cup on the ...... of the table - someone will knock it off."',
        'multiple_choice',
        '["outside", "edge", "boundary", "border"]',
        'B',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Choose the correct word to complete the sentence: "I''m sorry - I didn''t ...... to disturb you."',
        'multiple_choice',
        '["hope", "think", "mean", "suppose"]',
        'C',
        1,
        'grammar',
        2,
        now (),
        'Gerunds and infinitives'
    ),
    (
        'Choose the correct word to complete the sentence: "The singer ended the concert ...... her most popular song."',
        'multiple_choice',
        '["by", "with", "in", "as"]',
        'B',
        1,
        'grammar',
        1,
        now (),
        'Prepositions'
    ),
    (
        'Choose the correct word to complete the sentence: "Would you mind ...... these plates a wipe before putting them in the cupboard?"',
        'multiple_choice',
        '["making", "doing", "getting", "giving"]',
        'D',
        1,
        'grammar',
        2,
        now (),
        'Collocations'
    ),
    (
        'Choose the correct word to complete the sentence: "I was looking forward ...... at the new restaurant, but it was closed."',
        'multiple_choice',
        '["to eat", "to have eaten", "to eating", "eating"]',
        'C',
        1,
        'grammar',
        3,
        now (),
        'Gerunds and infinitives'
    ),
    (
        'Choose the correct word to complete the sentence: "It was only ten days ago ...... she started her new job."',
        'multiple_choice',
        '["then", "since", "after", "that"]',
        'D',
        1,
        'grammar',
        2,
        now (),
        'Relative clauses'
    ),
    (
        'Choose the correct word to complete the sentence: "The shop didn''t have the shoes I wanted, but they''ve ...... a pair specially for me."',
        'multiple_choice',
        '["booked", "ordered", "commanded", "asked"]',
        'B',
        1,
        'vocabulary',
        2,
        now (),
        'Word meaning in context'
    ),
    (
        'Choose the correct word to complete the sentence: "Have you got time to discuss your work now or are you ...... to leave?"',
        'multiple_choice',
        '["thinking", "round", "planned", "about"]',
        'D',
        1,
        'grammar',
        2,
        now (),
        'Prepositions'
    ),
    (
        'Choose the correct word to complete the sentence: "She came to live here ...... a month ago."',
        'multiple_choice',
        '["quite", "beyond", "already", "almost"]',
        'D',
        1,
        'grammar',
        1,
        now (),
        'Word order'
    ),
    (
        'Choose the correct word to complete the sentence: "Once the plane is in the air, you can ...... your seat belts if you wish."',
        'multiple_choice',
        '["undress", "unfasten", "unlock", "untie"]',
        'B',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Choose the correct word to complete the sentence: "I left my last job because I had no ...... to travel."',
        'multiple_choice',
        '["place", "position", "opportunity", "possibility"]',
        'C',
        1,
        'vocabulary',
        2,
        now (),
        'Word meaning in context'
    ),
    (
        'Choose the correct word to complete the sentence: "It wasn''t a bad crash and ...... damage was done to my car."',
        'multiple_choice',
        '["little", "small", "light", "mere"]',
        'A',
        1,
        'grammar',
        2,
        now (),
        'Quantifiers'
    ),
    (
        'Choose the correct word to complete the sentence: "I''d rather you ...... to her why we can''t go."',
        'multiple_choice',
        '["would explain", "explained", "to explain", "will explain"]',
        'B',
        1,
        'grammar',
        3,
        now (),
        'Subjunctive mood'
    ),
    (
        'Choose the correct word to complete the sentence: "Before making a decision, the leader considered all ...... of the argument."',
        'multiple_choice',
        '["sides", "features", "perspectives", "shades"]',
        'A',
        1,
        'vocabulary',
        2,
        now (),
        'Fixed expressions'
    ),
    (
        'Choose the correct word to complete the sentence: "This new printer is recommended as being ...... reliable."',
        'multiple_choice',
        '["greatly", "highly", "strongly", "readily"]',
        'B',
        1,
        'vocabulary',
        2,
        now (),
        'Collocations'
    ),
    (
        'Choose the correct word to complete the sentence: "When I realised I had dropped my gloves, I decided to ...... my steps."',
        'multiple_choice',
        '["retrace", "regress", "resume", "return"]',
        'A',
        1,
        'vocabulary',
        3,
        now (),
        'Phrasal verbs'
    ),
    (
        'Choose the correct word to complete the sentence: "Anne''s house is somewhere in the ...... of the railway station."',
        'multiple_choice',
        '["region", "quarter", "vicinity", "district"]',
        'C',
        1,
        'vocabulary',
        2,
        now (),
        'Word meaning in context'
    ),
    (
        'Choose the correct word to complete the sentence: "She ___ to the gym every day after work."',
        'multiple_choice',
        '["go", "goes", "going", "went"]',
        'B',
        1,
        'vocabulary',
        1,
        now (),
        'Present Simple'
    ),
    (
        'Select the most appropriate word: "The CEO made a ___ that changed the company''s future."',
        'multiple_choice',
        '["decision", "decisive", "decide", "deciding"]',
        'A',
        1,
        'vocabulary',
        2,
        now (),
        'Word formation'
    ),
    (
        'Identify the synonym of "BENEFICIAL":',
        'multiple_choice',
        '["Harmful", "Advantageous", "Useless", "Trivial"]',
        'B',
        1,
        'vocabulary',
        3,
        now (),
        'Synonyms and antonyms'
    ),
    (
        'Choose the word that is closest in meaning to "AMBIGUOUS":',
        'multiple_choice',
        '["Clear", "Uncertain", "Obvious", "Simple"]',
        'B',
        1,
        'vocabulary',
        3,
        now (),
        'Synonyms and antonyms'
    ),
    (
        'Select the correct phrasal verb: "We need to ___ a solution to this problem quickly."',
        'multiple_choice',
        '["come up with", "come across as", "come down with", "come about"]',
        'A',
        1,
        'vocabulary',
        4,
        now (),
        'Phrasal verbs'
    ),
    (
        'Which sentence is grammatically correct?',
        'multiple_choice',
        '["She don''t like coffee.", "She doesn''t likes coffee.", "She doesn''t like coffee.", "She not like coffee."]',
        'C',
        1,
        'grammar',
        1,
        now (),
        'Subject-verb agreement'
    ),
    (
        'Choose the correct tense: "By the time we arrived, the movie ___."',
        'multiple_choice',
        '["already started", "has already started", "had already started", "would already start"]',
        'C',
        1,
        'grammar',
        3,
        now (),
        'Past Perfect tense'
    ),
    (
        'Identify the sentence with correct conditional form:',
        'multiple_choice',
        '["If I will see him, I will tell him.", "If I saw him, I will tell him.", "If I see him, I will tell him.", "If I would see him, I will tell him."]',
        'C',
        1,
        'grammar',
        3,
        now (),
        'Conditional sentences (Type 0/1)'
    ),
    (
        'Select the properly structured passive voice sentence:',
        'multiple_choice',
        '["The report was written by the team yesterday.", "The report written by the team yesterday.", "The report was wrote by the team yesterday.", "The report is written by the team yesterday."]',
        'A',
        1,
        'grammar',
        4,
        now (),
        'Passive voice'
    ),
    (
        'Choose the sentence with correct subject-verb agreement:',
        'multiple_choice',
        '["Neither the manager nor the employees is aware of the changes.", "Neither the manager nor the employees are aware of the changes.", "Neither the manager nor the employees was aware of the changes.", "Neither the manager nor the employees has been aware of the changes."]',
        'B',
        1,
        'grammar',
        4,
        now (),
        'Subject-verb agreement'
    ),
    (
        'Read the text and answer: "The company announced quarterly results that exceeded expectations. Revenue grew by 15% compared to the same period last year, while profits saw a 22% increase. The CEO attributed this success to new product lines and expanding markets." What increased by 22%?',
        'multiple_choice',
        '["Revenue", "Expectations", "Markets", "Profits"]',
        'D',
        1,
        'reading',
        2,
        now (),
        'Detail identification'
    ),
    (
        'Based on the passage: "Climate change poses significant challenges for coastal communities. Rising sea levels threaten infrastructure, while changing weather patterns affect local economies dependent on fishing and tourism." What TWO main challenges are mentioned?',
        'multiple_choice',
        '["Economic sanctions and political instability", "Rising sea levels and changing weather patterns", "Overpopulation and pollution", "Droughts and wildfires"]',
        'B',
        1,
        'reading',
        3,
        now (),
        'Main idea and inference'
    ),
    (
        'Analyze this text: "The author argues that technological advancement, while beneficial, often creates unintended social consequences. The rapid adoption of automation, for instance, displaces workers but also creates new opportunities in emerging fields." What is the author''s main point about technology?',
        'multiple_choice',
        '["It is entirely beneficial", "It has mixed consequences", "It should be avoided", "It only creates problems"]',
        'B',
        1,
        'reading',
        4,
        now (),
        'Main idea and inference'
    ),
    (
        'You hear: "I''m sorry, but Dr. Johnson won''t be available until next Tuesday." When will Dr. Johnson be available?',
        'multiple_choice',
        '["Today", "Next Tuesday", "Next month", "Tomorrow"]',
        'B',
        1,
        'listening',
        1,
        now (),
        'Detail identification'
    ),
    (
        'Listen to this conversation: "Should we take the highway or the scenic route? The highway is faster, but the scenic route is more pleasant." What are they discussing?',
        'multiple_choice',
        '["Weather conditions", "Travel routes", "Restaurant choices", "Time management"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Context understanding'
    ),
    (
        'You hear this announcement: "Due to unforeseen circumstances, flight BA 245 to Madrid has been delayed. Passengers are requested to proceed to Gate 12 for further information." What should passengers do?',
        'multiple_choice',
        '["Board immediately", "Go to Gate 12", "Check in again", "Cancel tickets"]',
        'B',
        1,
        'listening',
        3,
        now (),
        'Following instructions'
    ),
    (
        'Listen to this dialogue: "I think the marketing proposal needs more concrete data to support its claims. The concept is solid, but without statistical backing, it might not convince the board." What is the main criticism?',
        'multiple_choice',
        '["The concept is weak", "It lacks statistical data", "The board will definitely reject it", "It''s too expensive"]',
        'B',
        1,
        'listening',
        4,
        now (),
        'Speaker attitude'
    ),
    (
        'What would you say in this situation: You need to interrupt a meeting to deliver an urgent message.',
        'multiple_choice',
        '["Wait silently until someone notices you", "Barg in and speak loudly", "Knock politely and say ''Excuse me for the interruption, but I have an urgent message''", "Send a text message instead"]',
        'C',
        1,
        'speaking',
        3,
        now (),
        'Politeness strategies'
    ),
    (
        'Your colleague seems upset about a missed deadline. What is the most appropriate response?',
        'multiple_choice',
        '["Ignore them - it''s their problem", "Say ''You should have worked harder''", "Offer help and ask ''Is there anything I can do to assist?''", "Complain to your manager"]',
        'C',
        1,
        'speaking',
        3,
        now (),
        'Politeness strategies'
    ),
    (
        'How would you politely decline an invitation you can''t accept?',
        'multiple_choice',
        '["Sorry, I''m busy", "No, I don''t want to", "Thank you for the invitation, but I have a prior commitment", "Maybe next time"]',
        'C',
        1,
        'speaking',
        2,
        now (),
        'Politeness strategies'
    ),
    (
        'Identify the error in this sentence: "The collection of rare coins and antique jewelry were stolen from the museum last night."',
        'multiple_choice',
        '["collection of", "rare coins and", "were stolen", "from the museum"]',
        'C',
        1,
        'grammar',
        5,
        now (),
        'Subject-verb agreement'
    ),
    (
        'What is the implied meaning of this statement: "The project proposal, while ambitious, may require more resources than initially anticipated."',
        'multiple_choice',
        '["The proposal is perfect as is", "The proposal will definitely fail", "The proposal might be too expensive or demanding", "The proposal lacks ambition"]',
        'C',
        1,
        'reading',
        5,
        now (),
        'Main idea and inference'
    ),
    (
        'Choose the most formal and professional response: "I haven''t received the documents yet."',
        'multiple_choice',
        '["Where are my documents?", "Hey, send me those papers!", "I was wondering if you could provide an update on the documents I requested.", "I need those docs ASAP!"]',
        'C',
        1,
        'speaking',
        4,
        now (),
        'Register and formality'
    ),
    (
        'After planting the tree together, the two leaders said it _______ the friendship between their two countries.',
        'multiple_choice',
        '["symbolized","endorsed","imitated","substituted"]',
        'A',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Alice received _______ on her phone notifying her of bad weather coming to her area.',
        'multiple_choice',
        '["a beacon","an alert","a stimulation","a pointer"]',
        'B',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'After their victory, the team walked _______ in the parade.',
        'multiple_choice',
        '["substantially","triumphantly","overwhelmingly","persuasively"]',
        'B',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Jeremy was beginning to lose _______ with the fact that his lab partner always left him to complete the report.',
        'multiple_choice',
        '["endurance","tolerance","attraction","patience"]',
        'D',
        1,
        'vocabulary',
        1,
        now (),
        'Collocations'
    ),
    (
        'There is no official cleaning staff at the office; instead, there is a weekly _______ of cleaning tasks for employees.',
        'multiple_choice',
        '["spin","stint","rotation","revolution"]',
        'C',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'It looks like someone has begun to _______ that old house.',
        'multiple_choice',
        '["differentiate","activate","renovate","initiate"]',
        'C',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Timothy''s boss had to have a talk with him after he _______ a huge bill with the printing company.',
        'multiple_choice',
        '["ran up","cut up","threw up","filled up"]',
        'A',
        1,
        'vocabulary',
        1,
        now (),
        'Phrasal verbs'
    ),
    (
        'The star player of the soccer team _______ kicked the ball past the goalkeeper and into the net.',
        'multiple_choice',
        '["immensely","downright","deftly","exceedingly"]',
        'C',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Do you know the actor _______ is starring in that film?',
        'multiple_choice',
        '["he","him","who","whom"]',
        'C',
        1,
        'grammar',
        1,
        now (),
        'Relative clauses'
    ),
    (
        'We were both careless, but the mistake was probably _______ than yours.',
        'multiple_choice',
        '["more my fault","more at fault","the more fault of me","at more my fault"]',
        'A',
        1,
        'grammar',
        1,
        now (),
        'Comparatives and superlatives'
    ),
    (
        'At his old job, John _______ to have Saturdays off.',
        'multiple_choice',
        '["had used","was used","used","use"]',
        'C',
        1,
        'grammar',
        1,
        now (),
        'Used to + infinitive'
    ),
    (
        'The teacher told the class _______ so noisy.',
        'multiple_choice',
        '["to stop be","to stop being","stop to be","stopping to be"]',
        'B',
        1,
        'grammar',
        1,
        now (),
        'Gerunds and infinitives'
    ),
    (
        '"What were you doing in 2005?" "_______ that time, I was working as a nurse."',
        'multiple_choice',
        '["Since","For","At","In"]',
        'C',
        1,
        'grammar',
        1,
        now (),
        'Prepositions'
    ),
    (
        'Mr. Jones thought the students would be able to figure out _______ way to solve the problem.',
        'multiple_choice',
        '["best","some best","the best","a best"]',
        'C',
        1,
        'grammar',
        1,
        now (),
        'Articles (a/an/the)'
    ),
    (
        'Mike''s favorite restaurant is Pizza Party Place; he says he goes there _______.',
        'multiple_choice',
        '["all the time","the whole time","each of the times","all of the times"]',
        'A',
        1,
        'grammar',
        1,
        now (),
        'Fixed expressions'
    ),
    (
        '"I heard your daughter got a new job!" "Yes, she''s making enough money to _______ her own, so she''s moving into her own place."',
        'multiple_choice',
        '["live with","live on","live around","live in"]',
        'B',
        1,
        'grammar',
        1,
        now (),
        'Phrasal verbs'
    ),
    (
        'Nina gave an excellent response when she _______ to share her thoughts on the topic.',
        'multiple_choice',
        '["asks","to ask","was asked","is asking"]',
        'C',
        1,
        'grammar',
        1,
        now (),
        'Passive voice'
    ),
    (
        'Brianna felt proud of _______ learned how to use the new database on her own.',
        'multiple_choice',
        '["herself when","herself when she","her when","hers when she"]',
        'B',
        1,
        'grammar',
        1,
        now (),
        'Word order'
    ),
    (
        'My son followed the tour guide, _______ did the rest of us.',
        'multiple_choice',
        '["as","neither","either","nor"]',
        'A',
        1,
        'grammar',
        1,
        now (),
        'Word order'
    ),
    (
        '"Should we put on our safety glasses?" "You''d better, _______ the chemicals get in your eyes."',
        'multiple_choice',
        '["unless","otherwise","so that","until"]',
        'B',
        1,
        'grammar',
        1,
        now (),
        'Conditional sentences (Type 0/1)'
    ),
    (
        'Traveling alone around the world taught me many things I _______ known before.',
        'multiple_choice',
        '["haven''t","hadn''t","don''t","didn''t"]',
        'B',
        1,
        'grammar',
        1,
        now (),
        'Past Perfect'
    ),
    (
        '"Could I get a form to apply for a driver''s license?" "Yes, _______."',
        'multiple_choice',
        '["here you are","here are they","here is it","here that is"]',
        'A',
        1,
        'grammar',
        1,
        now (),
        'Conversational responses'
    ),
    (
        '"Can I change the time of my appointment?" "It _______ be a problem, but I need to ask the doctor first."',
        'multiple_choice',
        '["couldn''t","mustn''t","mightn''t","shouldn''t"]',
        'D',
        1,
        'grammar',
        1,
        now (),
        'Modal verbs (may/might/should)'
    ),
    (
        'The writer is known for his _______ novels, which tell amazing stories that could never happen in real life.',
        'multiple_choice',
        '["poetry","comedy","drama","fantasy"]',
        'D',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'The students are going to _______ money for their trip by selling cookies.',
        'multiple_choice',
        '["expand","lift","advance","raise"]',
        'D',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'In order to improve her skills, Sarah will _______ playing the piano every morning.',
        'multiple_choice',
        '["enforce","employ","practice","function"]',
        'C',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'For centuries, details about life deep in the ocean were largely _______.',
        'multiple_choice',
        '["empty","remote","distant","unknown"]',
        'D',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Agendas _______ a more efficient use of the time spent in meetings.',
        'multiple_choice',
        '["facilitate","recommend","urge","benefit"]',
        'A',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Each group chose _______ to describe their project to the entire class.',
        'multiple_choice',
        '["an administrator","a commander","a representative","an investigator"]',
        'C',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Jackie asked her friend to _______ up so they could get to the restaurant on time.',
        'multiple_choice',
        '["push","hurry","chase","rush"]',
        'B',
        1,
        'vocabulary',
        1,
        now (),
        'Phrasal verbs'
    ),
    (
        'Stella''s huge lead over the other candidates in the election for student council president means that the race is _______ over.',
        'multiple_choice',
        '["effectively","successfully","significantly","adequately"]',
        'A',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'The office manager hired a company to _______ a new alarm system in the building.',
        'multiple_choice',
        '["reserve","insert","install","possess"]',
        'C',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'It was his brother''s birthday, so Jeremy bought a card for the _______.',
        'multiple_choice',
        '["instance","venture","scenario","occasion"]',
        'D',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'Our teacher took great _______ in announcing the winners of this year''s speech competition.',
        'multiple_choice',
        '["comfort","pleasure","respect","excitement"]',
        'B',
        1,
        'vocabulary',
        1,
        now (),
        'Collocations'
    ),
    (
        'This June the local theater plans to _______ a Shakespeare performance in the park.',
        'multiple_choice',
        '["put on","come up","call for","give up"]',
        'A',
        1,
        'vocabulary',
        1,
        now (),
        'Phrasal verbs'
    ),
    (
        'Jessica liked the movie Robert suggested, even though she didn''t _______ watch action films.',
        'multiple_choice',
        '["typically","fundamentally","originally","essentially"]',
        'A',
        1,
        'vocabulary',
        1,
        now (),
        'Word meaning in context'
    ),
    (
        'The store has seen _______ increase in the number of customers over the last quarter.',
        'multiple_choice',
        '["a severe","a steady","a firm","an equal"]',
        'B',
        1,
        'vocabulary',
        1,
        now (),
        'Collocations'
    ),
    (
        'You hear: "The meeting has been moved from 3 PM to 4:30 PM due to a scheduling conflict." What time is the new meeting?',
        'multiple_choice',
        '["3:00 PM", "4:30 PM", "3:30 PM", "4:00 PM"]',
        'B',
        1,
        'listening',
        1,
        now (),
        'Detail identification'
    ),
    (
        'Listen to this instruction: "Please turn off all electronic devices and place them in the basket at the front of the room." What should you do with your phone?',
        'multiple_choice',
        '["Keep it on silent", "Turn it off and put it in the basket", "Give it to the teacher", "Leave it on your desk"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Following instructions'
    ),
    (
        'You hear: "I was supposed to meet John at the coffee shop, but he texted me that he''s running 15 minutes late." How late is John?',
        'multiple_choice',
        '["5 minutes", "10 minutes", "15 minutes", "20 minutes"]',
        'C',
        1,
        'listening',
        1,
        now (),
        'Detail identification'
    ),
    (
        'Listen to this conversation: "I think we should order pizza for the party." "That sounds good, but let''s also get some salad for people who want something healthier." What are they planning?',
        'multiple_choice',
        '["A business meeting", "A party menu", "A restaurant visit", "A cooking class"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Context understanding'
    ),
    (
        'You hear this weather report: "Tomorrow will be partly cloudy with a high of 75 degrees and a 30% chance of rain in the afternoon." What''s the weather forecast?',
        'multiple_choice',
        '["Sunny all day", "Heavy rain", "Partly cloudy with possible afternoon rain", "Snow expected"]',
        'C',
        1,
        'listening',
        2,
        now (),
        'Detail identification'
    ),
    (
        'Listen to this phone message: "Hi, this is Dr. Smith''s office. We need to reschedule your appointment from Friday to Monday at the same time." When is the new appointment?',
        'multiple_choice',
        '["Friday", "Monday", "Tuesday", "Wednesday"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Detail identification'
    ),
    (
        'You hear: "The train to Chicago will depart from platform 7 instead of platform 5. Please make note of this change." Which platform should you go to?',
        'multiple_choice',
        '["Platform 5", "Platform 7", "Platform 6", "Platform 8"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Following instructions'
    ),
    (
        'Listen to this conversation: "How was your vacation?" "It was relaxing, but I''m glad to be back. I missed the office." How does the speaker feel about returning to work?',
        'multiple_choice',
        '["Upset", "Happy", "Nervous", "Tired"]',
        'B',
        1,
        'listening',
        3,
        now (),
        'Speaker attitude'
    ),
    (
        'You hear: "I''m sorry, but we''re all booked up for tonight. However, I can offer you a table for tomorrow at 7 PM." What is the speaker offering?',
        'multiple_choice',
        '["A table for tonight", "A table for tomorrow", "A cancellation", "A waiting list"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Context understanding'
    ),
    (
        'Listen to this announcement: "Due to construction on Main Street, buses will be diverted through Oak Avenue until further notice." What should bus passengers expect?',
        'multiple_choice',
        '["Normal route", "Delayed service", "Route change", "Cancelled service"]',
        'C',
        1,
        'listening',
        3,
        now (),
        'Following instructions'
    ),
    -- Additional READING questions
    (
        'Read this notice: "The library will be closed for maintenance from December 1st to December 5th. All books due during this period will have their due date extended to December 8th." When does the library reopen?',
        'multiple_choice',
        '["December 1st", "December 5th", "December 6th", "December 8th"]',
        'C',
        1,
        'reading',
        2,
        now (),
        'Detail identification'
    ),
    (
        'According to this text: "Remote work has become increasingly popular, offering employees flexibility and reducing commute times. However, it also presents challenges such as maintaining team communication and work-life balance." What are TWO benefits of remote work mentioned?',
        'multiple_choice',
        '["Better pay and promotion opportunities", "Flexibility and reduced commute times", "More vacation time and better benefits", "Easier communication and less stress"]',
        'B',
        1,
        'reading',
        3,
        now (),
        'Detail identification'
    ),
    (
        'Read this email excerpt: "Thank you for your interest in our summer internship program. Unfortunately, applications for this year have already closed. We encourage you to apply next year, as applications typically open in February." When do applications usually open?',
        'multiple_choice',
        '["Summer", "February", "This year", "Next month"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Detail identification'
    ),
    (
        'Based on this passage: "The new shopping center will feature over 150 stores, including a major department store, multiple restaurants, and a cinema complex. Construction is expected to be completed by the end of next year." What type of facility is being described?',
        'multiple_choice',
        '["An office building", "A shopping center", "A residential complex", "A school campus"]',
        'B',
        1,
        'reading',
        1,
        now (),
        'Main idea and inference'
    ),
    (
        'Read this product review: "The camera quality is excellent and the battery life is impressive. However, the screen could be larger and the price is quite high compared to similar models." What is the reviewer''s overall opinion?',
        'multiple_choice',
        '["Completely positive", "Completely negative", "Mixed - both positive and negative points", "Neutral"]',
        'C',
        1,
        'reading',
        3,
        now (),
        'Main idea and inference'
    ),
    (
        'According to this article: "Studies show that regular exercise not only improves physical health but also enhances mental well-being by reducing stress and anxiety levels." What does regular exercise do besides improving physical health?',
        'multiple_choice',
        '["Increases stress levels", "Improves mental well-being", "Causes anxiety", "Has no other effects"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Detail identification'
    ),
    (
        'Read this instruction: "To reset your password, click on ''Forgot Password'', enter your email address, and check your inbox for a reset link. The link will expire after 24 hours." How long is the reset link valid?',
        'multiple_choice',
        '["12 hours", "24 hours", "48 hours", "1 week"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Detail identification'
    ),
    (
        'Based on this text: "The conference will address key challenges facing the healthcare industry, including rising costs, technological integration, and staff shortages. Experts from various hospitals will share their experiences and solutions." What is the main focus of the conference?',
        'multiple_choice',
        '["Technology training", "Healthcare challenges", "Hospital management", "Cost reduction only"]',
        'B',
        1,
        'reading',
        3,
        now (),
        'Main idea and inference'
    ),
    (
        'Read this policy update: "Effective immediately, all employees must badge in and out of the building. Failure to do so may result in disciplinary action. For questions, contact HR at extension 1234." What must employees do now?',
        'multiple_choice',
        '["Contact HR", "Work longer hours", "Badge in and out", "Attend a meeting"]',
        'C',
        1,
        'reading',
        2,
        now (),
        'Detail identification'
    ),
    (
        'According to this news report: "The city council approved the new park project with a budget of $2 million. Construction will begin next month and is expected to take 18 months to complete." When will the park project be finished?',
        'multiple_choice',
        '["Next month", "In 6 months", "In 18 months from next month", "In 2 years"]',
        'C',
        1,
        'reading',
        4,
        now (),
        'Detail identification'
    ),
    (
        'You''re at a restaurant and your food is cold. What''s the most polite way to address this?',
        'multiple_choice',
        '["This food is terrible!", "Excuse me, could you please warm this up? It seems to have gotten cold.", "I want my money back!", "You guys need to do better."]',
        'B',
        1,
        'speaking',
        2,
        now (),
        'Politeness strategies'
    ),
    (
        'A colleague asks for help with a project, but you''re already overloaded with work. How do you respond professionally?',
        'multiple_choice',
        '["I''m too busy, ask someone else.", "I''d really like to help, but I''m swamped with my current projects. Could we discuss this after I finish my deadline?", "No, I can''t help you.", "That''s not my job."]',
        'B',
        1,
        'speaking',
        3,
        now (),
        'Professional communication'
    ),
    (
        'You''re running late for an important meeting. What should you do?',
        'multiple_choice',
        '["Just show up late without saying anything", "Call or text to inform them you''re running late and provide an estimated arrival time", "Skip the meeting entirely", "Send an email after the meeting explaining why you missed it"]',
        'B',
        1,
        'speaking',
        2,
        now (),
        'Professional communication'
    ),
    (
        'Someone gives you directions, but you didn''t understand them clearly. What''s the best response?',
        'multiple_choice',
        '["Just nod and pretend you understood", "I''m sorry, could you please repeat that? I want to make sure I understand correctly.", "Never mind, I''ll figure it out myself.", "That doesn''t make sense."]',
        'B',
        1,
        'speaking',
        2,
        now (),
        'Asking for clarification'
    ),
    (
        'You need to disagree with your boss''s suggestion in a meeting. How do you do this respectfully?',
        'multiple_choice',
        '["That''s a bad idea.", "I see your point, however, I''d like to suggest an alternative approach. What if we considered...?", "You''re wrong about that.", "I don''t agree with you."]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Professional disagreement'
    ),
    (
        'A customer is complaining about a service. How do you respond professionally?',
        'multiple_choice',
        '["That''s not my fault.", "I understand your frustration. Let me see how I can help resolve this issue for you.", "You should have read the fine print.", "Complain to someone else."]',
        'B',
        1,
        'speaking',
        3,
        now (),
        'Customer service'
    ),
    (
        'You want to make a suggestion during a team meeting. What''s the best way to introduce your idea?',
        'multiple_choice',
        '["This is what we should do...", "I have an idea that might work. Would you like to hear it?", "You''re all thinking about this wrong.", "Listen to me, I know what to do."]',
        'B',
        1,
        'speaking',
        3,
        now (),
        'Making suggestions'
    ),
    (
        'Someone compliments your work. How do you respond appropriately?',
        'multiple_choice',
        '["I know, I''m really good at this.", "Thank you, I appreciate that. I put a lot of effort into it.", "It was nothing special.", "You''re just being nice."]',
        'B',
        1,
        'speaking',
        2,
        now (),
        'Accepting compliments'
    ),
    (
        'You need to ask your supervisor for time off. What''s the most professional approach?',
        'multiple_choice',
        '["I''m taking next Friday off.", "I need to request time off for next Friday. Would that be possible given our current workload?", "I won''t be here Friday.", "Cover for me on Friday."]',
        'B',
        1,
        'speaking',
        3,
        now (),
        'Making requests'
    ),
    (
        'During a presentation, someone asks a question you don''t know the answer to. What should you do?',
        'multiple_choice',
        '["Make up an answer", "That''s a great question. I don''t have that information right now, but I''ll follow up with you after I research it.", "Ask someone else in the room", "Change the subject quickly"]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Handling uncertainty'
    ),
    (
        'How would you introduce yourself at a professional networking event?',
        'multiple_choice',
        '["Hi, I''m here for the free food.", "Hello, I''m [Name] and I work in [field]. What brings you here tonight?", "Hey, what''s up?", "I don''t like talking to strangers."]',
        'B',
        1,
        'speaking',
        2,
        now (),
        'Professional introductions'
    ),
    (
        'You need to give constructive feedback to a team member. What''s the best approach?',
        'multiple_choice',
        '["You''re doing everything wrong.", "I''d like to discuss some areas where we might improve. Could we schedule a time to talk?", "You need to fix your attitude.", "Just ignore the problems."]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Giving feedback'
    ),
    (
        'Someone interrupts you while you''re speaking in a meeting. How do you handle this?',
        'multiple_choice',
        '["Get angry and shout at them", "Politely say ''I''d like to finish my point, then I''d be happy to hear your thoughts''", "Stop talking immediately", "Ignore them completely"]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Handling interruptions'
    ),
    (
        'You''re asked to explain a complex technical concept to a non-technical audience. What do you do?',
        'multiple_choice',
        '["Use lots of technical jargon", "Break it down into simple terms and use analogies they can relate to", "Tell them it''s too complicated for them", "Speak louder and slower"]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Explaining complex topics'
    ),
    (
        'A client seems unhappy with your service. What''s your first response?',
        'multiple_choice',
        '["That''s not my problem.", "I''m sorry to hear you''re not satisfied. Can you help me understand what went wrong so I can fix it?", "You''re being unreasonable.", "Talk to my manager."]',
        'B',
        1,
        'speaking',
        3,
        now (),
        'Handling complaints'
    ),
    (
        'You need to negotiate a deadline extension with your manager. How do you approach this?',
        'multiple_choice',
        '["I can''t finish on time, deal with it.", "I need to discuss the current timeline. Given some unexpected challenges, could we explore a brief extension?", "This deadline is impossible.", "I quit."]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Negotiation skills'
    ),
    (
        'How do you politely end a conversation that''s gone on too long?',
        'multiple_choice',
        '["Just walk away", "It''s been great talking with you. I should get back to work now.", "You talk too much.", "Stop talking to me."]',
        'B',
        1,
        'speaking',
        3,
        now (),
        'Conversation management'
    ),
    (
        'You''re presenting to a group and notice people look confused. What should you do?',
        'multiple_choice',
        '["Continue exactly as planned", "Pause and ask ''Does everyone follow so far? Should I clarify anything?''", "Speak faster to finish quickly", "Ignore their expressions"]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Reading audience'
    ),
    (
        'A colleague takes credit for your idea in a meeting. How do you respond?',
        'multiple_choice',
        '["Accuse them publicly", "After the meeting, speak with them privately about the attribution", "Do nothing and stay angry", "Complain to everyone except them"]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Workplace conflict'
    ),
    (
        'You''re asked to give an impromptu speech. How do you structure it?',
        'multiple_choice',
        '["Just start talking randomly", "Quickly think: opening, main points, conclusion", "Say you can''t do it", "Make jokes the whole time"]',
        'B',
        1,
        'speaking',
        4,
        now (),
        'Impromptu speaking'
    ),
    (
        'Someone asks you a question you partially know but aren''t completely sure about. What do you do?',
        'multiple_choice',
        '["Make up the missing parts", "Share what you know and clarify where you''re uncertain", "Pretend you know everything", "Refuse to answer at all"]',
        'B',
        1,
        'speaking',
        3,
        now (),
        'Acknowledging uncertainty'
    ),
    -- Additional READING questions to reach ~30
    (
        'Read this email: "Due to the upcoming system maintenance, all employees must save their work frequently and log out by 5 PM on Friday. The system will be unavailable from 6 PM Friday until 8 AM Monday. Please plan accordingly." What should employees do by Friday at 5 PM?',
        'multiple_choice',
        '["Start system maintenance", "Save work and log out", "Work overtime", "Contact IT support"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Following instructions'
    ),
    (
        'According to this manual: "To activate the safety feature, press and hold the red button for 3 seconds. A green light will indicate successful activation. If the light doesn''t appear, repeat the process." What indicates successful activation?',
        'multiple_choice',
        '["Red button lights up", "Green light appears", "System beeps", "Screen flashes"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Technical instructions'
    ),
    (
        'Read this job posting: "We seek a marketing coordinator with 2-3 years experience in digital marketing. Candidates must be proficient in social media management and have excellent communication skills. Bachelor''s degree preferred." What is required experience?',
        'multiple_choice',
        '["1-2 years", "2-3 years", "3-4 years", "5+ years"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Job requirements'
    ),
    (
        'Based on this article: "The study followed 1,000 participants over 5 years. Researchers found that people who exercised regularly showed 25% better cognitive performance compared to sedentary individuals." What was the main finding?',
        'multiple_choice',
        '["Exercise improves physical health", "Regular exercise improves cognitive performance", "1,000 people participated", "The study lasted 5 years"]',
        'B',
        1,
        'reading',
        3,
        now (),
        'Research findings'
    ),
    (
        'Read this contract clause: "The tenant is responsible for all utilities except water and garbage collection, which are included in the monthly rent of $1,200." What utilities must the tenant pay?',
        'multiple_choice',
        '["All utilities including water", "Only electricity and gas", "All utilities except water and garbage", "No utilities"]',
        'C',
        1,
        'reading',
        3,
        now (),
        'Contract details'
    ),
    (
        'According to this travel advisory: "Travelers to Region X should be aware of seasonal flooding from June to August. Alternative routes may be necessary. Check local conditions before departure." When does flooding occur?',
        'multiple_choice',
        '["Year-round", "June to August", "Winter months", "Spring season"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Travel information'
    ),
    (
        'Read this recipe instruction: "Preheat oven to 350°F. Mix dry ingredients in a large bowl. In a separate bowl, combine wet ingredients. Gradually add wet mixture to dry ingredients, stirring until just combined. Bake for 25-30 minutes." What temperature should the oven be?',
        'multiple_choice',
        '["300°F", "350°F", "375°F", "400°F"]',
        'B',
        1,
        'reading',
        1,
        now (),
        'Following directions'
    ),
    (
        'Based on this warranty: "This product is covered for defects in materials and workmanship for 2 years from purchase date. Normal wear and damage from misuse are not covered. Contact customer service for claims." What is NOT covered?',
        'multiple_choice',
        '["Material defects", "Workmanship defects", "Normal wear and misuse", "Manufacturing problems"]',
        'C',
        1,
        'reading',
        3,
        now (),
        'Warranty terms'
    ),
    (
        'Read this safety notice: "In case of fire, do not use elevators. Use designated stairwells only. Proceed to the nearest exit in an orderly fashion. Meet at the assembly point in the parking lot." Where should people go during a fire emergency?',
        'multiple_choice',
        '["Wait by elevators", "Stay in offices", "Use stairwells to nearest exit", "Go to the roof"]',
        'C',
        1,
        'reading',
        2,
        now (),
        'Emergency procedures'
    ),
    (
        'According to this investment summary: "The portfolio gained 8% last year, outperforming the market average of 6%. However, investors should note that past performance does not guarantee future results." What was the market average performance?',
        'multiple_choice',
        '["8%", "6%", "2%", "14%"]',
        'B',
        1,
        'reading',
        3,
        now (),
        'Financial information'
    ),
    (
        'Read this medical instruction: "Take one tablet twice daily with food. Do not exceed 4 tablets in 24 hours. If symptoms persist after 7 days, consult your doctor." What is the maximum daily dosage?',
        'multiple_choice',
        '["2 tablets", "4 tablets", "6 tablets", "8 tablets"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Medical instructions'
    ),
    (
        'Based on this environmental report: "Air quality index reached 150 yesterday, which is considered unhealthy for sensitive groups. Children, elderly, and people with respiratory conditions should limit outdoor activities." Who should limit outdoor activities?',
        'multiple_choice',
        '["Everyone", "Only children", "Sensitive groups including children, elderly, and those with respiratory conditions", "No one needs to limit activities"]',
        'C',
        1,
        'reading',
        3,
        now (),
        'Health advisories'
    ),
    (
        'Read this return policy: "Items may be returned within 30 days of purchase with original receipt. Items must be in original condition with tags attached. Final sale items cannot be returned." What is required for returns?',
        'multiple_choice',
        '["Only original condition", "Receipt and original condition with tags", "Just the receipt", "Nothing special required"]',
        'B',
        1,
        'reading',
        3,
        now (),
        'Policy details'
    ),
    (
        'According to this training schedule: "Module 1: Monday 9-11 AM, Module 2: Wednesday 2-4 PM, Module 3: Friday 10-12 PM. All sessions are mandatory. Make-up sessions available by request." When is Module 2?',
        'multiple_choice',
        '["Monday 9-11 AM", "Wednesday 2-4 PM", "Friday 10-12 PM", "Any time by request"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Schedule information'
    ),
    (
        'Read this technical specification: "Operating temperature: -10°C to 45°C. Storage temperature: -20°C to 60°C. Humidity: 10-90% non-condensing. Power consumption: 25W maximum." What is the operating temperature range?',
        'multiple_choice',
        '["-20°C to 60°C", "-10°C to 45°C", "10-90%", "25W maximum"]',
        'B',
        1,
        'reading',
        2,
        now (),
        'Technical specifications'
    ),
    (
        'Based on this event announcement: "The annual conference will be held virtually this year due to ongoing health concerns. Registration opens March 1st and closes March 15th. Early bird discount available until March 10th." When does registration close?',
        'multiple_choice',
        '["March 1st", "March 10th", "March 15th", "March 31st"]',
        'C',
        1,
        'reading',
        2,
        now (),
        'Event details'
    ),
    -- Additional LISTENING questions to reach ~30
    (
        'You hear this voicemail: "Hi, this is Sarah from ABC Company. I''m calling about the proposal you submitted. Could you please call me back at 555-0123? I have a few questions about the timeline." What does Sarah want to discuss?',
        'multiple_choice',
        '["Payment terms", "The timeline", "Contract details", "Meeting schedule"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Business communication'
    ),
    (
        'Listen to this hotel receptionist: "I''m sorry, but we don''t have any rooms available tonight. However, I can book you for tomorrow night, or I can recommend a nearby hotel that might have availability." What is the receptionist offering?',
        'multiple_choice',
        '["A room for tonight", "A room for tomorrow or an alternative hotel", "A discount for waiting", "A cancellation list"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Service alternatives'
    ),
    (
        'You hear this traffic report: "There''s a major accident on Highway 101 southbound at Exit 25. Traffic is backed up for 3 miles. We recommend taking Route 82 as an alternate." What should drivers do?',
        'multiple_choice',
        '["Wait in traffic on Highway 101", "Take Route 82 instead", "Turn around and go home", "Call for help"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Traffic instructions'
    ),
    (
        'Listen to this supervisor: "I know everyone''s been working hard on this project. The deadline is tight, but I believe we can make it if we focus on the essential features first." What is the supervisor''s attitude?',
        'multiple_choice',
        '["Worried and pessimistic", "Encouraging and strategic", "Angry and demanding", "Confused and uncertain"]',
        'B',
        1,
        'listening',
        3,
        now (),
        'Tone and attitude'
    ),
    (
        'You hear this customer service representative: "I understand your frustration, Mr. Johnson. Let me transfer you to our technical support team. They''ll be better equipped to help you with this software issue." Where is the caller being transferred?',
        'multiple_choice',
        '["Billing department", "Technical support", "Sales team", "Management"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Call routing'
    ),
    (
        'Listen to this cooking instructor: "Now we''ll add the cream slowly while stirring constantly. If you add it too quickly, the sauce will curdle. Keep the heat on medium-low." What might happen if you add cream too quickly?',
        'multiple_choice',
        '["The sauce will be too thin", "The sauce will curdle", "The sauce will be too thick", "Nothing will happen"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Process instructions'
    ),
    (
        'You hear this financial advisor: "Given the current market conditions, I''d recommend a more conservative approach to your investments. We should consider moving some funds to lower-risk options." What is the advisor suggesting?',
        'multiple_choice',
        '["Take bigger risks", "Move to conservative investments", "Sell everything", "Buy more stocks"]',
        'B',
        1,
        'listening',
        3,
        now (),
        'Professional advice'
    ),
    (
        'Listen to this gym instructor: "Remember to keep your core engaged throughout the movement. Don''t hold your breath - maintain steady breathing. If you feel any pain, stop immediately." What should you do if you feel pain?',
        'multiple_choice',
        '["Push through it", "Stop immediately", "Breathe harder", "Engage your core more"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Safety instructions'
    ),
    (
        'You hear this real estate agent: "The house has great potential, but it does need some updating. The kitchen appliances are from the 1980s, and the bathrooms could use renovation." What is the agent''s opinion of the house?',
        'multiple_choice',
        '["It''s perfect as is", "It has potential but needs updates", "It''s too expensive", "It''s in terrible condition"]',
        'B',
        1,
        'listening',
        3,
        now (),
        'Property assessment'
    ),
    (
        'Listen to this teacher: "For tomorrow''s test, focus on chapters 5 through 8. Pay special attention to the examples we worked through in class. You may use a calculator, but show all your work." What should students focus on?',
        'multiple_choice',
        '["All chapters", "Chapters 5-8", "Only examples", "Calculator skills"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Academic instructions'
    ),
    (
        'You hear this tech support: "It sounds like your router needs to be reset. Unplug it for 30 seconds, then plug it back in. Wait 2 minutes for it to fully restart before testing your connection." How long should you wait after plugging it back in?',
        'multiple_choice',
        '["30 seconds", "1 minute", "2 minutes", "5 minutes"]',
        'C',
        1,
        'listening',
        2,
        now (),
        'Technical support'
    ),
    (
        'Listen to this tour guide: "Our next stop is the famous cathedral, built in the 12th century. Please stay with the group and watch your step on the cobblestones. We''ll have 20 minutes to explore." What should tourists be careful about?',
        'multiple_choice',
        '["Taking photos", "Staying with the group and watching for cobblestones", "Talking loudly", "Touching artifacts"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Safety and guidance'
    ),
    (
        'You hear this pharmacist: "Take this medication with a full glass of water, preferably with food to avoid stomach upset. Don''t take it with dairy products as they can interfere with absorption." What should you avoid taking with this medication?',
        'multiple_choice',
        '["Water", "Food", "Dairy products", "Other medications"]',
        'C',
        1,
        'listening',
        3,
        now (),
        'Medical advice'
    ),
    (
        'Listen to this project manager: "We''re slightly behind schedule, but if we can finish the testing phase by Friday, we should still meet our deadline. I''ll need everyone to prioritize this over other tasks." What needs to be completed by Friday?',
        'multiple_choice',
        '["The entire project", "The testing phase", "All other tasks", "The planning phase"]',
        'B',
        1,
        'listening',
        3,
        now (),
        'Project timeline'
    ),
    (
        'You hear this bank teller: "To open a savings account, you''ll need two forms of ID, proof of address, and a minimum deposit of $100. The account earns 2% annual interest." What is the minimum deposit required?',
        'multiple_choice',
        '["$50", "$100", "$200", "$500"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Banking requirements'
    ),
    (
        'Listen to this wedding planner: "The ceremony will start at 4 PM sharp. Please arrive by 3:30 to get seated. The reception begins at 6 PM in the adjacent hall." When should guests arrive?',
        'multiple_choice',
        '["4:00 PM", "3:30 PM", "6:00 PM", "3:00 PM"]',
        'B',
        1,
        'listening',
        2,
        now (),
        'Event timing'
    );

CREATE TABLE
    IF NOT EXISTS test_answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        test_result_id INTEGER REFERENCES test_results_level (id) ON DELETE CASCADE,
        question_id INTEGER,
        selected_option VARCHAR(255),
        correct_option VARCHAR(255),
        is_correct BOOLEAN,
        question_type VARCHAR(50),
        response_time REAL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Learning preferences: tracks student performance by question type
CREATE TABLE
    IF NOT EXISTS learning_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        question_type VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        total_attempts INTEGER DEFAULT 0,
        correct_attempts INTEGER DEFAULT 0,
        avg_response_time REAL,
        success_rate REAL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, question_type, category)
    );

-- Question format alternatives: stores multiple formats for the same content
CREATE TABLE
    IF NOT EXISTS question_alternatives (
        id SERIAL PRIMARY KEY,
        base_question_id INTEGER REFERENCES placement_questions (id) ON DELETE CASCADE,
        question_type VARCHAR(50) NOT NULL,
        question_text TEXT NOT NULL,
        options JSONB,
        correct_answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Classroom tables
CREATE TABLE
    IF NOT EXISTS Classrooms (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        invite_code VARCHAR(10) UNIQUE NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS Classroom_members (
        id SERIAL PRIMARY KEY,
        classroom_id INTEGER NOT NULL REFERENCES Classrooms (id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (classroom_id, user_id)
    );

CREATE TABLE
    IF NOT EXISTS Classroom_tests (
        id SERIAL PRIMARY KEY,
        classroom_id INTEGER NOT NULL REFERENCES Classrooms (id) ON DELETE CASCADE,
        test_id INTEGER NOT NULL REFERENCES Teachers_tests (id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (classroom_id, test_id)
    );

-- Table to store student results from teacher tests
CREATE TABLE
    IF NOT EXISTS Teacher_test_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        test_id INTEGER NOT NULL REFERENCES Teachers_tests (id) ON DELETE CASCADE,
        score REAL NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        avg_response_time REAL,
        taken_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

-- Table to store individual answers for teacher tests
CREATE TABLE
    IF NOT EXISTS Teacher_test_answers (
        id SERIAL PRIMARY KEY,
        result_id INTEGER NOT NULL REFERENCES Teacher_test_results (id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES Teachers_questions (id) ON DELETE CASCADE,
        selected_answer VARCHAR(1) NOT NULL,
        is_correct BOOLEAN NOT NULL,
        response_time REAL,
        answered_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );