import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moviesAPI } from '../api';

const AddMovie = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    release_year: '',
    director: '',
    genre: '',
    poster_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genres = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
    'Romance', 'Thriller', 'Documentary', 'Animation',
    'Fantasy', 'Mystery', 'Crime', 'Adventure'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    console.log('🔍 DEBUG: Checking API configuration...');
    
    // Debug: Check what moviesAPI.create actually does
    console.log('moviesAPI:', moviesAPI);
    console.log('moviesAPI.create:', moviesAPI.create);
    // Basic validation
    if (!formData.title.trim()) {
      setError('Movie title is required');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Adding movie:', formData);
      
      // Call API
      const response = await moviesAPI.create(formData);
      console.log('Movie added successfully:', response.data);
      
      // Show success message
      alert(`"${formData.title}" has been added successfully!`);
      
      // Clear form
      setFormData({
        title: '',
        description: '',
        release_year: '',
        director: '',
        genre: '',
        poster_url: ''
      });
      
      // Navigate to movies page
      navigate('/movies');
      
    } catch (error) {
      console.error('Error adding movie:', error);
      
      // Set error message
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.message 
        || error.message 
        || 'Failed to add movie. Please try again.';
      
      setError(errorMsg);
      
      // Show error alert
      alert(`Error: ${errorMsg}`);
      
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure? Any unsaved changes will be lost.')) {
      navigate('/movies');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">Add New Movie</h2>
            
            {/* Error message display */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter movie title"
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter movie description"
                />
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Release Year</label>
                  <input
                    type="number"
                    name="release_year"
                    className="form-control"
                    value={formData.release_year}
                    onChange={handleChange}
                    min="1900"
                    max="2030"
                    disabled={loading}
                    placeholder="2024"
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Director</label>
                  <input
                    type="text"
                    name="director"
                    className="form-control"
                    value={formData.director}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Director name"
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Genre</label>
                  <select
                    name="genre"
                    className="form-control"
                    value={formData.genre}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Genre</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                
                {/* <div className="col-md-6 mb-3">
                  <label className="form-label">Poster URL (Optional)</label>
                  <input
                    type="url"
                    name="poster_url"
                    className="form-control"
                    value={formData.poster_url}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="https://example.com/poster.jpg"
                  />
                  <small className="text-muted">Leave empty if no poster available</small>
                </div> */}
              </div> 
              
              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : (
                    'Add Movie'
                  )}
                </button>
              </div>
              
              <div className="mt-3 text-muted small">
                <p className="mb-0">
                  <span className="text-danger">*</span> Required field
                </p>
                <p className="mb-0">
                  Movie will be visible to all users after submission
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMovie;