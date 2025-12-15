import React, { useState } from 'react';
import { FaEdit, FaTrash, FaThumbsUp, FaFlag } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { reviewsAPI } from '../api';
import ReviewForm from './ReviewForm';

const ReviewList = ({ reviews, currentUserId, onUpdate, onDelete }) => {
  const [editingReviewId, setEditingReviewId] = useState(null);

  const handleLike = async (reviewId) => {
    try {
      const response = await reviewsAPI.like(reviewId);
      onUpdate({ ...reviews.find(r => r.id === reviewId), likes_count: response.data.likes_count });
    } catch (error) {
      toast.error('Failed to like review');
    }
  };

  const handleReport = async (reviewId) => {
    const reason = prompt('Please enter reason for reporting:');
    if (reason && reason.trim()) {
      try {
        await reviewsAPI.report(reviewId, reason.trim());
        toast.success('Review reported');
      } catch (error) {
        toast.error('Failed to report review');
      }
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Delete this review?')) {
      try {
        await reviewsAPI.delete(reviewId);
        onDelete(reviewId);
        toast.success('Review deleted');
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  return (
    <div>
      {reviews.map((review) => (
        <div key={review.id} className="card mb-3">
          <div className="card-body">
            {editingReviewId === review.id ? (
              <ReviewForm
                movieId={review.movie_id}
                initialData={{ content: review.content, rating: review.rating }}
                reviewId={review.id}
                onSuccess={(updatedReview) => {
                  onUpdate(updatedReview);
                  setEditingReviewId(null);
                }}
                onCancel={() => setEditingReviewId(null)}
              />
            ) : (
              <>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title mb-1">
                      {review.user.username}
                      {review.user_id === currentUserId && (
                        <span className="badge bg-info ms-2">You</span>
                      )}
                    </h6>
                    <div className="text-warning mb-2">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                  <small className="text-muted">
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
                
                <p className="card-text">{review.content}</p>
                
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleLike(review.id)}
                    >
                      <FaThumbsUp className="me-1" />
                      Like ({review.likes_count})
                    </button>
                    
                    {review.user_id === currentUserId && (
                      <>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => setEditingReviewId(review.id)}
                        >
                          <FaEdit className="me-1" />
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger me-2"
                          onClick={() => handleDelete(review.id)}
                        >
                          <FaTrash className="me-1" />
                          Delete
                        </button>
                      </>
                    )}
                    
                    {review.user_id !== currentUserId && (
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => handleReport(review.id)}
                      >
                        <FaFlag className="me-1" />
                        Report
                      </button>
                    )}
                  </div>
                  
                  {review.reports_count > 0 && (
                    <small className="text-danger">
                      {review.reports_count} report(s)
                    </small>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;