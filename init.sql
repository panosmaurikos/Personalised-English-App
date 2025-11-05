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
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
        'multiple_choice',
        '["Sorry, I did that.", "It''s the same place.", "Only for half an hour."]',
        'C',
        1,
        'speaking',
        1,
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
        'Conversational responses'
    ),
    (
        'Choose the correct word to complete the sentence: "His eyes were ...... bad that he couldn''t read the number plate of the car in front."',
        'fill_in_blank',
        '["such", "too", "so", "very"]',
        'C',
        1,
        'grammar',
        2,
        now(),
        'Result clauses (so...that)'
    ),
    (
        'Choose the correct word to complete the sentence: "The company needs to decide ...... and for all what its position is on this point."',
        'fill_in_blank',
        '["here", "once", "first", "finally"]',
        'B',
        1,
        'vocabulary',
        2,
        now(),
        'Fixed expressions'
    ),
    (
        'Choose the correct word to complete the sentence: "Don''t put your cup on the ...... of the table - someone will knock it off."',
        'fill_in_blank',
        '["outside", "edge", "boundary", "border"]',
        'B',
        1,
        'vocabulary',
        1,
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
        'Gerunds and infinitives'
    ),
    (
        'Choose the correct word to complete the sentence: "...... tired Melissa is when she gets home from work, she always makes time to say goodnight to the children."',
        'multiple_choice',
        '["Whatever", "No matter how", "However much", "Although"]',
        'B',
        1,
        'grammar',
        3,
        now(),
        'Concession clauses'
    ),
    (
        'Choose the correct word to complete the sentence: "It was only ten days ago ...... she started her new job."',
        'multiple_choice',
        '["then", "since", "after", "that"]',
        'D',
        1,
        'grammar',
        2,
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
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
        now(),
        'Register and formality'
    ),
('After planting the tree together, the two leaders said it _______ the friendship between their two countries.', 'multiple', '["symbolized","endorsed","imitated","substituted"]', 'A', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Alice received _______ on her phone notifying her of bad weather coming to her area.', 'multiple', '["a beacon","an alert","a stimulation","a pointer"]', 'B', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('After their victory, the team walked _______ in the parade.', 'multiple', '["substantially","triumphantly","overwhelmingly","persuasively"]', 'B', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Jeremy was beginning to lose _______ with the fact that his lab partner always left him to complete the report.', 'multiple', '["endurance","tolerance","attraction","patience"]', 'D', 1, 'vocabulary', 1, now(), 'Collocations'),
('Some students thrive in highly _______ classroom environments; others prefer classes with more creativity allowed.', 'multiple', '["analytical","deliberate","structured","intricate"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('There is no official cleaning staff at the office; instead, there is a weekly _______ of cleaning tasks for employees.', 'multiple', '["spin","stint","rotation","revolution"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('It looks like someone has begun to _______ that old house.', 'multiple', '["differentiate","activate","renovate","initiate"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('To allow for some privacy, a _______ was installed around each salesperson''s desk.', 'multiple', '["solitude","partition","hurdle","boundary"]', 'B', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Juan quickly realized that reorganizing his filing cabinet was going to be a _______ task.', 'multiple', '["formidable","fierce","harsh","powerful"]', 'A', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('At some companies, inexperience would be considered a _______, but here it is an asset.', 'multiple', '["liability","vice","blame","downside"]', 'A', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Vivian thought it would be wise to _______ her memory a bit before her chemistry class started up again.', 'multiple', '["renew","refresh","restore","revitalize"]', 'B', 1, 'vocabulary', 1, now(), 'Collocations'),
('John spoke to his professor about changing his grade, but it was to no _______.', 'multiple', '["avail","culmination","applicability","resolve"]', 'A', 1, 'vocabulary', 1, now(), 'Fixed expressions'),
('Timothy''s boss had to have a talk with him after he _______ a huge bill with the printing company.', 'multiple', '["ran up","cut up","threw up","filled up"]', 'A', 1, 'vocabulary', 1, now(), 'Phrasal verbs'),
('Sarah''s parents praised her so much that she was _______.', 'multiple', '["clouded","heightened","beaming","distinct"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('The star player of the soccer team _______ kicked the ball past the goalkeeper and into the net.', 'multiple', '["immensely","downright","deftly","exceedingly"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('The city council meeting was spoiled by a few _______ community members who opposed every action proposed by the elected officials.', 'multiple', '["contrived","strenuous","contentious","mundane"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Do you know the actor _______ is starring in that film?', 'multiple', '["he","him","who","whom"]', 'C', 1, 'grammar', 1, now(), 'Relative clauses'),
('We were both careless, but the mistake was probably _______ than yours.', 'multiple', '["more my fault","more at fault","the more fault of me","at more my fault"]', 'A', 1, 'grammar', 1, now(), 'Comparatives and superlatives'),
('At his old job, John _______ to have Saturdays off.', 'multiple', '["had used","was used","used","use"]', 'C', 1, 'grammar', 1, now(), 'Used to + infinitive'),
('The teacher told the class _______ so noisy.', 'multiple', '["to stop be","to stop being","stop to be","stopping to be"]', 'B', 1, 'grammar', 1, now(), 'Gerunds and infinitives'),
('"What were you doing in 2005?" "_______ that time, I was working as a nurse."', 'multiple', '["Since","For","At","In"]', 'C', 1, 'grammar', 1, now(), 'Prepositions'),
('Mr. Jones thought the students would be able to figure out _______ way to solve the problem.', 'multiple', '["best","some best","the best","a best"]', 'C', 1, 'grammar', 1, now(), 'Articles (a/an/the)'),
('Mike''s favorite restaurant is Pizza Party Place; he says he goes there _______.', 'multiple', '["all the time","the whole time","each of the times","all of the times"]', 'A', 1, 'grammar', 1, now(), 'Fixed expressions'),
('"I heard your daughter got a new job!" "Yes, she''s making enough money to _______ her own, so she''s moving into her own place."', 'multiple', '["live with","live on","live around","live in"]', 'B', 1, 'grammar', 1, now(), 'Phrasal verbs'),
('Nina gave an excellent response when she _______ to share her thoughts on the topic.', 'multiple', '["asks","to ask","was asked","is asking"]', 'C', 1, 'grammar', 1, now(), 'Passive voice'),
('Brianna felt proud of _______ learned how to use the new database on her own.', 'multiple', '["herself when","herself when she","her when","hers when she"]', 'B', 1, 'grammar', 1, now(), 'Word order'),
('My son followed the tour guide, _______ did the rest of us.', 'multiple', '["as","neither","either","nor"]', 'A', 1, 'grammar', 1, now(), 'Word order'),
('"Should we put on our safety glasses?" "You''d better, _______ the chemicals get in your eyes."', 'multiple', '["unless","otherwise","so that","until"]', 'B', 1, 'grammar', 1, now(), 'Conditional sentences (Type 0/1)'),
('Traveling alone around the world taught me many things I _______ known before.', 'multiple', '["haven''t","hadn''t","don''t","didn''t"]', 'B', 1, 'grammar', 1, now(), 'Past Perfect'),
('"Could I get a form to apply for a driver''s license?" "Yes, _______."', 'multiple', '["here you are","here are they","here is it","here that is"]', 'A', 1, 'grammar', 1, now(), 'Conversational responses'),
('"Can I change the time of my appointment?" "It _______ be a problem, but I need to ask the doctor first."', 'multiple', '["couldn''t","mustn''t","mightn''t","shouldn''t"]', 'D', 1, 'grammar', 1, now(), 'Modal verbs (may/might/should)'),
('The writer is known for his _______ novels, which tell amazing stories that could never happen in real life.', 'multiple', '["poetry","comedy","drama","fantasy"]', 'D', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('The students are going to _______ money for their trip by selling cookies.', 'multiple', '["expand","lift","advance","raise"]', 'D', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('In order to improve her skills, Sarah will _______ playing the piano every morning.', 'multiple', '["enforce","employ","practice","function"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('For centuries, details about life deep in the ocean were largely _______.', 'multiple', '["empty","remote","distant","unknown"]', 'D', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Agendas _______ a more efficient use of the time spent in meetings.', 'multiple', '["facilitate","recommend","urge","benefit"]', 'A', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Each group chose _______ to describe their project to the entire class.', 'multiple', '["an administrator","a commander","a representative","an investigator"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Jackie asked her friend to _______ up so they could get to the restaurant on time.', 'multiple', '["push","hurry","chase","rush"]', 'B', 1, 'vocabulary', 1, now(), 'Phrasal verbs'),
('Stella''s huge lead over the other candidates in the election for student council president means that the race is _______ over.', 'multiple', '["effectively","successfully","significantly","adequately"]', 'A', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('The office manager hired a company to _______ a new alarm system in the building.', 'multiple', '["reserve","insert","install","possess"]', 'C', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('It was his brother''s birthday, so Jeremy bought a card for the _______.', 'multiple', '["instance","venture","scenario","occasion"]', 'D', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('Our teacher took great _______ in announcing the winners of this year''s speech competition.', 'multiple', '["comfort","pleasure","respect","excitement"]', 'B', 1, 'vocabulary', 1, now(), 'Collocations'),
('This June the local theater plans to _______ a Shakespeare performance in the park.', 'multiple', '["put on","come up","call for","give up"]', 'A', 1, 'vocabulary', 1, now(), 'Phrasal verbs'),
('Jessica liked the movie Robert suggested, even though she didn''t _______ watch action films.', 'multiple', '["typically","fundamentally","originally","essentially"]', 'A', 1, 'vocabulary', 1, now(), 'Word meaning in context'),
('The store has seen _______ increase in the number of customers over the last quarter.', 'multiple', '["a severe","a steady","a firm","an equal"]', 'B', 1, 'vocabulary', 1, now(), 'Collocations');

CREATE TABLE IF NOT EXISTS test_answers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    test_result_id INTEGER REFERENCES test_results_level(id) ON DELETE CASCADE,
    question_id INTEGER,
    selected_option VARCHAR(255),
    correct_option VARCHAR(255),
    is_correct BOOLEAN,
    question_type VARCHAR(50),
    response_time REAL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning preferences: tracks student performance by question type
CREATE TABLE IF NOT EXISTS learning_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    avg_response_time REAL,
    success_rate REAL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_type, category)
);

-- Question format alternatives: stores multiple formats for the same content
CREATE TABLE IF NOT EXISTS question_alternatives (
    id SERIAL PRIMARY KEY,
    base_question_id INTEGER REFERENCES placement_questions(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classroom tables
CREATE TABLE IF NOT EXISTS Classrooms (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Classroom_members (
    id SERIAL PRIMARY KEY,
    classroom_id INTEGER NOT NULL REFERENCES Classrooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(classroom_id, user_id)
);

CREATE TABLE IF NOT EXISTS Classroom_tests (
    id SERIAL PRIMARY KEY,
    classroom_id INTEGER NOT NULL REFERENCES Classrooms(id) ON DELETE CASCADE,
    test_id INTEGER NOT NULL REFERENCES Teachers_tests(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(classroom_id, test_id)
);

-- Table to store student results from teacher tests
CREATE TABLE IF NOT EXISTS Teacher_test_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id INTEGER NOT NULL REFERENCES Teachers_tests(id) ON DELETE CASCADE,
    score REAL NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    avg_response_time REAL,
    taken_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store individual answers for teacher tests
CREATE TABLE IF NOT EXISTS Teacher_test_answers (
    id SERIAL PRIMARY KEY,
    result_id INTEGER NOT NULL REFERENCES Teacher_test_results(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES Teachers_questions(id) ON DELETE CASCADE,
    selected_answer VARCHAR(1) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time REAL,
    answered_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);