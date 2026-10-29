import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './Booking.css';

const STYLISTS = ['Any Available', 'Hemamali', 'Wageesha', 'Nishadi', 'Rasula'];

const Booking = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]           = useState(1);
  const [services, setServices]   = useState([]);
  const [selected, setSelected]   = useState([]);
  const [stylist, setStylist]     = useState('Any Available');
  const [date, setDate]           = useState('');
  const [slot, setSlot]           = useState('');
  const [notes, setNotes]         = useState('');
  const [slots, setSlots]         = useState([]);
  const [loadingSlots, setLS]     = useState(false);
  const [submitting, setSub]      = useState(false);

  useEffect(() => {
    if (!user) { toast.error('Please sign in to book'); navigate('/login'); return; }
    // Block admin from booking
    if (user.role === 'admin') return;
    API.get('/services').then(({ data }) => setServices(data.services)).catch(() => {});
  }, [user, navigate]);

  useEffect(() => {
    if (!date) return;
    setLS(true); setSlot('');
    API.get(`/bookings/slots?date=${date}&stylist=${stylist}`)
      .then(({ data }) => setSlots(data.available))
      .catch(() => toast.error('Could not load slots'))
      .finally(() => setLS(false));
  }, [date, stylist]);

  // Toggle service selection
  const toggleService = (svc) => {
    setSelected(prev =>
      prev.find(s => s._id === svc._id)
        ? prev.filter(s => s._id !== svc._id) 
        : [...prev, svc]                        
    );
  };

  const totalPrice = selected.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selected.reduce((sum, s) => {
    const mins = parseInt(s.duration);
    return sum + (isNaN(mins) ? 0 : mins);
  }, 0);

  const goStep = (n) => {
    if (n === 2 && selected.length === 0) { toast.error('Please select at least one service'); return; }
    if (n === 3) {
      if (!date) { toast.error('Please pick a date'); return; }
      if (!slot)  { toast.error('Please select a time slot'); return; }
    }
    setStep(n);
  };

  // Create one booking per selected service
  const confirm = async () => {
    setSub(true);
    try {
      await Promise.all(
        selected.map(svc =>
          API.post('/bookings', { serviceId: svc._id, stylist, date, timeSlot: slot, notes })
        )
      );
      toast.success(`${selected.length} appointment${selected.length > 1 ? 's' : ''} booked!`);
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed');
    } finally { setSub(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  // Admin blocked screen
  if (user?.role === 'admin') {
    return (
      <div style={{ paddingTop: 80, minHeight: '100vh' }}>
        <div className="page-header">
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
            <span className="tag" style={{ color: 'var(--sage)' }}>Bookings</span>
            <h1>Booking Unavailable</h1>
          </div>
        </div>
        <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: 'var(--forest)', marginBottom: 12 }}>
              Admin accounts cannot make bookings
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 28, lineHeight: 1.8 }}>
              As the salon owner, you manage bookings from the dashboard. Client bookings are made through customer accounts.
            </p>
            <Link to="/admin" className="btn btn-primary">Go to Dashboard</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <span className="tag" style={{ color: 'var(--sage)' }}>Appointments</span>
          <h1>Book Your Session</h1>
          <p>Choose one or more services, select your stylist, and pick a perfect time.</p>
        </div>
      </div>

      {/* Steps bar */}
      <div className="bk-steps-bar">
        {[['1','Services'],['2','Schedule'],['3','Confirm']].map(([n, lbl], i) => (
          <div key={n} className={`bk-step ${step > i+1 ? 'done' : step === i+1 ? 'active' : ''}`}>
            <div className="bk-sn">{step > i+1 ? '✓' : n}</div>
            <span>{lbl}</span>
            {i < 2 && <div className="bk-step-line" />}
          </div>
        ))}
      </div>

      <div className="bk-layout">
        <div className="bk-main">

          {/* STEP 1 — Multi-select services */}
          {step === 1 && (
            <div className="bk-panel fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h2 style={{ marginBottom: 0 }}>Select Services</h2>
                {selected.length > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                    {selected.length} selected · Rs.{totalPrice}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>You can select multiple services for a single appointment.</p>

              <div className="svc-list">
                {services.map(s => {
                  const isSel = selected.find(x => x._id === s._id);
                  return (
                    <button key={s._id}
                      className={`svc-row ${isSel ? 'sel' : ''}`}
                      onClick={() => toggleService(s)}>
                      <div className="sr-left">
                        <div className={`svc-check ${isSel ? 'checked' : ''}`}>
                          {isSel ? '✓' : ''}
                        </div>
                        <span className="sr-icon">{s.icon}</span>
                        <div>
                          <span className="sr-name">{s.name}</span>
                          <span className="sr-dur">{s.duration} · {s.category}</span>
                        </div>
                      </div>
                      <span className="sr-price">Rs.{s.price}</span>
                    </button>
                  );
                })}
              </div>

              <div className="step-actions">
                <button className="btn btn-primary" onClick={() => goStep(2)} disabled={selected.length === 0}>
                  Continue ({selected.length} service{selected.length !== 1 ? 's' : ''})
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Date, stylist, slot */}
          {step === 2 && (
            <div className="bk-panel fade-up">
              <h2>Choose Date & Time</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Stylist</label>
                  <select value={stylist} onChange={e => setStylist(e.target.value)}>
                    {STYLISTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Appointment Date</label>
                  <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} />
                </div>
              </div>

              {date && (
                <div className="slots-wrap">
                  <label className="slots-lbl">Available Time Slots</label>
                  {loadingSlots ? <p className="loading">Loading slots…</p> : (
                    <div className="slot-grid">
                      {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'].map(s => {
                        const avail = slots.includes(s);
                        return (
                          <button key={s}
                            className={`slot-btn ${!avail ? 'busy' : ''} ${slot === s ? 'picked' : ''}`}
                            onClick={() => avail && setSlot(s)}
                            disabled={!avail}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Special Requests (Optional)</label>
                <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Allergies, preferences, or special requests…" />
              </div>
              <div className="step-actions">
                <button className="btn btn-outline" onClick={() => goStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => goStep(3)}>Continue</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div className="bk-panel fade-up">
              <h2>Confirm Your Booking</h2>
              <div className="confirm-box">
                <div className="confirm-hd"><span>✦</span><h3>Appointment Summary</h3></div>
                <div className="confirm-rows">

                  {/* List each selected service */}
                  <div className="confirm-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                    <span>Services ({selected.length})</span>
                    {selected.map(s => (
                      <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <strong style={{ fontSize: 13 }}>{s.icon} {s.name}</strong>
                        <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 13 }}>Rs.{s.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="confirm-row"><span>Stylist</span><strong>{stylist}</strong></div>
                  <div className="confirm-row"><span>Date</span><strong>{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</strong></div>
                  <div className="confirm-row"><span>Time</span><strong>{slot}</strong></div>
                  {totalDuration > 0 && <div className="confirm-row"><span>Est. Duration</span><strong>{totalDuration} min</strong></div>}
                  {notes && <div className="confirm-row"><span>Notes</span><strong>{notes}</strong></div>}
                  <div className="confirm-row total"><span>Total Price</span><strong>Rs.{totalPrice}</strong></div>
                </div>
                <div className="confirm-client">
                  <p>Client: <strong>{user?.name}</strong></p>
                  <p>Email: <strong>{user?.email}</strong></p>
                </div>
              </div>
              <div className="step-actions">
                <button className="btn btn-outline" onClick={() => goStep(2)}>Back</button>
                <button className="btn btn-success" onClick={confirm} disabled={submitting}>
                  {submitting ? 'Booking…' : `Confirm ${selected.length} Appointment${selected.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR — shows all selected */}
        {selected.length > 0 && (
          <div className="bk-sidebar">
            <h4>Your Selection</h4>
            {selected.map(s => (
              <div key={s._id} className="sb-row">
                <span>{s.icon} {s.name}</span>
                <strong>Rs.{s.price}</strong>
              </div>
            ))}
            {stylist && <div className="sb-row"><span>Stylist</span><strong>{stylist}</strong></div>}
            {date    && <div className="sb-row"><span>Date</span><strong>{new Date(date + 'T12:00:00').toLocaleDateString()}</strong></div>}
            {slot    && <div className="sb-row"><span>Time</span><strong>{slot}</strong></div>}
            <div className="sb-price">
              <span>{selected.length} service{selected.length > 1 ? 's' : ''}</span>
              <span className="sb-amt">Rs.{totalPrice}</span>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Booking;