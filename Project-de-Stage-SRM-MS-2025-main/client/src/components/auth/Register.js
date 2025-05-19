import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/auth.css';
import { Box, Button, Typography, Paper, TextField, IconButton, InputAdornment, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const payload = { ...formData };
      // All users are registered as regular users by default

      console.log('Submitting registration with payload:', {
        ...payload,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });

      try {
        const success = await register(payload.name, payload.email, payload.password);
        navigate('/');
      } catch (err) {
        console.error('Registration error:', err);
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('L\'inscription a échoué. Veuillez vérifier vos informations et réessayer.');
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Une erreur s\'est produite lors de la soumission du formulaire');
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
          <button 
            className="nav-btn"
            onClick={() => navigate('/login')}
          >
            Connexion
          </button>
          <button className="nav-btn active">
            S'inscrire
          </button>
        </div>
      </header>

      <main className="auth-container">
        <div className="auth-form">
          <Typography variant="h5" align="center" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
            Créer un compte
          </Typography>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="name"
                className="auth-input"
                placeholder="Nom complet"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <i className="bi bi-person"></i>
            </div>

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

            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="auth-input"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <i className="bi bi-lock"></i>
            </div>

            <button type="submit" className="submit-button">
              S'inscrire
            </button>

            <div className="auth-link">
              <span>
                Vous avez déjà un compte ?
                <RouterLink to="/login">Connexion</RouterLink>
              </span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register; 