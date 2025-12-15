import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../api';
import MovieCard from '../components/MovieCard';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await moviesAPI.getAll({ limit: 6 });
      setMovies(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading movies...</div>;
  }

  return (
    <div>
      <div className="jumbotron bg-light p-5 rounded mb-4">
        <h1 className="display-4">Welcome to MovieReview 🎬</h1>
        <p className="lead">Discover, rate, and review your favorite movies with our community.</p>
        <hr className="my-4" />
        <p>Join thousands of movie enthusiasts sharing their thoughts and ratings.</p>
        <Link className="btn btn-primary btn-lg me-2" to="/movies">
          Browse All Movies
        </Link>
        <Link className="btn btn-outline-primary btn-lg" to="/signup">
          Join Now
        </Link>
      </div>

      <h2>Featured Movies</h2>
      <div className="row mt-3">
        {movies.length > 0 ? (
          movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
        ) : (
          <div className="col-12 text-center py-5">
            <h4>No movies yet</h4>
            <p>Be the first to add a movie!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;