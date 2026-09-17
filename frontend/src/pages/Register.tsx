import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Register User
      const regResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, password }),
      });

      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // 2. Automatically Login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (!loginResponse.ok) throw new Error('Login after registration failed');

      const data = await loginResponse.json();
      login(data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ts-page-wrapper ts-has-bokeh-bg" style={{ minHeight: '100vh' }}>
      <main id="ts-main">
        <section id="page-title">
          <div className="container mt-5">
            <div className="ts-title">
              <h1>Register</h1>
            </div>
          </div>
        </section>

        <section id="login-register">
          <div className="container">
            <div className="row">
              <div className="offset-md-2 col-md-8 offset-lg-3 col-lg-6">
                
                <ul className="nav nav-tabs" id="login-register-tabs" role="tablist">
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">
                      <h3>Login</h3>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link active" to="/register">
                      <h3>Register</h3>
                    </Link>
                  </li>
                </ul>

                <div className="tab-content" style={{ backgroundColor: 'white', padding: '2rem', border: '1px solid #ddd', borderTop: 'none' }}>
                  <div className="tab-pane active" id="register">
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <form className="ts-form" id="form-register" onSubmit={handleSubmit}>
                      <div className="form-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Full Name" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="form-group">
                        <input 
                          type="email" 
                          className="form-control" 
                          placeholder="Email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="input-group ts-has-password-toggle mb-4">
                        <input 
                          type="password" 
                          className="form-control border-right-0" 
                          placeholder="Password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="ts-center__vertical justify-content-between mt-4">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                          {isLoading ? 'Registering...' : 'Register'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
