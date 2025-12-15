import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import AddMovie from './pages/AddMovie';
import Profile from './pages/Profile';

// Context
import { AuthProvider } from './AuthContext';
function App() {
    // console.log('=== DEBUG: Rendering App ===');
 
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container mt-3">
            <Routes>
              <Route path="/" element={<Home />} /> 
               <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Public routes */}
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieDetail />} />
              
              {/* Protected routes */}
               <Route element={<PrivateRoute />}>
                <Route path="/add-movie" element={<AddMovie />} />
                <Route path="/profile" element={<Profile />} />
               </Route> 
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;