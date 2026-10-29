import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import Footer from '../components/Footer';
import './MyBookings.css';

const SC = { pending:'#856404', confirmed:'var(--green)', completed:'var(--muted)', cancelled:'#8b1a1a' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [editBk, setEditBk]     = useState(null);

  const load = () => {
    setLoading(true);
    API.get('/bookings').then(({ data }) => setBookings(data.bookings)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await API.patch(`/bookings/${id}/cancel`); toast.success('Cancelled'); load(); }
    catch { toast.error('Failed to cancel'); }
  };

  const saveEdit = async () => {
    try {
      await API.put(`/bookings/${editBk._id}`, { stylist: editBk.stylist, date: editBk.date, timeSlot: editBk.timeSlot, notes: editBk.notes });
      toast.success('Booking updated!'); setEditBk(null); load();
    } catch { toast.error('Update failed'); }
  };

  const filtered = bookings.filter(b =>
    (filter === 'all' || b.status === filter) &&
    (b.service?.name?.toLowerCase().includes(search.toLowerCase()) || b.stylist?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="page-header">
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 32px' }}>
          <span className="tag" style={{color:'var(--sage)'}}>Your Appointments</span>
          <h1>My Bookings</h1>
          <p>Manage and track all your salon appointments.</p>
        </div>
      </div>
      <div className="content">
        <div className="toolbar">
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <div className="search-wrap"><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
            <div className="filter-tabs">
              {['all','pending','confirmed','completed','cancelled'].map(f=>(
                <button key={f} className={`ftab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <Link to="/booking" className="btn btn-primary">+ New Booking</Link>
        </div>

        {loading ? <div className="loading">Loading your appointments…</div> : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{fontSize:32,color:'var(--sage)'}}>✦</div>
            <h3>No bookings found</h3>
            <p>Book your first appointment and start your beauty journey.</p>
            <Link to="/booking" className="btn btn-primary">Book Now</Link>
          </div>
        ) : (
          <div className="bk-list">
            {filtered.map(b => {
              const dt = new Date(b.date);
              const canEdit = b.status==='pending'||b.status==='confirmed';
              return (
                <div key={b._id} className="bkc">
                  <div className="bkl">
                    <div className="bk-badge">
                      <span className="bk-mon">{dt.toLocaleDateString('en-US',{month:'short'})}</span>
                      <span className="bk-day">{dt.getDate()}</span>
                    </div>
                    <div>
                      <h3>{b.service?.name}</h3>
                      <div className="bk-meta">
                        <span>👤 {b.stylist}</span>
                        <span>🕐 {b.timeSlot}</span>
                        <span>💰 Rs.{b.price}</span>
                      </div>
                      {b.notes && <p className="bk-notes">"{b.notes}"</p>}
                    </div>
                  </div>
                  <div className="bkr">
                    <span className="badge badge-{b.status}" style={{color:SC[b.status],background:'transparent',border:`1px solid ${SC[b.status]}`,padding:'3px 10px',fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase'}}>{b.status}</span>
                    {canEdit && (
                      <div style={{display:'flex',gap:6,marginTop:6}}>
                        <button className="btn btn-outline btn-xs" onClick={()=>setEditBk({...b, date: b.date?.split('T')[0]})}>Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={()=>cancel(b._id)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editBk && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <h3>Edit Booking</h3>
            <div className="form-group"><label>Stylist</label>
              <select value={editBk.stylist} onChange={e=>setEditBk({...editBk,stylist:e.target.value})}>
                {['Any Available','Abeela','Sara','Nadia','Rania'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="date" value={editBk.date} onChange={e=>setEditBk({...editBk,date:e.target.value})} /></div>
              <div className="form-group"><label>Time Slot</label>
                <select value={editBk.timeSlot} onChange={e=>setEditBk({...editBk,timeSlot:e.target.value})}>
                  {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Notes</label><textarea rows="3" value={editBk.notes} onChange={e=>setEditBk({...editBk,notes:e.target.value})} /></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setEditBk(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
