import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 shadow-sm">
        {/* {movie.poster_url ? (
          <img 
            src={movie.poster_url} 
            className="card-img-top" 
            alt={movie.title}
            style={{ height: '300px', objectFit: 'cover' }}
          />
        ) : (
          <div className="card-img-top bg-light d-flex align-items-center justify-content-center" 
               style={{ height: '300px' }}>
            <span className="text-muted">No poster</span>
          </div>
        )} */}
        
        <div className="card-body">
          <h5 className="card-title">{movie.title}</h5>
          <p className="card-text text-muted small">
            {movie.release_year} • {movie.director}
            {movie.genre && ` • ${movie.genre}`}
          </p>
          
          <p className="card-text">
            {movie.description?.substring(0, 100)}...
          </p>
          
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="badge bg-warning text-dark">
                ⭐ {movie.average_rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <Link to={`/movies/${movie.id}`} className="btn btn-primary btn-sm">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;