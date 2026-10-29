import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Reports.css';

const COLORS = ['#628141', '#8BAE66', '#EBD5AB', '#1B211A', '#4e6933'];

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!user || user.role !== 'admin') navigate('/'); }, [user, navigate]);
  useEffect(() => {
    API.get('/bookings/reports').then(({ data }) => { setData(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading" style={{ paddingTop: 120 }}>Loading reports…</div>;
  if (!data) return <div className="loading" style={{ paddingTop: 120 }}>No data available.</div>;

  const svcRevData = Object.entries(data.revenueByService || {}).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([n, v]) => ({ name: n.substring(0, 12), value: v }));
  const dayData = Object.entries(data.byDay || {}).map(([n, v]) => ({ name: n, value: v }));
  const stylistData = Object.entries(data.stylistStats || {}).map(([n, v]) => ({ name: n, ...v }));
  const statusData = Object.entries(data.byStatus || {}).map(([n, v]) => ({ name: n, value: v }));

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="page-header">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          <span className="tag" style={{ color: 'var(--sage)' }}>Analytics</span>
          <h1>Report Center</h1>
          <p>Comprehensive insights on your business performance.</p>
        </div>
      </div>
      <div className="content">
        <div className="rpt-tabs">
          {['overview', 'revenue', 'bookings', 'stylists'].map(t => (
            <button key={t} className={`ftab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="rpt-kpis">
              {[['Rs.' + data.totalRevenue?.toLocaleString(), 'Total Revenue'],
              [data.totalBookings, 'Total Bookings'],
              [data.completionRate + '%', 'Completion Rate'],
              ['Rs.' + Math.round(data.avgBookingValue || 0), 'Avg Booking Value']].map(([v, l]) => (
                <div key={l} className="rpt-kpi"><span className="rpt-val">{v}</span><span className="rpt-lbl">{l}</span></div>
              ))}
            </div>
            <div className="rpt-charts">
              <div className="rpt-chart-box">
                <h3>Bookings by Day</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dayData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#628141" radius={[2, 2, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rpt-chart-box">
                <h3>Bookings by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {tab === 'revenue' && (
          <>
            <div className="rpt-kpis">
              <div className="rpt-kpi"><span className="rpt-val">Rs.{data.totalRevenue?.toLocaleString()}</span><span className="rpt-lbl">Total Revenue</span></div>
              <div className="rpt-kpi"><span className="rpt-val">Rs.{Math.round(data.avgBookingValue || 0)}</span><span className="rpt-lbl">Avg per Booking</span></div>
              <div className="rpt-kpi"><span className="rpt-val">{data.byStatus?.completed}</span><span className="rpt-lbl">Completed Bookings</span></div>
            </div>
            <div className="rpt-chart-box" style={{ marginBottom: 20 }}>
              <h3>Revenue by Service</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={svcRevData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip formatter={v => 'Rs.' + v} /><Bar dataKey="value" fill="#628141" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.revenueByService || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([n, v]) => (
                      <tr key={n}>
                        <td>{n}</td>
                        <td style={{ color: 'var(--green)', fontWeight: 600 }}>
                          Rs.{v.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'bookings' && (
          <>
            <div className="rpt-kpis">
              {Object.entries(data.byStatus || {}).map(([k, v]) => (
                <div key={k} className="rpt-kpi"><span className="rpt-val">{v}</span><span className="rpt-lbl">{k}</span></div>
              ))}
            </div>
            <div className="rpt-chart-box">
              <h3>Bookings by Day of Week</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dayData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#8BAE66" radius={[2, 2, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {tab === 'stylists' && (
          <>
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>Stylist</th><th>Total Bookings</th><th>Completed</th><th>Revenue</th><th>Avg per Booking</th></tr></thead>
              <tbody>{stylistData.map(s => (
                <tr key={s.name}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.bookings}</td>
                  <td>{s.completed}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 600 }}>Rs.{s.revenue?.toLocaleString()}</td>
                  <td>Rs.{s.completed ? Math.round(s.revenue / s.completed) : 0}</td>
                </tr>
              ))}</tbody>
            </table></div>
            <div className="rpt-chart-box" style={{ marginTop: 20 }}>
              <h3>Revenue by Stylist</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stylistData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={v => '$' + v} /><Bar dataKey="revenue" fill="#628141" radius={[2, 2, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
