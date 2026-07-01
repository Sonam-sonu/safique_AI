import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

/* ─── Static data ─────────────────────────────────────────── */
const ALERTS = [
  { msg: 'High crime area reported near City Center. Avoid after 8 PM.', risk: 'high',   time: '2 min ago',  area: 'City Center' },
  { msg: 'Street lights not working in Sector 7, Zone B.',               risk: 'medium', time: '15 min ago', area: 'Sector 7'    },
  { msg: 'Police patrol active near MG Road. Safe to travel.',           risk: 'low',    time: '1 hr ago',   area: 'MG Road'     },
  { msg: 'Isolated path at Riverside reported unsafe at night.',         risk: 'high',   time: '3 hr ago',   area: 'Riverside'   },
]

const QUICK_ACTIONS = [
  { label: 'SOS Alert',       path: '/sos',                desc: 'Emergency activation',    icon: '🆘', bg: 'linear-gradient(135deg,#FF5A7A,#E04A6A)', shadow: 'rgba(255,90,122,0.3)' },
  { label: 'Live Map',        path: '/map',                desc: 'View routes on map',       icon: '🗺️', bg: 'linear-gradient(135deg,#6C63FF,#5A52D5)', shadow: 'rgba(108,99,255,0.3)' },
  { label: 'Fake Call',       path: '/fake-call',          desc: 'Simulate incoming call',   icon: '📞', bg: 'linear-gradient(135deg,#00C48C,#00A878)', shadow: 'rgba(0,196,140,0.3)'  },
  { label: 'Voice SOS',       path: '/voice-trigger',      desc: 'Hands-free activation',   icon: '🎙️', bg: 'linear-gradient(135deg,#FFB800,#E5A600)', shadow: 'rgba(255,184,0,0.3)'  },
  { label: 'AI Assistant',    path: '/chatbot',            desc: 'Safety guidance & tips',   icon: '🤖', bg: 'linear-gradient(135deg,#9B59B6,#7D3C98)', shadow: 'rgba(155,89,182,0.3)' },
  { label: 'Contacts',        path: '/emergency-contacts', desc: 'Manage trusted contacts',  icon: '👥', bg: 'linear-gradient(135deg,#E91E8C,#C0166F)', shadow: 'rgba(233,30,140,0.3)' },
  { label: 'Safety Heatmap',  path: '/heatmap',            desc: 'Danger zones near you',   icon: '🔥', bg: 'linear-gradient(135deg,#3AAFE3,#2196C8)', shadow: 'rgba(58,175,227,0.3)' },
  { label: 'Report Area',     path: '/report',             desc: 'Submit safety report',     icon: '📋', bg: 'linear-gradient(135deg,#FF7043,#E64A19)', shadow: 'rgba(255,112,67,0.3)' },
]

const QUICK_LINKS = [
  { label: 'Emergency Contacts', sub: '3 contacts saved',  path: '/emergency-contacts', icon: '👥', bg: '#FFF0F7', color: '#E91E8C' },
  { label: 'My Reports',         sub: '7 reports filed',   path: '/report',             icon: '📋', bg: '#FFF4EE', color: '#FF7043' },
  { label: 'Voice Trigger',      sub: 'Hands-free SOS',    path: '/voice-trigger',      icon: '🎙️', bg: '#F3F0FF', color: '#6C63FF' },
  { label: 'Fake Call',          sub: 'Escape safely',     path: '/fake-call',          icon: '📞', bg: '#EDFBF6', color: '#00A878' },
]

const SAFETY_TIPS = [
  'Avoid isolated roads after dark',
  'Keep your emergency contacts updated',
  'Share live location while traveling alone',
  'Use well-lit crowded routes at night',
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function safetyStatus() {
  const h = new Date().getHours()
  if (h >= 22 || h < 5)  return { level: 'Caution',  color: '#FFB800', bar: 45, desc: 'Night hours — prefer safe, well-lit routes' }
  if (h >= 18)            return { level: 'Moderate', color: '#FFB800', bar: 62, desc: 'Evening — stay alert and share your location' }
  return                         { level: 'Good',     color: '#00C48C', bar: 88, desc: 'Daytime — safe travel conditions in most areas' }
}

const STATS = [
  { label: 'Safe Routes Today', value: '12', sub: '+3 from yesterday', color: '#00C48C', bg: '#EDFBF6', icon: '🛡️' },
  { label: 'Active Alerts',     value: '4',  sub: '2 high priority',   color: '#FF5A7A', bg: '#FFF0F3', icon: '🔔' },
  { label: 'SOS Activations',   value: '2',  sub: 'This week',         color: '#FF5A7A', bg: '#FFF0F3', icon: '🆘' },
  { label: 'Reports Filed',     value: '7',  sub: '3 resolved',        color: '#FFB800', bg: '#FFF8E6', icon: '📋' },
]

/* ─── Badge component ─────────────────────────────────────── */
function RiskBadge({ risk }: { risk: string }) {
  const map = { high: { cls: 'badge-high', label: 'High Risk' }, medium: { cls: 'badge-medium', label: 'Medium' }, low: { cls: 'badge-low', label: 'Safe' } }
  const b = map[risk as keyof typeof map] ?? map.medium
  return <span className={`badge ${b.cls}`}>{b.label}</span>
}

const ALERT_BORDER = { high: '#FF5A7A', medium: '#FFB800', low: '#00C48C' }

/* ─── Component ──────────────────────────────────────────── */
export default function Dashboard() {
  const [dest, setDest] = useState('')
  const [tipIdx]        = useState(() => Math.floor(Math.random() * SAFETY_TIPS.length))
  const navigate        = useNavigate()
  const { user }        = useAuth()
  const safety          = safetyStatus()
  const firstName       = user?.name ? user.name.split(' ')[0] : 'Traveler'

  return (
    <div className="page-wrapper">

      {/* ════════════════════ PAGE HEADER ════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}
      >
        <div>
          <p style={{ fontSize: 14, color: '#7A7A95', fontWeight: 500, marginBottom: 6 }}>{greeting()},</p>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F0F23', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            {firstName} <span style={{ fontSize: '1.8rem' }}>👋</span>
          </h1>
          <p style={{ fontSize: 15, color: '#7A7A95', marginTop: 8, lineHeight: 1.5 }}>Here's your safety overview for today</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
          <button onClick={() => navigate('/chatbot')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: 'white', border: '1.5px solid #E2E4EE', borderRadius: 12,
              fontSize: 13, fontWeight: 600, color: '#0F0F23', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(15,15,35,0.06)', transition: 'all 0.15s',
            }}
          >
            <span>🤖</span> AI Assistant
          </button>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.1))',
            border: '1.5px solid rgba(108,99,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#6C63FF', cursor: 'pointer',
          }} onClick={() => navigate('/profile')}>
            {firstName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </motion.div>

      {/* ════════════════════ STAT CARDS ════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {STATS.map((s, i) => (
          <motion.div key={s.label} className="stat-card"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className="stat-icon-wrap" style={{ background: s.bg }}>
              <span>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ════════════════════ MAIN GRID (2 + 1 col) ════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>

        {/* ─── Left column ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Safety Status + Route Search */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Safety Status */}
            <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ padding: 28 }}>
              <div className="section-title" style={{ marginBottom: 20 }}>Area Safety Status</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: safety.color, flexShrink: 0 }}
                      className="animate-blink" />
                    <span style={{ fontSize: '1.625rem', fontWeight: 800, color: safety.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {safety.level}
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: '#7A7A95', lineHeight: 1.5, maxWidth: 180 }}>{safety.desc}</p>
                </div>
                <div style={{
                  width: 68, height: 68, borderRadius: 18, flexShrink: 0,
                  background: safety.color, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 6px 20px ${safety.color}40`,
                }}>
                  <span style={{ color: 'white', fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{safety.bar}</span>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, lineHeight: 1, marginTop: 3 }}>/100</span>
                </div>
              </div>
              <div className="progress-bar" style={{ marginBottom: 14 }}>
                <motion.div className="progress-fill" initial={{ width: 0 }}
                  animate={{ width: `${safety.bar}%` }} transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                  style={{ background: `linear-gradient(90deg, ${safety.color}70, ${safety.color})` }} />
              </div>
              <p style={{ fontSize: 12.5, color: '#9A9AB0', fontStyle: 'italic', lineHeight: 1.4 }}>
                💡 {SAFETY_TIPS[tipIdx]}
              </p>
            </motion.div>

            {/* Route Search */}
            <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="section-title">Find Safe Route</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#F7F8FC', border: '2px solid #E2E4EE', borderRadius: 12, padding: '13px 16px',
                transition: 'border-color 0.15s',
              }}
                onFocus={() => {}} // for styling, actual focus handled by input
              >
                <span style={{ fontSize: 18, color: '#6C63FF', flexShrink: 0 }}>📍</span>
                <input
                  value={dest} onChange={e => setDest(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && navigate('/route-finder')}
                  placeholder="Where do you want to go?"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 14, color: '#0F0F23', fontFamily: 'inherit',
                  }}
                />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '14px 20px', fontSize: 14 }}
                onClick={() => navigate('/route-finder')}>
                <span>✨</span> Analyze Safe Routes
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', padding: '12px 20px', fontSize: 14 }}
                onClick={() => navigate('/map')}>
                <span>🗺️</span> Open Live Map
              </button>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ padding: 28 }}>
            <div className="section-header">
              <div className="section-title">Quick Actions</div>
              <span style={{ fontSize: 12, color: '#7A7A95', background: '#F0F2F8', border: '1px solid #E2E4EE', padding: '4px 12px', borderRadius: 999, fontWeight: 500 }}>
                8 tools
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <motion.button key={a.label} className="action-card"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(a.path)}
                >
                  <div className="action-icon" style={{ background: a.bg, boxShadow: `0 6px 18px ${a.shadow}` }}>
                    <span style={{ fontSize: 28 }}>{a.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F0F23', marginBottom: 5 }}>{a.label}</div>
                    <div style={{ fontSize: 11.5, color: '#7A7A95', lineHeight: 1.4 }}>{a.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Right column ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Safety Alerts */}
          <motion.div className="card" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            style={{ padding: 28, flex: 1 }}>
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🔔</span>
                <div className="section-title">Safety Alerts</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5A7A' }} className="animate-blink" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF5A7A' }}>Live</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ALERTS.map((alert, i) => (
                <motion.div key={i} className="alert-card"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  style={{ borderLeftColor: ALERT_BORDER[alert.risk as keyof typeof ALERT_BORDER] }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: alert.risk === 'high' ? '#FFF0F3' : alert.risk === 'medium' ? '#FFF8E6' : '#EDFBF6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>
                      {alert.risk === 'high' ? '⚠️' : alert.risk === 'medium' ? '🔶' : '✅'}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                      <RiskBadge risk={alert.risk} />
                      <span style={{ fontSize: 11, color: '#9A9AB0', fontWeight: 500, flexShrink: 0 }}>{alert.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#0F0F23', fontWeight: 500, lineHeight: 1.5, marginBottom: 6 }}>{alert.msg}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#6C63FF', fontWeight: 600 }}>
                      <span>📍</span> {alert.area}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button onClick={() => navigate('/heatmap')} style={{
              width: '100%', marginTop: 16, padding: '12px 16px',
              background: 'rgba(108,99,255,0.06)', border: '1.5px solid rgba(108,99,255,0.2)',
              borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#6C63FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <span>🗺️</span> View Safety Heatmap →
            </button>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="card" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }}
            style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {QUICK_LINKS.map(item => (
                <button key={item.label} className="quick-link" onClick={() => navigate(item.path)}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F0F23', lineHeight: 1.3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#7A7A95', marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0C0D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
