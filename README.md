🎬 Movie Review Application
📌 Project Overview

The Movie Review Application is a full-stack backend service designed to manage users, movies, and user-submitted reviews.
It exposes secure, high-performance REST APIs that can be consumed by a decoupled frontend (React, Vue, or mobile apps).

🎯 Primary Goal

Provide a secure, scalable API that supports:

🔐 User authentication (Sign-up & Login)

🎞️ Movie catalog management

⭐ Review creation & moderation

👍 User engagement (likes & reports)

✨ Key Features
👤 User Management

Secure user registration and login

JWT-based authentication & authorization

🎬 Movie Catalog

Create and retrieve movie records

Automatic average rating calculation

⭐ Review System

Submit reviews with 1–5 star ratings

Reviews linked to users & movies

🤝 User Engagement

Like / unlike reviews

Report inappropriate reviews

🔒 Security

Password hashing using sha256_crypt (Passlib)

Stateless authentication using JWT

PostgreSQL for persistent storage

🧩 Core Functionalities
1️⃣ User Authentication & Security

Sign-Up / Login

Users register with username, email, password

Login returns a JWT access token

Password Hashing

Passwords are hashed using Passlib (sha256_crypt)

JWT Authentication

Tokens required for protected routes:

Creating reviews

Liking / reporting reviews

2️⃣ Movie Catalog Management

CRUD Operations

Create and retrieve movie entries

Automated Ratings

average_rating updates automatically when new reviews are added

3️⃣ Review & Rating System

Review Submission

Authenticated users submit:

Review content

Rating (1–5)

Data Relationships

Reviews linked using foreign keys:

user_id

movie_id

4️⃣ User Engagement & Moderation

Likes

Users can like or unlike reviews

Total likes tracked per review

Reports

Users report inappropriate reviews

Reviews flagged automatically:

is_flagged = true

After reaching a report threshold (e.g., 3 reports)

🗄️ Data Design (Database Schema)

The application uses PostgreSQL with five core entities.

Entity	Description	Key Fields	Relationships
Users	Application users	id, username, email, hashed_password	One-to-Many with Reviews, Likes, Reports
Movies	Movie catalog	id, title, release_year, average_rating	One-to-Many with Reviews
Reviews	User reviews	id, content, rating, user_id, movie_id	Many-to-One with Users & Movies
ReviewLikes	Review engagement	id, user_id, review_id	Tracks which user liked which review
ReviewReports	Review moderation	id, user_id, review_id, reason	Used to flag inappropriate content
🌐 REST API Design

The API follows RESTful conventions and uses JWT Bearer Authentication.

Resource	Method	Endpoint	Description	Auth	Response
Auth	POST	/signup	Register a new user	❌	UserResponse
Auth	POST	/login	Authenticate & return JWT	❌	Token
User	GET	/users/me	Get current user profile	✅	UserResponse
Movies	POST	/movies	Create a new movie	✅	MovieResponse
Movies	GET	/movies	Get all movies	❌	List[MovieResponse]
Movies	GET	/movies/{id}	Get movie by ID	❌	MovieResponse
Reviews	POST	/reviews	Submit a review	✅	ReviewResponse
Reviews	GET	/movies/{id}/reviews	Get reviews for a movie	❌	List[ReviewResponse]
Likes	POST	/reviews/{id}/like	Like / unlike a review	✅	204 No Content
Reports	POST	/reviews/{id}/report	Report a review	✅	204 No Content
⚙️ Development & Environment
🧰 Technology Stack

Backend: FastAPI (Python)

Database: PostgreSQL

ORM: SQLAlchemy

Authentication: JWT (JSON Web Tokens)

Frontend (Optional): Bootstrap / Any SPA Framework

🛠️ Environment Fixes & Stability Improvements
🔧 Database Connection

Fixed PostgreSQL fallback port
5434 → 5432

🌍 CORS Configuration

Enabled:

allow_methods=["*"]


Ensures proper handling of OPTIONS preflight requests

👤 Authors

Maham Maryam
Saira Ahmed
