import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm]   = useState({ name:'', email:'', phone:'', gender:'' });
  const [pwd, setPwd]     = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [notif, setNotif] = useState({ emailBooking:true, smsReminder:true, promotions:false });
  const [bookings, setBk] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setForm({ name:user.name||'', email:user.email||'', phone:user.phone||'', gender:user.gender||'' }); setNotif(user.notifications||notif); }
    API.get('/bookings').then(({data})=>setBk(data.bookings)).catch(()=>{});
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const { data } = await API.put('/auth/profile', { ...form, notifications: notif });
      updateUser(data.user); toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwd.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    try {
      await API.put('/auth/change-password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Password updated!'); setPwd({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const spent   = bookings.filter(b=>b.status==='completed').reduce((s,b)=>s+b.price,0);
  const pending = bookings.filter(b=>b.status==='pending'||b.status==='confirmed').length;

  return (
    <div style={{paddingTop:80,minHeight:'100vh'}}>
      <div className="page-header">
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 32px'}}>
          <span className="tag" style={{color:'var(--sage)'}}>Account</span>
          <h1>My Profile</h1>
          <p>Manage your personal information and preferences.</p>
        </div>
      </div>
      <div className="content">
        <div className="prof-layout">
          {/* LEFT: profile card */}
          <div>
            <div className="prof-card">
              <div className="prof-ava">{user?.name?.[0]?.toUpperCase()}</div>
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              <div className="prof-stats">
                <div className="ps"><span>{bookings.length}</span><small>Bookings</small></div>
                <div className="ps"><span>Rs.{spent}</span><small>Spent</small></div>
                <div className="ps"><span>{pending}</span><small>Upcoming</small></div>
              </div>
            </div>
          </div>

          {/* RIGHT: forms */}
          <div>
            <div className="prof-section">
              <h3>Personal Information</h3>
              <form onSubmit={saveProfile}>
                <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
                <div className="form-group"><label>Email Address</label><input type="email" value={form.email} disabled style={{background:'#f5f5f5',color:'#888'}} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></div>
                  <div className="form-group"><label>Gender</label>
                    <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}>
                      <option value="">Select</option><option>Female</option><option>Male</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{marginBottom:0}}>
                  <label style={{marginBottom:10,display:'block'}}>Notifications</label>
                  {[['emailBooking','Email confirmations for bookings'],['smsReminder','SMS reminders (24hrs before)'],['promotions','Promotional offers & newsletters']].map(([k,l])=>(
                    <label key={k} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontSize:13,cursor:'pointer',fontWeight:300}}>
                      <input type="checkbox" checked={notif[k]||false} onChange={e=>setNotif(n=>({...n,[k]:e.target.checked}))} /> {l}
                    </label>
                  ))}
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{marginTop:16}}>{saving?'Saving…':'Save Changes'}</button>
              </form>
            </div>

            <div className="prof-section">
              <h3>Change Password</h3>
              <form onSubmit={changePwd}>
                <div className="form-group"><label>Current Password</label><input type="password" value={pwd.currentPassword} onChange={e=>setPwd(p=>({...p,currentPassword:e.target.value}))} /></div>
                <div className="form-group"><label>New Password</label><input type="password" value={pwd.newPassword} onChange={e=>setPwd(p=>({...p,newPassword:e.target.value}))} /></div>
                <div className="form-group"><label>Confirm New Password</label><input type="password" value={pwd.confirmPassword} onChange={e=>setPwd(p=>({...p,confirmPassword:e.target.value}))} /></div>
                <button type="submit" className="btn btn-primary">Update Password</button>
              </form>
            </div>

            <div className="prof-section">
              <h3>Recent Booking History</h3>
              {bookings.length === 0 ? <p style={{color:'var(--muted)',fontStyle:'italic'}}>No bookings yet.</p> : (
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Service</th><th>Date</th><th>Stylist</th><th>Price</th><th>Status</th></tr></thead>
                  <tbody>{bookings.slice(0,8).map(b=>(
                    <tr key={b._id}>
                      <td style={{fontWeight:500}}>{b.service?.name}</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>{b.stylist}</td>
                      <td>Rs.{b.price}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
