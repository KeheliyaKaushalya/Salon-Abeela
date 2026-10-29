import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Footer from '../components/Footer';
import './Home.css';

const TEAM = [
  { name: 'Hemamali', role: 'Founder & Creative Director', spec: 'Bridal & Color Specialist' },
  { name: 'Wageesha', role: 'Senior Stylist', spec: 'Hair Cutting Expert' },
  { name: 'Nishadi', role: 'Skincare Specialist', spec: 'Facials & Treatments' },
  { name: 'Rasula', role: 'Nail Technician', spec: 'Nail Art & Extensions' },
];

const Home = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    document.title = 'Salon Abeela | Beauty & Wellness';
    API.get('/services').then(({ data }) => setServices(data.services.slice(0, 6))).catch(() => { });
  }, []);

  const sendContact = (e) => {
    e.preventDefault();
    alert('Message sent! We will get back to you shortly.');
    e.target.reset();
  };

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content fade-up">
          <h1 className="hero-title">Experience the Elegance of<br /><em>Salon Abeela</em></h1>
          <p className="hero-desc">Where Expert Care Meets Luxurious Services for a Transformative Beauty Experience in Sri Lanka.</p>
          <div className="hero-btns">
            <Link to="/booking" className="btn btn-primary">Book Appointment</Link>
            <a href="#services" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>Explore Services</a>
          </div>
        </div>
        <div className="hero-card fade-up">
          <img
            src="/images/img1.jpg"
            alt="Salon Abeela Service"
            className="hero-img"
          />
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-sec" id="about">
        <div className="home-container">
          <div className="about-grid">
            <div className="about-visual">
              <div className="about-accent" />
              <div className="about-img">
                <img src="/images/img2.jpg" alt="Salon Abeela" className="about-photo" />
              </div>
            </div>
            <div className="about-text">
              <span className="section-tag">Our Story</span>
              <h2 className="section-title">A Passion for Beauty,<br />A Commitment to Excellence</h2>
              <div className="divider" />
              <p>Established by Hemamali in 2018, our salon is rooted in a timeless belief: everyone deserves to feel beautiful, confident, and cherished. What began as a humble studio has flourished into Anuradhapura's premier destination for luxury beauty services.</p>
              <p style={{ marginTop: 14, color: 'var(--muted)' }}>We combine international techniques with a warm, personal touch — because at Salon Abeela, you're not just a client. You're family.</p>
              <div className="pillars">
                {['Premium Quality', 'Personalized Care', 'Expert Artistry'].map(p => (
                  <div key={p} className="pillar"><div className="pillar-dot" />{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services-sec" id="services">
        <div className="home-container">
          <div className="hs-hd">
            <span className="section-tag">What We Offer</span>
            <h2 className="section-title">Our Popular Services</h2>
          </div>
          <div className="svc-grid">
            {services.map(s => (
              <div key={s._id} className="svc-card">
                <span className="svc-icon">{s.icon}</span>
                <div>
                  <h3 className="svc-name">{s.name}</h3>
                  <p className="svc-desc">{s.description}</p>
                  <div className="svc-footer">
                    <span className="svc-price">From Rs.{s.price}</span>
                    <span className="svc-dur">{s.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hs-cta"><Link to="/booking" className="btn btn-primary">Book Your Session</Link></div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team-sec">
        <div className="home-container">
          <div className="hs-hd">
            <span className="section-tag" style={{ color: 'var(--sage)' }}>Meet the Artists</span>
            <h2 className="section-title" style={{ color: '#fff' }}>Our Expert Team</h2>
          </div>
          <div className="team-grid">
            {TEAM.map(m => (
              <div key={m.name} className="team-card">
                <div className="team-ava">{m.name[0]}</div>
                <h3>{m.name}</h3>
                <span className="team-role">{m.role}</span>
                <span className="team-spec">{m.spec}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-sec" id="contact">
        <div className="home-container">
          <div className="contact-grid">
            <div>
              <span className="section-tag">Get in Touch</span>
              <h2 className="section-title">Visit Us</h2>
              <div className="contact-info-list">
                {[
                  ['📍', 'Address', '820, Bulankulama Disawa Mawatha, Anuradhapura, Sri Lanka'],
                  ['📞', 'Phone', '+94 716749911'],
                  ['✉️', 'Email', 'salonabeela@gmail.com'],
                  ['🕐', 'Hours', 'Mon–Fri: 9am–7pm\nSat: 9am–6pm | Sun: 10am–4pm'],
                ].map(([icon, label, val]) => (
                  <div key={label} className="citem">
                    <span className="citem-icon">{icon}</span>
                    <div>
                      <strong>{label}</strong>
                      <p>{val}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="cta-strip">
        <h2>Ready for Your Transformation?</h2>
        <p>Book your appointment today and let us take care of the rest.</p>
        <Link to="/booking" className="btn btn-sand">Book Now</Link>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
