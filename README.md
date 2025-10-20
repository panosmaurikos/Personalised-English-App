
# Personalised English Learning App

A comprehensive web application for personalized English language learning with adaptive testing, classroom management, and fuzzy logic-powered recommendations.

## Features


### For Students
- **Adaptive Testing**: Take dynamic tests that adjust to your skill level
- **Personalized Practice**: Get question recommendations based on your mistakes and learning patterns using fuzzy logic
- **Progress Tracking**: Monitor your performance with detailed analytics and statistics
- **Classroom Integration**: Join classrooms with invite codes and take teacher-assigned tests
- **Performance Analytics**:
  - Score tracking over time
  - Mistake categorization (Grammar, Vocabulary, Reading, Listening)
  - Response time analysis
  - Level progression (Beginner → Intermediate → Advanced)


### For Teachers
- **Test Management**: Create, edit, and manage custom tests with multiple question types
- **Classroom Management**: Create and manage virtual classrooms
- **Student Monitoring**: Track student progress and test results
- **Detailed Analytics**: View comprehensive breakdowns of student performance
- **Flexible Assignment**: Assign tests to specific classrooms

### Question Types
- **Vocabulary**: Test word knowledge and usage
- **Grammar**: Assess grammatical understanding
- **Reading**: Comprehension exercises
- **Listening**: Audio-based questions with text-to-speech

## Architecture

### Technology Stack

#### Frontend
- **React 19.1.0** - Modern UI framework
- **React Router** - Client-side routing
- **Ant Design** - UI component library
- **Bootstrap 5** - Additional styling
- **Chart.js** - Data visualization
- **Day.js** - Date manipulation
- **Axios** - HTTP client

#### Backend
- **Go 1.24.5** - High-performance backend
- **Gorilla Mux** - HTTP routing
- **PostgreSQL 15** - Relational database
- **JWT** - Authentication
- **CORS** - Cross-origin resource sharing

#### Infrastructure
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Data persistence
- **Nginx** (in production) - Static file serving

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/panosmaurikos/personalisedenglish.git
cd personalisedenglish
```

2. **Set up environment variables**

Create a `.env` file in the root directory:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=myuser
DB_PASS=mypassword
DB_NAME=mydb
SERVER_PORT=8081
JWT_SECRET=your-secret-key-here
```

3. **Start the application with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port `5433`
- Go backend on port `8081`
- React frontend on port `3000`

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8081

### Manual Setup (Development)

#### Backend
```bash
cd Backend
go mod download
go build -o main.exe .
./main.exe
```

#### Frontend
```bash
cd Frontend
npm install
npm start
```

#### Database
```bash
# Start PostgreSQL
docker run -d \
  -p 5433:5432 \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=mydb \
  -v ./init.sql:/docker-entrypoint-initdb.d/init.sql \
  postgres:15
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **Users**: Student and teacher accounts
- **Questions**: Question bank with multiple categories
- **Tests**: Regular tests taken by students
- **User_answers**: Student responses and analytics
- **Classrooms**: Virtual classrooms
- **Classroom_members**: Student-classroom relationships
- **Teachers_tests**: Custom tests created by teachers
- **Teachers_questions**: Questions in teacher tests
- **Teacher_test_results**: Student results on teacher tests

## Key Features Explained

### Fuzzy Logic Level Assessment
The app uses a fuzzy logic system to determine student levels based on:
- Test scores
- Average response times
- Consistency across question types

### Personalized Question Recommendations
The system analyzes:
- Categories where the student makes the most mistakes
- Specific phenomena (e.g., "Present Simple", "Articles")
- Difficulty progression
- Previous performance patterns

### Classroom System
- Teachers create classrooms with unique invite codes
- Students join using 10-character codes
- Teachers can assign multiple tests to classrooms
- Detailed result tracking per classroom

## Authentication

The app uses JWT (JSON Web Tokens) for secure authentication:
- Tokens expire after 24 hours
- Role-based access (student/teacher)
- Secure password hashing with bcrypt

## UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Progress Indicators**: Visual feedback for test progress
- **Real-time Updates**: Instant refresh buttons throughout the app
- **Interactive Charts**: Visual representation of progress and mistakes

## API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User login

### Student Endpoints
- `GET /questions` - Get test questions
- `POST /complete-test` - Submit test results
- `GET /user-history` - Get test history
- `GET /user-mistakes` - Get mistake analysis
- `GET /recommended-questions` - Get personalized recommendations
- `GET /student/classrooms` - Get joined classrooms
- `POST /classrooms/join` - Join a classroom

### Teacher Endpoints
- `GET /teacher/tests` - Get all teacher tests
- `POST /teacher/tests` - Create a new test
- `PUT /teacher/tests/:id` - Update a test
- `DELETE /teacher/tests/:id` - Delete a test
- `GET /teacher/classrooms` - Get all classrooms
- `POST /teacher/classrooms` - Create a classroom
- `POST /teacher/classrooms/:id/assign-test` - Assign test to classroom
- `GET /teacher/classrooms/:id/results/:testId` - Get classroom test results

## Development

### Project Structure
```
.
├── Backend/
│   ├── api/           # HTTP handlers
│   ├── config/        # Configuration
│   ├── fuzzylogic/    # Level assessment logic
│   ├── models/        # Data models
│   ├── repositories/  # Database layer
│   ├── router/        # Route definitions
│   └── services/      # Business logic
├── Frontend/
│   ├── public/        # Static assets
│   └── src/
│       ├── components/  # Reusable components
│       ├── css/        # Stylesheets
│       ├── hooks/      # Custom React hooks
│       └── pages/      # Page components
├── init.sql          # Database schema
└── docker-compose.yml
```

