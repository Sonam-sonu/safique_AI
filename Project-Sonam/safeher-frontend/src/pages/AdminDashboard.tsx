import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiShieldCheck, HiCheck, HiTrash, HiLocationMarker, HiUsers, HiChevronRight, HiTrendingUp, HiTrendingDown } from 'react-icons/hi'

type Tab = 'overview' | 'reports' | 'users'

const statsCards = [
  { label: 'Total Users',   value: 1284, icon: '👥', color: '#6C63FF', bg: '#F0EEFF', change: '+12%', up: true },
  { label: 'SOS Alerts',   value: 47,   icon: '🆘', color: '#FF5A7A', bg: '#FFF0F3', change: '-3%',  up: false },
  { label: 'Reports Filed',value: 156,  icon: '📋', color: '#FFB800', bg: '#FFF8E6', change: '+8%',  up: true  },
  { label: 'Safe Routes',  value: 892,  icon: '🛡️', color: '#00C48C', bg: '#EDFBF6', change: '+23%', up: true  },
]

const barData = [
  { day: 'Mon', sos: 4,  reports: 12 },
  { day: 'Tue', sos: 7,  reports: 18 },
  { day: 'Wed', sos: 3,  reports: 9  },
  { day: 'Thu', sos: 9,  reports: 22 },
  { day: 'Fri', sos: 6,  reports: 15 },
  { day: 'Sat', sos: 11, reports: 28 },
  { day: 'Sun', sos: 7,  reports: 20 },
]
const maxBar = Math.max(...barData.map(d => d.sos + d.reports))

const hotZones = [
  { area: 'City Center Market', count: 14, pct: 90, risk: 'High',   color: '#FF5A7A' },
  { area: 'Riverside Path',     count: 11, pct: 70, risk: 'High',   color: '#FF5A7A' },
  { area: 'Old Bus Stand',      count: 8,  pct: 52, risk: 'Medium', color: '#FFB800' },
  { area: 'Park Street',        count: 6,  pct: 38, risk: 'Medium', color: '#FFB800' },
  { area: 'MG Road',            count: 3,  pct: 20, risk: 'Low',    color: '#00C48C' },
]

interface Report { id: number; type: string; location: string; status: 'pending' | 'resolved'; risk: 'high' | 'medium' | 'low'; date: string; submittedBy: string }

const initialReports: Report[] = [
  { id: 1, type: 'Harassment',          location: 'Sector 7, Market Area',   status: 'pending',  risk: 'high',   date: 'Jun 15', submittedBy: 'Priya S.'    },
  { id: 2, type: 'Dark Area',           location: 'Park Street, Block C',    status: 'resolved', risk: 'medium', date: 'Jun 14', submittedBy: 'Kavya M.'    },
  { id: 3, type: 'Suspicious Activity', location: 'Bus Stand, Gate 2',       status: 'pending',  risk: 'high',   date: 'Jun 13', submittedBy: 'Meena P.'    },
  { id: 4, type: 'Missing Lights',      location: 'MG Road, Lane 3',         status: 'resolved', risk: 'low',    date: 'Jun 12', submittedBy: 'Ritu V.'     },
  { id: 5, type: 'Unsafe Zone',         location: 'Railway Station Exit',    status: 'pending',  risk: 'high',   date: 'Jun 11', submittedBy: 'Sneha T.'    },
]

const mockUsers = [
  { id: 1, name: 'Priya Sharma', email: 'priya@email.com',  joined: 'Jun 2025', sos: 1, reports: 3, active: true  },
  { id: 2, name: 'Kavya Singh',  email: 'kavya@email.com',  joined: 'May 2025', sos: 0, reports: 7, active: true  },
  { id: 3, name: 'Meena Patel',  email: 'meena@email.com',  joined: 'Apr 2025', sos: 2, reports: 1, active: false },
  { id: 4, name: 'Ritu Verma',   email: 'ritu@email.com',   joined: 'Jun 2025', sos: 0, reports: 5, active: true  },
]

const riskMeta: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: '#FFF0F3', color: '#E04A6A', label: 'High'   },
  medium: { bg: '#FFF8E6', color: '#E5A600', label: 'Medium' },
  low:    { bg: '#EDFBF6', color: '#00A878', label: 'Low'    },
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [reports, setReports]     = useState(initialReports)

  const resolve = (id: number) => setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r))
  const remove  = (id: number) => setReports(reports.filter(r => r.id !== id))
  const pending = reports.filter(r => r.status === 'pending').length

  return (
    <div className="page-wrapper">

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#7A7A95', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Administration</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F0F23', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 8 }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 15, color: '#7A7A95', lineHeight: 1.5 }}>Monitor safety incidents, users and platform health</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {pending > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', background: '#FFF8E6', border: '1.5px solid rgba(255,184,0,0.3)',
                borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#E5A600',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFB800', display: 'inline-block' }} className="animate-blink" />
                {pending} pending reviews
              </div>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
              background: '#EDFBF6', border: '1.5px solid rgba(0,196,140,0.25)',
              borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#00A878',
            }}>
              <HiShieldCheck style={{ fontSize: 16 }} />
              Platform Active
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: 4, background: 'white', border: '1.5px solid #EAEDF5',
        borderRadius: 14, padding: 5, marginBottom: 28, width: 'fit-content',
        boxShadow: '0 1px 4px rgba(15,15,35,0.04)',
      }}>
        {([
          ['overview', 'Overview'],
          ['reports', `Reports${pending > 0 ? ` (${pending})` : ''}`],
          ['users',   'Users'],
        ] as const).map(([t, label]) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '9px 22px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s', border: 'none',
            background: activeTab === t ? 'linear-gradient(135deg, #6C63FF, #5A52D5)' : 'transparent',
            color: activeTab === t ? 'white' : '#7A7A95',
            boxShadow: activeTab === t ? '0 4px 12px rgba(108,99,255,0.25)' : 'none',
          }}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
              {statsCards.map((card, i) => (
                <motion.div key={card.label} className="stat-card"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="stat-icon-wrap" style={{ background: card.bg }}>
                      <span style={{ fontSize: 22 }}>{card.icon}</span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                      background: card.up ? '#EDFBF6' : '#FFF0F3',
                      color: card.up ? '#00A878' : '#E04A6A',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {card.up ? <HiTrendingUp style={{ fontSize: 12 }} /> : <HiTrendingDown style={{ fontSize: 12 }} />}
                      {card.change}
                    </span>
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: card.color }}>{card.value.toLocaleString()}</div>
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-sub">vs last month</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom row: Chart + Zones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>

              {/* Weekly Activity Chart */}
              <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 6 }}>Weekly Activity</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0F0F23' }}>
                      {barData.reduce((s, d) => s + d.sos + d.reports, 0)} total events this week
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[['#FF5A7A', 'SOS Alerts'], ['#6C63FF', 'Reports']].map(([c, l]) => (
                      <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7A7A95' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                  {barData.map((d, i) => (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <motion.div
                          style={{ width: '100%', background: '#6C63FF', borderRadius: '6px 6px 0 0', minHeight: 4 }}
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.reports / maxBar) * 120}px` }}
                          transition={{ delay: i * 0.06, duration: 0.6, ease: 'easeOut' }}
                        />
                        <motion.div
                          style={{ width: '100%', background: '#FF5A7A', borderRadius: 4, minHeight: 4 }}
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.sos / maxBar) * 120}px` }}
                          transition={{ delay: i * 0.06 + 0.1, duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#7A7A95' }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Zones */}
              <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95' }}>
                    Top Reported Zones
                  </div>
                  <span style={{ fontSize: 12, color: '#6C63FF', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {hotZones.map(z => (
                    <div key={z.area}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F0F23' }}>{z.area}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#7A7A95' }}>{z.count} reports</span>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                            background: riskMeta[z.risk.toLowerCase()].bg,
                            color: riskMeta[z.risk.toLowerCase()].color,
                          }}>{z.risk}</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${z.pct}%` }}
                          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                          style={{ background: z.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── REPORTS ── */}
        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr 120px',
              padding: '0 20px 12px', gap: 16,
            }}>
              {['Type', 'Location', 'Risk', 'Status', 'Date', 'Actions'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95' }}>{h}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence>
                {reports.map((report, i) => {
                  const rm = riskMeta[report.risk]
                  return (
                    <motion.div
                      key={report.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                      transition={{ delay: i * 0.04 }}
                      className="card"
                      style={{ padding: '16px 20px' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1fr 120px', gap: 16, alignItems: 'center' }}>
                        {/* Type */}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0F23', marginBottom: 2 }}>{report.type}</p>
                          <p style={{ fontSize: 11, color: '#7A7A95' }}>by {report.submittedBy}</p>
                        </div>
                        {/* Location */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <HiLocationMarker style={{ color: '#6C63FF', fontSize: 14, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: '#0F0F23' }}>{report.location}</span>
                        </div>
                        {/* Risk */}
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
                          background: rm.bg, color: rm.color, display: 'inline-flex', width: 'fit-content',
                        }}>
                          {rm.label}
                        </span>
                        {/* Status */}
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
                          background: report.status === 'resolved' ? '#EDFBF6' : '#FFF8E6',
                          color: report.status === 'resolved' ? '#00A878' : '#E5A600',
                          display: 'inline-flex', alignItems: 'center', gap: 5, width: 'fit-content',
                        }}>
                          {report.status === 'resolved' ? '✓ Resolved' : '⏳ Pending'}
                        </span>
                        {/* Date */}
                        <span style={{ fontSize: 13, color: '#7A7A95' }}>{report.date}</span>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          {report.status === 'pending' && (
                            <button onClick={() => resolve(report.id)} style={{
                              width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                              background: '#EDFBF6', color: '#00A878', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'background 0.15s',
                            }} title="Resolve">
                              <HiCheck style={{ fontSize: 16 }} />
                            </button>
                          )}
                          <button onClick={() => remove(report.id)} style={{
                            width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: '#FFF0F3', color: '#E04A6A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s',
                          }} title="Delete">
                            <HiTrash style={{ fontSize: 16 }} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {reports.length === 0 && (
              <div className="card" style={{ padding: 80, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F0F23', marginBottom: 8 }}>All reports resolved</h3>
                <p style={{ fontSize: 14, color: '#7A7A95' }}>No pending reports at this time</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Summary bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Total Users', value: mockUsers.length, color: '#6C63FF', bg: '#F0EEFF' },
                { label: 'Active Now',  value: mockUsers.filter(u => u.active).length, color: '#00A878', bg: '#EDFBF6' },
                { label: 'Inactive',   value: mockUsers.filter(u => !u.active).length, color: '#7A7A95', bg: '#F4F6FB' },
              ].map(s => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
                  background: s.bg, borderRadius: 12,
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 100px',
              padding: '0 20px 12px', gap: 16,
            }}>
              {['User', 'Email', 'SOS', 'Reports', 'Joined', 'Status'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95' }}>{h}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mockUsers.map((u, i) => (
                <motion.div key={u.id} className="card card-hover"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 100px', gap: 16, alignItems: 'center' }}>
                    {/* User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.1))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#6C63FF' }}>
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0F0F23' }}>{u.name}</span>
                    </div>
                    {/* Email */}
                    <span style={{ fontSize: 13, color: '#7A7A95' }}>{u.email}</span>
                    {/* SOS */}
                    <span style={{ fontSize: 14, fontWeight: 700, color: u.sos > 0 ? '#FF5A7A' : '#7A7A95' }}>{u.sos}</span>
                    {/* Reports */}
                    <span style={{ fontSize: 14, fontWeight: 700, color: u.reports > 0 ? '#FFB800' : '#7A7A95' }}>{u.reports}</span>
                    {/* Joined */}
                    <span style={{ fontSize: 13, color: '#7A7A95' }}>{u.joined}</span>
                    {/* Status */}
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
                      background: u.active ? '#EDFBF6' : '#F4F6FB',
                      color: u.active ? '#00A878' : '#7A7A95',
                      display: 'inline-flex', width: 'fit-content',
                    }}>
                      {u.active ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
