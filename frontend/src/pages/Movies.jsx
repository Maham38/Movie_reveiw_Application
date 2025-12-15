import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../api';
import MovieCard from '../components/MovieCard';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    minYear: '',
    maxYear: '',
    minRating: ''
  });
  const [loading, setLoading] = useState(true);
  const [genres] = useState([
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 
    'Romance', 'Thriller', 'Documentary', 'Animation'
  ]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.genre) params.genre = filters.genre;
      if (filters.minYear) params.min_year = filters.minYear;
      if (filters.maxYear) params.max_year = filters.maxYear;
      if (filters.minRating) params.min_rating = filters.minRating;

      const response = await moviesAPI.getAll(params);
      setMovies(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchMovies();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      genre: '',
      minYear: '',
      maxYear: '',
      minRating: ''
    });
  };

  if (loading) {
    return <div className="text-center mt-5">Loading movies...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Movies</h1>
        <Link to="/add-movie" className="btn btn-primary">
          + Add New Movie
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search movies..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="col-md-3">
                <select
                  className="form-control"
                  name="genre"
                  value={filters.genre}
                  onChange={handleFilterChange}
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min Year"
                  name="minYear"
                  value={filters.minYear}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min Rating"
                  name="minRating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="col-md-1">
                <button type="submit" className="btn btn-primary w-100">
                  Filter
                </button>
              </div>
            </div>
            
            <div className="mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleReset}
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="row">
        {movies.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h4>No movies found</h4>
            <p>Try adjusting your filters or add a new movie!</p>
            <Link to="/add-movie" className="btn btn-primary mt-2">
              Add Your First Movie
            </Link>
          </div>
        ) : (
          movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
        )}
      </div>
    </div>
  );
};

export default Movies;