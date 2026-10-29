import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const location  = useLocation();
  const isReg     = location.pathname === '/register';
  const { login, register, user } = useAuth();
  const navigate  = useNavigate();
  const [mode, setMode]     = useState(isReg ? 'reg' : 'login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', phone:'', gender:'' });
  const [errors, setErrors] = useState({});

  useEffect(() => { if (user) navigate(user.role === 'admin' ? '/admin' : '/'); }, [user, navigate]);

  const ch = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErrors(er => ({ ...er, [e.target.name]: '' })); };

  const validate = () => {
    const e = {};
    if (mode === 'reg' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (mode === 'reg' && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const u = await login(form.email, form.password);
        toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
        navigate(u.role === 'admin' ? '/admin' : '/');
      } else {
        await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, gender: form.gender });
        toast.success('Welcome to Salon Abeela!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const fillAdmin = () => setForm(f => ({ ...f, email: 'admin@salonabeela.com', password: 'admin123' }));

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-wrap">
        <div className="auth-brand">
          <Link to="/" className="auth-logo"><span>✦</span> Salon Abeela</Link>
          <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{mode === 'login' ? 'Sign in to manage your appointments' : 'Join our beauty community today'}</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setErrors({}); }}>Sign In</button>
            <button className={mode === 'reg' ? 'active' : ''} onClick={() => { setMode('reg'); setErrors({}); }}>Register</button>
          </div>

          <form onSubmit={submit}>
            {mode === 'reg' && (
              <>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={ch} placeholder="Namal Rajapaksha" className={errors.name ? 'input-err' : ''} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={ch} placeholder="+94 77 123 4567" />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={ch}>
                      <option value="">Select</option>
                      <option>Female</option><option>Male</option><option>Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={ch} placeholder="you@email.com" className={errors.email ? 'input-err' : ''} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" value={form.password} onChange={ch} placeholder="••••••••" className={errors.password ? 'input-err' : ''} />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {mode === 'reg' && (
              <div className="form-group">
                <label>Confirm Password *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={ch} placeholder="••••••••" className={errors.confirmPassword ? 'input-err' : ''} />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Auth;
