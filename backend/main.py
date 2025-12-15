from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime, timedelta
import pydantic
from typing import Optional

from database import get_db

from database import User, Movie, Review, ReviewLike, ReviewReport 

import auth
from auth import decode_token
from fastapi.security import OAuth2PasswordBearer

app = FastAPI(title="Movie Review App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ROOT ENDPOINT 
@app.get("/")
def read_root():
    return {"message": "Movie Review API is running. Check /docs for available endpoints."}


# Pydantic schemas 
class UserCreate(pydantic.BaseModel):
    username: str
    email: str
    password: str

class UserLogin(pydantic.BaseModel):
    email: str
    password: str

class UserResponse(pydantic.BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MovieCreate(pydantic.BaseModel):
    title: str
    description: Optional[str] = None
    release_year: Optional[int] = None
    director: Optional[str] = None
    genre: Optional[str] = None

class MovieResponse(pydantic.BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    release_year: Optional[int] = None
    director: Optional[str] = None
    genre: Optional[str] = None
    average_rating: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReviewCreate(pydantic.BaseModel):
    movie_id: int
    content: str
    rating: int = Query(..., ge=1, le=5)

class ReviewResponse(pydantic.BaseModel):
    id: int
    content: str
    rating: int
    user_id: int
    movie_id: int
    likes_count: int
    reports_count: int
    is_flagged: bool
    created_at: datetime
    user: UserResponse 
    
    class Config:
        from_attributes = True

class Token(pydantic.BaseModel):
    access_token: str
    token_type: str = "bearer"


# ============ AUTHENTICATION DEPENDENCY ============
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == user_id).first() 
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


# ============ UTILITY FUNCTIONS ============
def update_movie_average_rating(db: Session, movie_id: int):
    # Calculate new average rating
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.movie_id == movie_id).scalar()
    
    # Get movie object
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    
    if movie:
        movie.average_rating = round(avg_rating or 0.0, 2)
        db.commit()


# ============ USER ENDPOINTS ============


@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(or_(User.username == user.username, User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=Token)
def login(form_data: UserLogin, db: Session = Depends(get_db)):
    print("Login attempt:", form_data.email, form_data.password)
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user:
        print("User not found")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    if not auth.verify_password(form_data.password, user.hashed_password):
        print("Password mismatch")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"user_id": user.id}, expires_delta=access_token_expires
    )
    print("Login successful for user:", user.email)
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/movies", response_model=MovieResponse)
def create_movie(
    movie: MovieCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # This makes the endpoint protected
):
    # Create the new movie object
    db_movie = Movie(
        title=movie.title,
        description=movie.description,
        release_year=movie.release_year,
        director=movie.director,
        genre=movie.genre
    )
    # Add it to the database
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie

@app.get("/movies", response_model=List[MovieResponse])
def get_all_movies(db: Session = Depends(get_db)):
    movies = db.query(Movie).all()
    return movies

@app.get("/movies/{movie_id}", response_model=MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@app.options("/movies")
def options_movies():
    return {}

# ============ REVIEW ENDPOINTS ============
@app.get("/users/{user_id}/reviews", response_model=List[ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.user)) 
        .filter(Review.user_id == user_id)
        .all()
    )
    if not reviews:
        return []  # return empty list instead of 404
    return reviews

@app.post("/reviews", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if movie exists
    movie = db.query(Movie).filter(Movie.id == review.movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # Create review
    db_review = Review(
        content=review.content,
        rating=review.rating,
        user_id=current_user.id,
        movie_id=review.movie_id
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Update movie rating
    update_movie_average_rating(db, review.movie_id)
    
    # Attach the user object for the response model
    db_review.user = current_user
    return db_review

@app.get("/movies/{movie_id}/reviews", response_model=List[ReviewResponse])
def get_movie_reviews(movie_id: int, db: Session = Depends(get_db)):
    # EFFICIENCY FIX: Use joinedload to fetch the Review and the associated User
    # in a single, efficient query.
    reviews = db.query(Review).options(joinedload(Review.user)).filter(Review.movie_id == movie_id).all()
    return reviews


# ============ LIKES AND REPORTS ENDPOINTS ============
@app.post("/reviews/{review_id}/like", status_code=status.HTTP_204_NO_CONTENT)
def like_review(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    existing_like = db.query(ReviewLike).filter(
        ReviewLike.review_id == review_id, 
        ReviewLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # User is unliking the review
        db.delete(existing_like)
        review.likes_count -= 1
    else:
        # User is liking the review
        db_like = ReviewLike(user_id=current_user.id, review_id=review_id)
        db.add(db_like)
        review.likes_count += 1
    
    db.commit()
    return

@app.post("/reviews/{review_id}/report", status_code=status.HTTP_204_NO_CONTENT)
def report_review(
    review_id: int, 
    reason: str = Query(..., min_length=1),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    existing_report = db.query(ReviewReport).filter(
        ReviewReport.review_id == review_id, 
        ReviewReport.user_id == current_user.id
    ).first()

    if existing_report:
        raise HTTPException(status_code=400, detail="You have already reported this review.")

    db_report = ReviewReport(
        user_id=current_user.id, 
        review_id=review_id,
        reason=reason
    )
    db.add(db_report)
    review.reports_count += 1
    
    # Simple flagging logic: flag review if it reaches 3 reports
    if review.reports_count >= 3:
        review.is_flagged = True

    db.commit()
    return 