import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

        <section id="login-register" className="d-flex align-items-center" style={{ minHeight: '80vh' }}>
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="row justify-content-center"
            >
              <div className="col-11 col-sm-10 col-md-8 col-lg-5">
                
                <ul className="nav nav-tabs d-flex justify-content-center border-0 mb-3" id="login-register-tabs" role="tablist">
                  <li className="nav-item flex-fill text-center">
                    <Link className="nav-link font-weight-bold" to="/login" style={{ border: 'none', background: 'transparent', color: '#6B7280', fontSize: '18px' }}>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item flex-fill text-center">
                    <Link className="nav-link active font-weight-bold" to="/register" style={{ border: 'none', background: 'transparent', borderBottom: '3px solid #1CAAD9', color: '#111827', fontSize: '18px' }}>
                      Register
                    </Link>
                  </li>
                </ul>

                <div className="tab-content shadow-lg" style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <div className="tab-pane active" id="register">
                    <div className="text-center mb-4">
                      <h3 className="font-weight-bold text-dark">Create an Account</h3>
                      <p className="text-muted">Join Darukaa.Earth today</p>
                    </div>

                    {error && <div className="alert alert-danger" style={{ borderRadius: '8px' }}>{error}</div>}
                    
                    <form className="ts-form" id="form-register" onSubmit={handleSubmit}>
                      <div className="form-group mb-3">
                        <label className="text-muted small font-weight-bold">Full Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="John Doe" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                          required 
                        />
                      </div>

                      <div className="form-group mb-3">
                        <label className="text-muted small font-weight-bold">Email Address</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          placeholder="name@example.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                          required 
                        />
                      </div>

                      <div className="form-group mb-4">
                        <label className="text-muted small font-weight-bold">Password</label>
                        <div className="input-group">
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            className="form-control border-right-0" 
                            placeholder="Create a password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '12px', borderRadius: '8px 0 0 8px', border: '1px solid #d1d5db' }}
                            required 
                          />
                          <div className="input-group-append" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                            <span className="input-group-text bg-white" style={{ borderLeft: 'none', borderRadius: '0 8px 8px 0', border: '1px solid #d1d5db' }}>
                              <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button type="submit" className="btn btn-primary btn-block shadow-sm" disabled={isLoading} style={{ padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', backgroundColor: '#1CAAD9', borderColor: '#1CAAD9' }}>
                          {isLoading ? <><i className="fa fa-spinner fa-spin mr-2"></i>Registering...</> : 'Register'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
