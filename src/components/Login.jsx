import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hardcoded password
    if (password === 'Chipie07490') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Contraseña incorrecta. Inténtalo de nuevo.');
      setPassword(''); // Clear password field on error
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-button">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
