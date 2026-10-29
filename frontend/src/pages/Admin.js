import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const STYLISTS = ['Any Available','Abeela','Sara','Nadia','Rania'];
const SC = { pending:'badge-pending', confirmed:'badge-confirmed', completed:'badge-completed', cancelled:'badge-cancelled' };

export default function Admin() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab]           = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers]       = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats]       = useState({});
  const [bkFilter, setBkFilter] = useState('all');
  const [bkSearch, setBkSearch] = useState('');
  const [modal, setModal]       = useState(null); // {type, data}

  useEffect(() => { if (!user || user.role !== 'admin') navigate('/'); }, [user, navigate]);

  const loadAll = useCallback(() => {
    API.get('/bookings').then(({data})=>{ setBookings(data.bookings); calcStats(data.bookings); }).catch(()=>{});
    API.get('/services?all=true').then(({data})=>setServices(data.services)).catch(()=>{});
    API.get('/users').then(({data})=>setUsers(data.users)).catch(()=>{});
    API.get('/inventory').then(({data})=>setInventory(data.items)).catch(()=>{});
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const calcStats = (bks) => {
    const rev = bks.filter(b=>b.status==='completed').reduce((s,b)=>s+b.price,0);
    setStats({ total:bks.length, pending:bks.filter(b=>b.status==='pending').length, confirmed:bks.filter(b=>b.status==='confirmed').length, completed:bks.filter(b=>b.status==='completed').length, revenue:rev });
  };

  // Bookings
  const updateBkStatus = async (id, status) => {
    try { await API.put(`/bookings/${id}`, { status }); toast.success('Updated'); loadAll(); }
    catch { toast.error('Failed'); }
  };
  const deleteBk = async (id) => {
    if (!window.confirm('Delete booking?')) return;
    try { await API.delete(`/bookings/${id}`); toast.success('Deleted'); loadAll(); }
    catch { toast.error('Failed'); }
  };

  // Services
  const saveSvc = async () => {
    const d = modal.data;
    if (!d.name||!d.price||!d.duration||!d.category) { toast.error('Fill all required fields'); return; }
    try {
      if (d._id) await API.put(`/services/${d._id}`, d);
      else await API.post('/services', d);
      toast.success(d._id ? 'Service updated' : 'Service added'); setModal(null); loadAll();
    } catch { toast.error('Failed'); }
  };
  const deleteSvc = async (id) => {
    if (!window.confirm('Delete service?')) return;
    try { await API.delete(`/services/${id}`); toast.success('Deleted'); loadAll(); } catch { toast.error('Failed'); }
  };
  const toggleSvc = async (svc) => {
    try { await API.put(`/services/${svc._id}`, { isActive: !svc.isActive }); toast.success('Updated'); loadAll(); } catch { toast.error('Failed'); }
  };

  // Users
  const saveUser = async () => {
    const d = modal.data;
    try { await API.put(`/users/${d._id}`, d); toast.success('User updated'); setModal(null); loadAll(); }
    catch { toast.error('Failed'); }
  };
  const toggleUser = async (u) => {
    try { await API.put(`/users/${u._id}`, { isActive: !u.isActive }); toast.success('Updated'); loadAll(); } catch { toast.error('Failed'); }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try { await API.delete(`/users/${id}`); toast.success('Deleted'); loadAll(); } catch { toast.error('Failed'); }
  };

  // Inventory
  const saveInv = async () => {
    const d = modal.data;
    if (!d.name||!d.category||d.stock===undefined||!d.minStock||!d.price) { toast.error('Fill all fields'); return; }
    try {
      if (d._id) await API.put(`/inventory/${d._id}`, d);
      else await API.post('/inventory', d);
      toast.success(d._id ? 'Updated' : 'Added'); setModal(null); loadAll();
    } catch { toast.error('Failed'); }
  };
  const deleteInv = async (id) => {
    if (!window.confirm('Delete item?')) return;
    try { await API.delete(`/inventory/${id}`); toast.success('Deleted'); loadAll(); } catch { toast.error('Failed'); }
  };

  const filteredBk = bookings.filter(b =>
    (bkFilter==='all'||b.status===bkFilter) &&
    (b.user?.name?.toLowerCase().includes(bkSearch.toLowerCase())||b.service?.name?.toLowerCase().includes(bkSearch.toLowerCase()))
  );

  const md = modal?.data || {};
  const setMd = (k,v) => setModal(m=>({...m, data:{...m.data,[k]:v}}));

  return (
    <div style={{paddingTop:80,minHeight:'100vh'}}>
      <div className="page-header">
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 32px'}}>
          <span className="tag" style={{color:'var(--sage)'}}>Management</span>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}. Here is today's overview.</p>
        </div>
      </div>

      <div className="content">
        {/* Stats */}
        <div className="adm-stats">
          {[['Rs.'+stats.revenue?.toLocaleString(),'Total Revenue','var(--green)'],
            [stats.pending,'Pending','var(--amber, #e6a817)'],
            [stats.confirmed,'Confirmed','var(--green)'],
            [stats.total,'Total Bookings','var(--forest)']].map(([v,l,c])=>(
            <div key={l} className="stat-card"><span className="val" style={{color:c}}>{v}</span><span className="lbl">{l}</span></div>
          ))}
        </div>

        {/* Tabs */}
        <div className="adm-tabs">
          {['bookings','services','users','inventory'].map(t=>(
            <button key={t} className={`ftab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>

        {/* BOOKINGS */}
        {tab==='bookings' && (
          <>
            <div className="toolbar">
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <div className="search-wrap"><input placeholder="Search client or service..." value={bkSearch} onChange={e=>setBkSearch(e.target.value)} /></div>
                <div className="filter-tabs">
                  {['all','pending','confirmed','completed','cancelled'].map(f=>(
                    <button key={f} className={`ftab ${bkFilter===f?'active':''}`} onClick={()=>setBkFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Client</th><th>Service</th><th>Stylist</th><th>Date & Time</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredBk.map(b=>(
                    <tr key={b._id}>
                      <td><strong style={{display:'block'}}>{b.user?.name}</strong><span style={{fontSize:11,color:'var(--muted)'}}>{b.user?.email}</span></td>
                      <td>{b.service?.name}</td>
                      <td>{b.stylist}</td>
                      <td><strong style={{display:'block'}}>{new Date(b.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</strong><span style={{fontSize:11,color:'var(--muted)'}}>{b.timeSlot}</span></td>
                      <td>Rs.{b.price}</td>
                      <td><span className={`badge ${SC[b.status]}`}>{b.status}</span></td>
                      <td><div className="tbl-actions">
                        <select className="ftab" style={{padding:'4px 8px',fontSize:10}} value={b.status} onChange={e=>updateBkStatus(b._id,e.target.value)}>
                          {['pending','confirmed','completed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="btn btn-danger btn-xs" onClick={()=>deleteBk(b._id)}>Del</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SERVICES */}
        {tab==='services' && (
          <>
            <div className="sec-hd">
              <h2>Services ({services.length})</h2>
              <button className="btn btn-primary btn-sm" onClick={()=>setModal({type:'svc',data:{name:'',price:'',duration:'',category:'',icon:'✦',description:'',isActive:true}})}>+ Add Service</button>
            </div>
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>Name</th><th>Price</th><th>Duration</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{services.map(s=>(
                <tr key={s._id}>
                  <td><strong>{s.icon} {s.name}</strong></td>
                  <td>Rs.{s.price}</td><td>{s.duration}</td><td>{s.category}</td>
                  <td><span className={`badge badge-${s.isActive?'active':'inactive'}`}>{s.isActive?'Active':'Inactive'}</span></td>
                  <td><div className="tbl-actions">
                    <button className="btn btn-outline btn-xs" onClick={()=>setModal({type:'svc',data:{...s}})}>Edit</button>
                    <button className="btn btn-outline btn-xs" onClick={()=>toggleSvc(s)}>{s.isActive?'Disable':'Enable'}</button>
                    <button className="btn btn-danger btn-xs" onClick={()=>deleteSvc(s._id)}>Del</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table></div>
          </>
        )}

        {/* USERS */}
        {tab==='users' && (
          <>
            <div className="sec-hd"><h2>Users ({users.length})</h2></div>
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>{users.map(u=>(
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{u.phone||'—'}</td>
                  <td><span className={`badge badge-${u.isActive?'active':'inactive'}`}>{u.isActive?'Yes':'No'}</span></td>
                  <td><div className="tbl-actions">
                    <button className="btn btn-outline btn-xs" onClick={()=>setModal({type:'user',data:{...u}})}>Edit</button>
                    <button className="btn btn-outline btn-xs" onClick={()=>toggleUser(u)}>{u.isActive?'Deactivate':'Activate'}</button>
                    <button className="btn btn-danger btn-xs" onClick={()=>deleteUser(u._id)}>Del</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table></div>
          </>
        )}

        {/* INVENTORY */}
        {tab==='inventory' && (
          <>
            <div className="sec-hd">
              <h2>Inventory ({inventory.length})</h2>
              <button className="btn btn-primary btn-sm" onClick={()=>setModal({type:'inv',data:{name:'',category:'',stock:'',minStock:'',price:'',unit:'unit',supplier:''}})}>+ Add Item</button>
            </div>
            <div className="inv-cards">
              {inventory.map(i=>{
                const low = i.stock <= i.minStock;
                const pct = Math.min(100, Math.round((i.stock/Math.max(i.minStock*2,1))*100));
                return (
                  <div key={i._id} className="inv-card">
                    <div className="inv-card-hd">
                      <h4>{i.name}</h4>
                      {low && <span className="badge badge-cancelled">Low Stock</span>}
                    </div>
                    <p className="inv-cat">{i.category}</p>
                    <div className="inv-stock" style={{color:low?'#c44':'var(--forest)'}}>{i.stock} <small>{i.unit}s</small></div>
                    <div className="inv-bar"><div className="inv-fill" style={{width:pct+'%',background:low?'#c44':'var(--green)'}} /></div>
                    <div className="inv-footer">
                      <span className="inv-price">Rs.{i.price.toFixed(2)}/{i.unit}</span>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn btn-outline btn-xs" onClick={()=>setModal({type:'inv',data:{...i}})}>Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={()=>deleteInv(i._id)}>Del</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      {modal && (
        <div className="modal-overlay open">
          <div className="modal-box">
            {modal.type === 'svc' && (
              <>
                <h3>{md._id ? 'Edit' : 'Add'} Service</h3>
                <div className="form-group"><label>Name *</label><input value={md.name||''} onChange={e=>setMd('name',e.target.value)} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Price ($) *</label><input type="number" value={md.price||''} onChange={e=>setMd('price',e.target.value)} /></div>
                  <div className="form-group"><label>Duration *</label><input value={md.duration||''} onChange={e=>setMd('duration',e.target.value)} placeholder="60 min" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Category *</label><input value={md.category||''} onChange={e=>setMd('category',e.target.value)} /></div>
                  <div className="form-group"><label>Icon</label><input value={md.icon||''} onChange={e=>setMd('icon',e.target.value)} /></div>
                </div>
                <div className="form-group"><label>Description</label><textarea rows="2" value={md.description||''} onChange={e=>setMd('description',e.target.value)} /></div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={saveSvc}>Save</button>
                </div>
              </>
            )}
            {modal.type === 'user' && (
              <>
                <h3>Edit User</h3>
                <div className="form-group"><label>Name</label><input value={md.name||''} onChange={e=>setMd('name',e.target.value)} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={md.email||''} onChange={e=>setMd('email',e.target.value)} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Phone</label><input value={md.phone||''} onChange={e=>setMd('phone',e.target.value)} /></div>
                  <div className="form-group"><label>Role</label>
                    <select value={md.role||'user'} onChange={e=>setMd('role',e.target.value)}>
                      <option value="user">User</option><option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={saveUser}>Save</button>
                </div>
              </>
            )}
            {modal.type === 'inv' && (
              <>
                <h3>{md._id ? 'Edit' : 'Add'} Inventory Item</h3>
                <div className="form-group"><label>Product Name *</label><input value={md.name||''} onChange={e=>setMd('name',e.target.value)} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Category *</label><input value={md.category||''} onChange={e=>setMd('category',e.target.value)} /></div>
                  <div className="form-group"><label>Unit</label><input value={md.unit||''} onChange={e=>setMd('unit',e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Current Stock *</label><input type="number" value={md.stock||''} onChange={e=>setMd('stock',+e.target.value)} /></div>
                  <div className="form-group"><label>Min Stock *</label><input type="number" value={md.minStock||''} onChange={e=>setMd('minStock',+e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Price ($) *</label><input type="number" step="0.01" value={md.price||''} onChange={e=>setMd('price',+e.target.value)} /></div>
                  <div className="form-group"><label>Supplier</label><input value={md.supplier||''} onChange={e=>setMd('supplier',e.target.value)} /></div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={saveInv}>Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
