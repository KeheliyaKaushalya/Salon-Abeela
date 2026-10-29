import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isActive = (p) => location.pathname === p;

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-gem">✦</span>
          <div>
            <span className="logo-name">Salon Abeela</span>
            <span className="logo-sub">Beauty & Wellness</span>
          </div>
        </Link>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setOpen(false)}>Home</Link>
          <Link to="/booking" className={isActive('/booking') ? 'active' : ''} onClick={() => setOpen(false)}>Book Now</Link>
          <a href="/#about" onClick={() => setOpen(false)}>About</a>
          <a href="/#contact" onClick={() => setOpen(false)}>Contact</a>

          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className={isActive('/admin') ? 'active' : ''} onClick={() => setOpen(false)}>Dashboard</Link>
                  <Link to="/reports" className={isActive('/reports') ? 'active' : ''} onClick={() => setOpen(false)}>Reports</Link>
                </>
              )}
              {user.role === 'user' && (
                <Link to="/my-bookings" className={isActive('/my-bookings') ? 'active' : ''} onClick={() => setOpen(false)}>My Bookings</Link>
              )}
              <Link to="/profile" className={isActive('/profile') ? 'active' : ''} onClick={() => setOpen(false)}>Profile</Link>
              <span className="nav-username">Hi, {user.name.split(' ')[0]}</span>
              <button className="nav-signout" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="nav-cta" onClick={() => setOpen(false)}>Sign In</Link>
          )}
        </div>

        <button className={`hamburger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
