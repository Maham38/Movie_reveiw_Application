import React, { useState } from 'react';
import { reviewsAPI } from '../api';
import { toast } from 'react-toastify';

const ReviewForm = ({ movieId, onSuccess, onCancel, initialData, reviewId }) => {
  const [formData, setFormData] = useState({
    content: initialData?.content || '',
    rating: initialData?.rating || 5,
    movie_id: movieId
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      if (reviewId) {
        response = await reviewsAPI.update(reviewId, formData);
        toast.success('Review updated!');
      } else {
        response = await reviewsAPI.create(formData);
        toast.success('Review added!');
      }
      onSuccess(response.data);
      if (!reviewId) {
        setFormData({ content: '', rating: 5, movie_id: movieId });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error saving review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Rating</label>
        <select 
          name="rating"
          className="form-control"
          value={formData.rating}
          onChange={handleChange}
          required
        >
          <option value="5">⭐ ⭐ ⭐ ⭐ ⭐ (5)</option>
          <option value="4">⭐ ⭐ ⭐ ⭐ (4)</option>
          <option value="3">⭐ ⭐ ⭐ (3)</option>
          <option value="2">⭐ ⭐ (2)</option>
          <option value="1">⭐ (1)</option>
        </select>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Review</label>
        <textarea
          name="content"
          className="form-control"
          rows="4"
          value={formData.content}
          onChange={handleChange}
          placeholder="Share your thoughts about this movie..."
          required
          minLength="10"
        />
      </div>
      
      <div className="d-flex justify-content-end">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : reviewId ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;