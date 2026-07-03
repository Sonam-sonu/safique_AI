import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const NAV = [
  {
    section: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: '⊞', emoji: true },
      { path: '/route-finder', label: 'Route Finder', icon: '🧭' },
      { path: '/map', label: 'Live Map', icon: '🗺️' },
      { path: '/heatmap', label: 'Safety Map', icon: '🔥' },
    ],
  },
  {
    section: 'Safety',
    items: [
      { path: '/emergency-contacts', label: 'Contacts', icon: '👥' },
      { path: '/fake-call', label: 'Fake Call', icon: '📞' },
      { path: '/chatbot', label: 'AI Assistant', icon: '🤖' },
      { path: '/report', label: 'Report Area', icon: '📋' },
    ],
  },
  {
    section: 'Account',
    items: [
      { path: '/profile', label: 'Profile', icon: '👤' },
      { path: '/admin', label: 'Admin Panel', icon: '🛡️' },
    ],
  },
]

const accentColors: Record<string, string> = {
  '/dashboard': '#7C6FFF',
  '/route-finder': '#00D98B',
  '/map': '#38BDF8',
  '/heatmap': '#FF5A7A',
  '/emergency-contacts': '#FF4D8D',
  '/fake-call': '#00D98B',
  '/chatbot': '#9B59B6',
  '/report': '#FF7043',
  '/profile': '#7C6FFF',
  '/admin': '#FFB800',
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SH'

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="sidebar">
      {/* Animated gradient border top */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, #7C6FFF, #FF4D8D, #00D98B, #7C6FFF)', backgroundSize:'200%', animation:'shimmer 3s linear infinite', zIndex:2 }} />

      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <motion.div
            whileHover={{ scale:1.05, rotate:5 }}
            transition={{ type:'spring', stiffness:300 }}
            style={{
              width:44, height:44, borderRadius:14,
              background:'linear-gradient(135deg, #7C6FFF, #FF4D8D)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 20px rgba(124,111,255,0.5), 0 8px 24px rgba(0,0,0,0.4)',
              flexShrink:0, position:'relative',
            }}
          >
            <div style={{ position:'absolute', inset:0, borderRadius:14, background:'linear-gradient(135deg, rgba(255,255,255,0.25), transparent)', pointerEvents:'none' }} />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </motion.div>
          <div>
            <div style={{ color:'white', fontWeight:800, fontSize:18, letterSpacing:'-0.02em', lineHeight:1.1, background:'linear-gradient(135deg, #A78BFF, #FF80B0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Safique</div>
            <div style={{ color:'rgba(255,255,255,0.3)', fontSize:10.5, marginTop:2, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase' }}>AI Safety Nav</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom:8 }}>
            <div className="sidebar-section-label">{section}</div>
            {items.map(item => {
              const active = isActive(item.path)
              const accent = accentColors[item.path] || '#7C6FFF'
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileTap={{ scale: 0.97 }}
                  className={`sidebar-item${active ? ' active' : ''}`}
                  style={active ? { background:`linear-gradient(135deg, ${accent}28, ${accent}12)`, color:'white', borderColor:`${accent}40`, boxShadow:`0 4px 20px ${accent}25, inset 0 1px 0 ${accent}20` } : {}}
                >
                  <span className="sidebar-icon" style={{ fontSize:17, width:20, textAlign:'center' }}>{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        layoutId="active-dot"
                        initial={{ scale:0 }}
                        animate={{ scale:1 }}
                        exit={{ scale:0 }}
                        style={{ width:6, height:6, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accent}`, marginLeft:'auto', flexShrink:0 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </div>
        ))}

        <div style={{ flex:1 }} />

        {/* SOS Button */}
        <div style={{ padding:'12px 0 8px' }}>
          <motion.button
            whileHover={{ scale:1.02, y:-2 }}
            whileTap={{ scale:0.97 }}
            onClick={() => navigate('/sos')}
            style={{
              width:'100%', padding:'13px 16px', borderRadius:14,
              background:'linear-gradient(135deg, #FF4D8D, #E03A7A)',
              color:'white', fontWeight:700, fontSize:14,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              border:'none', cursor:'pointer',
              boxShadow:'0 6px 24px rgba(255,77,141,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
              position:'relative', overflow:'hidden',
            }}
          >
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)', borderRadius:14 }} />
            <span style={{ fontSize:18 }}>🆘</span>
            Emergency SOS
          </motion.button>

          <motion.button
            whileTap={{ scale:0.97 }}
            onClick={() => navigate('/voice-trigger')}
            style={{
              width:'100%', padding:'10px 14px', marginTop:8, borderRadius:12,
              background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)',
              border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer',
              fontSize:13, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'all 0.15s', backdropFilter:'blur(8px)',
            }}
          >
            🎙️ Voice Trigger
          </motion.button>
        </div>
      </nav>

      {/* User Footer */}
      <div style={{ padding:'16px 20px 24px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:38, height:38, borderRadius:12, flexShrink:0,
            background:'linear-gradient(135deg, #7C6FFF, #FF4D8D)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(124,111,255,0.4)',
          }}>
            <span style={{ color:'white', fontSize:12, fontWeight:800 }}>{initials}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'User'}</div>
            <div style={{ color:'rgba(255,255,255,0.25)', fontSize:10.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:1 }}>{user?.email || ''}</div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            title="Sign out"
            style={{ width:30, height:30, borderRadius:8, border:'none', cursor:'pointer', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, transition:'all 0.15s' }}
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  )
}
