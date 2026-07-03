import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const ALERTS = [
  { msg: 'High crime area reported near City Center. Avoid after 8 PM.', risk: 'high',   time: '2 min ago',  area: 'City Center' },
  { msg: 'Street lights not working in Sector 7, Zone B.',               risk: 'medium', time: '15 min ago', area: 'Sector 7'    },
  { msg: 'Police patrol active near MG Road. Safe to travel.',           risk: 'low',    time: '1 hr ago',   area: 'MG Road'     },
  { msg: 'Isolated path at Riverside reported unsafe at night.',         risk: 'high',   time: '3 hr ago',   area: 'Riverside'   },
]

const QUICK_ACTIONS = [
  { label: 'SOS Alert',      path: '/sos',                icon: '🆘', color: '#FF4D8D', glow: 'rgba(255,77,141,0.5)'    },
  { label: 'Live Map',       path: '/map',                icon: '🗺️', color: '#38BDF8', glow: 'rgba(56,189,248,0.5)'   },
  { label: 'Fake Call',      path: '/fake-call',          icon: '📞', color: '#00D98B', glow: 'rgba(0,217,139,0.5)'    },
  { label: 'Voice SOS',      path: '/voice-trigger',      icon: '🎙️', color: '#FFB800', glow: 'rgba(255,184,0,0.5)'   },
  { label: 'AI Assistant',   path: '/chatbot',            icon: '🤖', color: '#9B59B6', glow: 'rgba(155,89,182,0.5)'   },
  { label: 'Contacts',       path: '/emergency-contacts', icon: '👥', color: '#FF4D8D', glow: 'rgba(255,77,141,0.4)'   },
  { label: 'Safety Heatmap', path: '/heatmap',            icon: '🔥', color: '#FF7043', glow: 'rgba(255,112,67,0.5)'   },
  { label: 'Report Area',    path: '/report',             icon: '📋', color: '#7C6FFF', glow: 'rgba(124,111,255,0.5)'  },
]

const STATS = [
  { label: 'Safe Routes', value: '12', sub: '+3 today',       color: '#00D98B', glow: 'rgba(0,217,139,0.3)',    icon: '🛡️' },
  { label: 'Active Alerts',  value: '4',  sub: '2 high risk',    color: '#FF5A7A', glow: 'rgba(255,90,122,0.3)',  icon: '🔔' },
  { label: 'SOS Events',     value: '2',  sub: 'This week',      color: '#FF4D8D', glow: 'rgba(255,77,141,0.3)',  icon: '🆘' },
  { label: 'Reports Filed',  value: '7',  sub: '3 resolved',     color: '#FFB800', glow: 'rgba(255,184,0,0.3)',   icon: '📋' },
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
  if (h >= 22 || h < 5)  return { level: 'Caution',  color: '#FFB800', glow: 'rgba(255,184,0,0.5)',   bar: 45 }
  if (h >= 18)            return { level: 'Moderate', color: '#FFB800', glow: 'rgba(255,184,0,0.5)',   bar: 62 }
  return                         { level: 'Good',     color: '#00D98B', glow: 'rgba(0,217,139,0.5)',   bar: 88 }
}

const RISK_COLORS = { high: '#FF5A7A', medium: '#FFB800', low: '#00D98B' }

export default function Dashboard() {
  const [dest, setDest]    = useState('')
  const [tipIdx]           = useState(() => Math.floor(Math.random() * SAFETY_TIPS.length))
  const navigate           = useNavigate()
  const { user }           = useAuth()
  const safety             = safetyStatus()
  const firstName          = user?.name ? user.name.split(' ')[0] : 'Traveler'

  return (
    <div className="page-wrapper" style={{ position:'relative' }}>
      {/* Background orbs */}
      <div style={{ position:'fixed', width:500, height:500, top:'-100px', right:'-100px', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,111,255,0.1), transparent 70%)', filter:'blur(80px)', pointerEvents:'none', zIndex:0, animation:'aurora 12s ease-in-out infinite' }} />
      <div style={{ position:'fixed', width:400, height:400, bottom:'10%', left:'5%', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,77,141,0.08), transparent 70%)', filter:'blur(80px)', pointerEvents:'none', zIndex:0, animation:'aurora 15s ease-in-out infinite 3s' }} />

      {/* ═══ HEADER ═══ */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:36, position:'relative', zIndex:1 }}>
        <div>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:500, marginBottom:6, letterSpacing:'0.04em' }}>{greeting()},</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:8 }}>
            <span style={{ background:'linear-gradient(135deg, #A78BFF, #FF80B0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{firstName}</span>
            <span style={{ fontSize:'2rem', marginLeft:8 }}>👋</span>
          </h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)', lineHeight:1.5 }}>Here's your safety overview for today</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:4 }}>
          <motion.button whileHover={{ y:-2, scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => navigate('/chatbot')}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'rgba(255,255,255,0.06)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.8)', cursor:'pointer', transition:'all 0.2s' }}
          >
            🤖 AI Assistant
          </motion.button>
          <motion.div whileHover={{ scale:1.08 }} onClick={() => navigate('/profile')}
            style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg, #7C6FFF, #FF4D8D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'white', cursor:'pointer', boxShadow:'0 0 20px rgba(124,111,255,0.4)' }}>
            {firstName.slice(0, 2).toUpperCase()}
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:18, marginBottom:28, position:'relative', zIndex:1 }}>
        {STATS.map((s, i) => (
          <motion.div key={s.label} className="stat-card"
            initial={{ opacity:0, y:20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:i*0.07 }}
            whileHover={{ y:-6, scale:1.03 }}
            style={{ background:`linear-gradient(135deg, ${s.glow.replace('0.3','0.08')}, rgba(255,255,255,0.03))`, borderColor:`${s.color}25` }}
          >
            <div className="stat-icon-wrap" style={{ background:`${s.glow.replace('0.3','0.15')}`, boxShadow:`0 0 20px ${s.glow}` }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color:s.color, textShadow:`0 0 20px ${s.glow}` }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:22, position:'relative', zIndex:1 }}>

        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

          {/* Safety Status + Route Search */}
          <div className="dash-inner-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

            {/* Safety Status */}
            <motion.div className="card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              style={{ padding:26, borderColor:`${safety.color}20`, background:`linear-gradient(135deg, ${safety.color}08, rgba(255,255,255,0.03))` }}>
              <div className="section-title" style={{ marginBottom:18, color:'rgba(255,255,255,0.7)' }}>Area Safety Status</div>
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:18 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:safety.color, boxShadow:`0 0 12px ${safety.color}`, flexShrink:0 }} className="animate-blink" />
                    <span style={{ fontSize:'1.8rem', fontWeight:900, color:safety.color, textShadow:`0 0 20px ${safety.glow}`, letterSpacing:'-0.02em' }}>
                      {safety.level}
                    </span>
                  </div>
                  <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.4)', lineHeight:1.5, maxWidth:160 }}>Real-time area safety assessment</p>
                </div>
                <div style={{
                  width:64, height:64, borderRadius:18, flexShrink:0,
                  background:`linear-gradient(135deg, ${safety.color}, ${safety.color}AA)`,
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  boxShadow:`0 0 30px ${safety.glow}, 0 8px 24px rgba(0,0,0,0.4)`, position:'relative',
                }}>
                  <div style={{ position:'absolute', inset:0, borderRadius:18, background:'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)', pointerEvents:'none' }} />
                  <span style={{ color:'white', fontSize:22, fontWeight:900, lineHeight:1 }}>{safety.bar}</span>
                  <span style={{ color:'rgba(255,255,255,0.7)', fontSize:10, marginTop:2 }}>/100</span>
                </div>
              </div>
              <div className="progress-bar" style={{ marginBottom:12 }}>
                <motion.div className="progress-fill" initial={{ width:0 }}
                  animate={{ width:`${safety.bar}%` }} transition={{ delay:0.5, duration:1, ease:'easeOut' }}
                  style={{ background:`linear-gradient(90deg, ${safety.color}80, ${safety.color})`, boxShadow:`0 0 12px ${safety.glow}` }} />
              </div>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontStyle:'italic', lineHeight:1.4 }}>
                💡 {SAFETY_TIPS[tipIdx]}
              </p>
            </motion.div>

            {/* Route Search */}
            <motion.div className="card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}
              style={{ padding:26, display:'flex', flexDirection:'column', gap:14 }}>
              <div className="section-title" style={{ color:'rgba(255,255,255,0.8)' }}>Find Safe Route</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 14px', backdropFilter:'blur(8px)' }}>
                <span style={{ fontSize:17, flexShrink:0 }}>📍</span>
                <input value={dest} onChange={e => setDest(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && navigate('/route-finder')}
                  placeholder="Where do you want to go?"
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:13.5, color:'rgba(255,255,255,0.8)', fontFamily:'inherit' }}
                />
              </div>
              <motion.button className="btn btn-primary" whileHover={{ y:-2 }} whileTap={{ scale:0.97 }}
                style={{ width:'100%', padding:'13px 20px', fontSize:14 }} onClick={() => navigate('/route-finder')}>
                ✨ Analyze Safe Routes
              </motion.button>
              <motion.button className="btn btn-ghost" whileTap={{ scale:0.97 }}
                style={{ width:'100%', padding:'11px 20px', fontSize:14 }} onClick={() => navigate('/map')}>
                🗺️ Open Live Map
              </motion.button>
            </motion.div>
          </div>

          {/* Quick Actions 3D Grid */}
          <motion.div className="card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }} style={{ padding:26 }}>
            <div className="section-header">
              <div className="section-title" style={{ color:'rgba(255,255,255,0.8)' }}>Quick Actions</div>
              <span style={{ fontSize:11.5, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', padding:'4px 12px', borderRadius:999, fontWeight:600 }}>8 tools</span>
            </div>
            <div className="actions-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <motion.button key={a.label} className="action-card"
                  initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 + i * 0.05 }}
                  whileHover={{ y:-8, scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => navigate(a.path)}
                  style={{ border:`1px solid ${a.color}20`, background:`${a.color}08` }}
                >
                  <div className="action-icon"
                    style={{ background:`linear-gradient(135deg, ${a.color}30, ${a.color}18)`, boxShadow:`0 8px 24px ${a.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`, border:`1px solid ${a.color}30` }}>
                    <span style={{ fontSize:26 }}>{a.icon}</span>
                  </div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:'rgba(255,255,255,0.85)', textAlign:'center' }}>{a.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

          {/* Safety Alerts */}
          <motion.div className="card" initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }} style={{ padding:26, flex:1 }}>
            <div className="section-header">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>🔔</span>
                <div className="section-title" style={{ color:'rgba(255,255,255,0.8)' }}>Safety Alerts</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#FF4D8D', boxShadow:'0 0 8px #FF4D8D' }} className="animate-blink" />
                <span style={{ fontSize:11, fontWeight:700, color:'#FF80B0' }}>Live</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {ALERTS.map((alert, i) => {
                const c = RISK_COLORS[alert.risk as keyof typeof RISK_COLORS]
                return (
                  <motion.div key={i} className="alert-card"
                    initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25 + i * 0.08 }}
                    style={{ borderLeftColor:c, background:`${c}08` }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:`${c}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0, boxShadow:`0 0 12px ${c}30` }}>
                      {alert.risk === 'high' ? '⚠️' : alert.risk === 'medium' ? '🔶' : '✅'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5, gap:8 }}>
                        <span className={`badge badge-${alert.risk}`}>{alert.risk === 'high' ? 'High Risk' : alert.risk === 'medium' ? 'Medium' : 'Safe'}</span>
                        <span style={{ fontSize:10.5, color:'rgba(255,255,255,0.25)', fontWeight:500, flexShrink:0 }}>{alert.time}</span>
                      </div>
                      <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.65)', fontWeight:500, lineHeight:1.5, marginBottom:5 }}>{alert.msg}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#A78BFF', fontWeight:600 }}>
                        📍 {alert.area}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <motion.button whileHover={{ y:-2 }} onClick={() => navigate('/heatmap')} style={{
              width:'100%', marginTop:14, padding:'11px 16px',
              background:'rgba(124,111,255,0.1)', border:'1px solid rgba(124,111,255,0.25)',
              borderRadius:12, fontSize:13, fontWeight:700, color:'#A78BFF',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer',
              backdropFilter:'blur(8px)', transition:'all 0.2s',
            }}>
              🗺️ View Safety Heatmap →
            </motion.button>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="card" initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.28 }} style={{ padding:22 }}>
            <div className="section-title" style={{ marginBottom:14, color:'rgba(255,255,255,0.7)' }}>Quick Links</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {[
                { label:'Emergency Contacts', sub:'3 contacts saved', path:'/emergency-contacts', icon:'👥', color:'#FF4D8D' },
                { label:'My Reports',         sub:'7 reports filed',  path:'/report',             icon:'📋', color:'#7C6FFF' },
                { label:'Voice Trigger',      sub:'Hands-free SOS',   path:'/voice-trigger',      icon:'🎙️', color:'#FFB800' },
                { label:'Fake Call',          sub:'Escape safely',    path:'/fake-call',          icon:'📞', color:'#00D98B' },
              ].map(item => (
                <motion.button key={item.label} className="quick-link" whileTap={{ scale:0.98 }} onClick={() => navigate(item.path)}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${item.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0, boxShadow:`0 0 12px ${item.color}25` }}>
                    {item.icon}
                  </div>
                  <div style={{ flex:1, textAlign:'left' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)', lineHeight:1.3 }}>{item.label}</div>
                    <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{item.sub}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
