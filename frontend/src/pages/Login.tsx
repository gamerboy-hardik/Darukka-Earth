import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
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
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 requires 'username'
      formData.append('password', password);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
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
              <h1>Login</h1>
            </div>
          </div>
        </section>

        <section id="login-register">
          <div className="container">
            <div className="row">
              <div className="offset-md-2 col-md-8 offset-lg-3 col-lg-6">
                
                <ul className="nav nav-tabs" id="login-register-tabs" role="tablist">
                  <li className="nav-item">
                    <Link className="nav-link active" to="/login">
                      <h3>Login</h3>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">
                      <h3>Register</h3>
                    </Link>
                  </li>
                </ul>

                <div className="tab-content" style={{ backgroundColor: 'white', padding: '2rem', border: '1px solid #ddd', borderTop: 'none' }}>
                  <div className="tab-pane active" id="login">
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <form className="ts-form" id="form-login" onSubmit={handleSubmit}>
                      <div className="form-group">
                        <input 
                          type="email" 
                          className="form-control" 
                          id="login-email" 
                          placeholder="Email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="input-group ts-has-password-toggle mb-3">
                        <input 
                          type="password" 
                          className="form-control border-right-0" 
                          placeholder="Password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required 
                        />
                        <div className="input-group-append">
                          <span className="input-group-text bg-white border-left-0">
                            <i className="fa fa-eye"></i>
                          </span>
                        </div>
                      </div>

                      <div className="ts-center__vertical justify-content-between mt-4">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                          {isLoading ? 'Logging in...' : 'Login'}
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
