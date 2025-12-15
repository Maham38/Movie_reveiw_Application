import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { moviesAPI, reviewsAPI } from '../api';
import { useAuth } from '../AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchMovie();
    fetchReviews();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await moviesAPI.getById(id);
      setMovie(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Movie not found');
      navigate('/movies');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getByMovieId(id);
      setReviews(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = (newReview) => {
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
  };

  const handleUpdateReview = (updatedReview) => {
    setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
  };

  const handleDeleteReview = (reviewId) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
  };

  if (loading) {
    return <div className="text-center mt-5">Loading movie details...</div>;
  }

  if (!movie) {
    return (
      <div className="text-center mt-5">
        <h3>Movie not found</h3>
        <Link to="/movies" className="btn btn-primary mt-2">Back to Movies</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Movie Header */}
      <div className="row mb-4">
        {/* <div className="col-md-4">
          Placeholder instead of poster URL
          <div className="bg-light rounded shadow d-flex align-items-center justify-content-center" 
               style={{ height: '400px' }}>
            <span className="text-muted">No poster available</span>
          </div>
        </div> */}
        <div className="col-md-8">
          <h1>{movie.title}</h1>
          <p className="text-muted">
            {movie.release_year} • Directed by {movie.director || 'Unknown'}
          </p>
          {movie.genre && <span className="badge bg-primary mb-3">{movie.genre}</span>}
          <div className="display-4 text-warning mb-3">
            ⭐ {movie.average_rating?.toFixed(1) || '0.0'}
          </div>

          {/* Review Button (always visible for logged-in users) */}
          {user && (
            <button 
              className="btn btn-success mb-3"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}

          {/* Movie Description */}
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Description</h5>
              <p className="card-text">{movie.description || 'No description available.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="card mb-4">
          <div className="card-body">
            <ReviewForm 
              movieId={id}
              onSuccess={handleAddReview}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}

      {/* Reviews List */}
      <h2 className="mb-3">Reviews ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <h4>No reviews yet</h4>
          <p>Be the first to review this movie!</p>
        </div>
      ) : (
        <ReviewList 
          reviews={reviews}
          currentUserId={user?.id}
          onUpdate={handleUpdateReview}
          onDelete={handleDeleteReview}
        />
      )}
    </div>
  );
};

export default MovieDetail;
