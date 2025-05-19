import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Box, Container } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Identifiants invalides');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur s\'est produite lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="auth-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/background-picture.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <header className="top-header">
        <div className="logo">
          <img src={`${process.env.PUBLIC_URL}/images/srm-marrakech-safi-seeklogo.svg`} alt="SRM Logo" />
        </div>
        <div className="nav-buttons">
          <button className="nav-btn active">Connexion</button>
          <button 
            className="nav-btn"
            onClick={() => navigate('/register')}
          >
            S'inscrire
          </button>
        </div>
      </header>

      <main className="auth-container">
        <div className="auth-form">
          <h2 className="auth-title" style={{ 
            color: '#ff9800', 
            fontWeight: 700, 
            fontSize: '2.2rem',
            textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
          }}>
            Connexion
          </h2>
          
          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <i className="bi bi-envelope"></i>
            </div>

            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="auth-input"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <i className="bi bi-lock"></i>
              <i
                className={`bi bi-${showPassword ? 'eye-slash' : 'eye'} toggle-password`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>

            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
              style={{
                fontWeight: 700,
                fontSize: '1.15rem',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              {loading ? 'Connexion...' : 'Connexion'}
            </button>

            <div className="auth-link">
              <span>
                Vous n'avez pas de compte ?
                <Link to="/register">S'inscrire</Link>
              </span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login; 