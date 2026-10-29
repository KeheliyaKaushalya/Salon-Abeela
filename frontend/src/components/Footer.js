import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-top">
      <div className="footer-brand">
        <div className="footer-logo"><span>✦</span> Salon Abeela</div>
        <p>Where beauty meets artistry.<br />Your transformation begins here.</p>
      </div>
      <div className="footer-cols">
        <div className="footer-col">
          <h4>Navigate</h4>
          <Link to="/">Home</Link>
          <Link to="/booking">Book Now</Link>
          <a href="/#about">About</a>
          <a href="/#contact">Contact</a>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <span>Hair Styling</span><span>Coloring</span>
          <span>Skincare</span><span>Bridal</span>
        </div>
        <div className="footer-col">
          <h4>Hours</h4>
          <span>Mon – Fri: 9am – 7pm</span>
          <span>Saturday: 9am – 6pm</span>
          <span>Sunday: 10am – 4pm</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
