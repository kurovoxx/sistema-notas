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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <div style={{
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9em', margin: '0' }}>{error}</p>}
          <button
            type="submit"
            style={{
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1em',
              fontWeight: '500'
            }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
