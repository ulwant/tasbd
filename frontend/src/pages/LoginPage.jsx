import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '../api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('cashier');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const payload = isRegister
        ? { username, email, password, role }
        : { username, password };

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to authenticate');
        setLoading(false);
        return;
      }

      if (isRegister) {
        toast.success('Registration successful! Please log in.');
        setIsRegister(false);
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('cashier');
      } else {
        // Login successful
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Login successful!');
        onLoginSuccess(data.user);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="navbar-brand-icon">K</div>
          <h1>Kasir<span>Nuril</span></h1>
        </div>
        <p className="login-subtitle">
          {isRegister ? 'Create an Account' : 'Welcome Back'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter username"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter email"
                required
              />
            </div>
          )}

          {isRegister && (
            <div className="form-group">
              <label className="form-label">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-select"
              >
                <option value="cashier">Kasir</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent btn-block btn-lg"
          >
            {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setUsername('');
                setEmail('');
                setPassword('');
                setRole('cashier');
              }}
              className="login-link"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
