import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { usersAPI } from '../api';

const Profile = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  const fetchUserReviews = async () => {
    try {
      const response = await usersAPI.getReviews(user.id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-5">Please login to view profile</div>;
  }

  return (
    <div>
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title">My Profile</h2>
          <hr />
          
          <div className="row">
            <div className="col-md-6">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            
            <div className="col-md-6 text-end">
              <div className="display-6 text-primary">
                {reviews.length}
              </div>
              <p className="text-muted">Reviews Posted</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mb-3">My Reviews</h3>
      
      {loading ? (
        <div className="text-center">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <h4>No reviews yet</h4>
          <p>Start reviewing movies to see them here!</p>
        </div>
      ) : (
        <div className="list-group">
          {reviews.map((review) => (
            <div key={review.id} className="list-group-item">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="mb-1">
                    <strong>{review.movie?.title || 'Movie'}</strong>
                    <span className="text-warning ms-2">
                      {'⭐'.repeat(review.rating)}
                    </span>
                  </h6>
                  <p className="mb-1">{review.content}</p>
                  <small className="text-muted">
                    Posted on {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
                <div className="text-end">
                  <span className="badge bg-primary me-2">
                    {review.likes_count} likes
                  </span>
                  {review.reports_count > 0 && (
                    <span className="badge bg-warning">
                      {review.reports_count} reports
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;