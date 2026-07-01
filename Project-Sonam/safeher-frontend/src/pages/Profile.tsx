import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiLogout, HiChevronRight, HiPencil, HiCheck, HiX,
  HiShieldCheck, HiUsers, HiDocumentReport, HiMap,
  HiChatAlt2, HiBell, HiLockClosed, HiQuestionMarkCircle,
} from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const statsData = [
  { label: 'Routes Used',   value: '24',  icon: '🗺️', color: '#6C63FF', bg: 'rgba(108,99,255,0.1)'  },
  { label: 'SOS Sent',      value: '2',   icon: '🆘', color: '#FF5A7A', bg: 'rgba(255,90,122,0.1)'  },
  { label: 'Reports Filed', value: '7',   icon: '📋', color: '#FFB800', bg: 'rgba(255,184,0,0.1)'   },
  { label: 'Days Safe',     value: '180', icon: '🛡️', color: '#00C48C', bg: 'rgba(0,196,140,0.1)'   },
]

const menuSections = [
  {
    title: 'Safety Tools',
    items: [
      { label: 'Emergency Contacts',  path: '/emergency-contacts', desc: '3 trusted contacts saved',  icon: <HiUsers style={{ color: '#E91E8C' }} />,              bg: '#FFF0F9' },
      { label: 'Safety Heatmap',      path: '/heatmap',            desc: 'View danger zones',          icon: <HiMap style={{ color: '#3B82F6' }} />,                bg: '#EFF6FF' },
      { label: 'My Reports',          path: '/report',             desc: '7 reports submitted',        icon: <HiDocumentReport style={{ color: '#FF7043' }} />,     bg: '#FFF4F0' },
      { label: 'AI Safety Assistant', path: '/chatbot',            desc: 'Get safety guidance',        icon: <HiChatAlt2 style={{ color: '#9B59B6' }} />,           bg: '#F5F3FF' },
      { label: 'Admin Dashboard',     path: '/admin',              desc: 'Platform management',        icon: <HiShieldCheck style={{ color: '#6C63FF' }} />,        bg: '#F0EEFF' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Notifications',       path: '#', desc: 'Alert preferences',     icon: <HiBell style={{ color: '#F59E0B' }} />,                    bg: '#FFFBEB' },
      { label: 'Privacy & Security',  path: '#', desc: 'Manage your data',      icon: <HiLockClosed style={{ color: '#6B7280' }} />,              bg: '#F4F6FB' },
      { label: 'Help & Support',      path: '#', desc: 'FAQ and contact us',    icon: <HiQuestionMarkCircle style={{ color: '#10B981' }} />,      bg: '#ECFDF5' },
    ],
  },
]

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useAuth()

  const display = {
    name:         user?.name         || 'Priya Sharma',
    email:        user?.email        || 'priya@example.com',
    phone:        user?.phone        || '+91 9876543210',
    bloodGroup:   user?.bloodGroup   || 'B+',
    homeLocation: user?.homeLocation || 'Sector 7, Rohini, Delhi',
    role:         user?.role         || 'user',
  }

  const initials = display.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({
    name: display.name, phone: display.phone,
    bloodGroup: display.bloodGroup, homeLocation: display.homeLocation,
  })

  const save    = () => { updateProfile(form); setEditing(false) }
  const discard = () => {
    setForm({ name: display.name, phone: display.phone, bloodGroup: display.bloodGroup, homeLocation: display.homeLocation })
    setEditing(false)
  }

  return (
    <div className="page-wrapper">

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#7A7A95', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Account</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F0F23', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 8 }}>
          My Profile
        </h1>
        <p style={{ fontSize: 15, color: '#7A7A95', lineHeight: 1.5 }}>
          Manage your account, safety settings and preferences
        </p>
      </motion.div>

      {/* ── 3-col layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>

        {/* ── Left: Profile card + stats + sign out ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile card */}
          <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>

              {/* Avatar */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <div style={{
                  width: 88, height: 88,
                  background: 'linear-gradient(135deg, #6C63FF, #5A52D5)',
                  borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 32px rgba(108,99,255,0.3)',
                }}>
                  <span style={{ color: 'white', fontSize: 32, fontWeight: 900 }}>{initials}</span>
                </div>
                {display.role === 'admin' && (
                  <div style={{
                    position: 'absolute', bottom: -4, right: -4,
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(245,158,11,0.4)',
                    border: '2px solid white',
                  }}>
                    <span style={{ fontSize: 14 }}>👑</span>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { field: 'name',         placeholder: 'Full name',      type: 'text' },
                      { field: 'phone',        placeholder: 'Phone number',   type: 'tel'  },
                      { field: 'homeLocation', placeholder: 'Home location',  type: 'text' },
                    ].map(({ field, placeholder, type }) => (
                      <input key={field} type={type} value={(form as Record<string, string>)[field]}
                        onChange={e => setForm({ ...form, [field]: e.target.value })}
                        placeholder={placeholder}
                        style={{
                          width: '100%', padding: '10px 14px', background: '#F7F8FC',
                          border: '2px solid #E2E4EE', borderRadius: 10, fontSize: 13, color: '#0F0F23',
                          outline: 'none', fontFamily: 'inherit', textAlign: 'center', boxSizing: 'border-box',
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#6C63FF')}
                        onBlur={e => (e.target.style.borderColor = '#E2E4EE')}
                      />
                    ))}
                    <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} style={{
                      width: '100%', padding: '10px 14px', background: '#F7F8FC',
                      border: '2px solid #E2E4EE', borderRadius: 10, fontSize: 13, color: '#0F0F23',
                      outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    }}>
                      {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={save} style={{
                        flex: 1, padding: '10px 16px', background: 'linear-gradient(135deg,#6C63FF,#5A52D5)',
                        color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                        <HiCheck style={{ fontSize: 16 }} /> Save
                      </button>
                      <button onClick={discard} style={{
                        flex: 1, padding: '10px 16px', background: '#F4F6FB', color: '#7A7A95',
                        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}>
                        <HiX style={{ fontSize: 16 }} /> Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F0F23' }}>{display.name}</h2>
                      {display.role === 'admin' && (
                        <span style={{ fontSize: 10, background: '#FEF3C7', color: '#D97706', fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>ADMIN</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#7A7A95', marginBottom: 16 }}>{display.email}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { icon: '📱', value: display.phone,        bg: '#F4F6FB', color: '#7A7A95' },
                        { icon: '🩸', value: `Blood Group: ${display.bloodGroup}`, bg: '#FFF0F3', color: '#E04A6A' },
                        { icon: '🏠', value: display.homeLocation, bg: '#F4F6FB', color: '#7A7A95' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '9px 14px', background: item.bg, borderRadius: 10,
                          fontSize: 12.5, fontWeight: 600, color: item.color,
                        }}>
                          <span>{item.icon}</span>{item.value}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!editing && (
              <button onClick={() => setEditing(true)} style={{
                width: '100%', padding: '10px 16px',
                background: '#F7F8FC', border: '2px solid #EAEDF5', borderRadius: 12,
                fontSize: 13.5, fontWeight: 600, color: '#7A7A95',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6C63FF'; (e.currentTarget as HTMLButtonElement).style.color = '#6C63FF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#EAEDF5'; (e.currentTarget as HTMLButtonElement).style.color = '#7A7A95' }}
              >
                <HiPencil style={{ fontSize: 15 }} /> Edit Profile
              </button>
            )}
          </motion.div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {statsData.map((s, i) => (
              <motion.div key={s.label} className="card card-hover"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ padding: '20px 16px', textAlign: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, margin: '0 auto 10px',
                }}>{s.icon}</div>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11.5, color: '#7A7A95', fontWeight: 500, marginTop: 4 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Sign out */}
          <button onClick={() => { logout(); navigate('/login') }} style={{
            width: '100%', padding: '13px 20px', borderRadius: 14,
            border: '2px solid rgba(255,90,122,0.2)', background: 'white',
            color: '#E04A6A', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FFF0F3'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,90,122,0.4)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,90,122,0.2)' }}
          >
            <HiLogout style={{ fontSize: 18 }} /> Sign Out
          </button>
        </div>

        {/* ── Right: Menu sections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {menuSections.map((section, si) => (
            <motion.div key={section.title} className="card"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: si * 0.1 }}
              style={{ padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 16 }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {section.items.map((item, ii) => (
                  <motion.button key={item.label}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: si * 0.1 + ii * 0.04 }}
                    onClick={() => item.path !== '#' && navigate(item.path)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 12, cursor: item.path !== '#' ? 'pointer' : 'default',
                      background: 'transparent', border: 'none', transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F7F8FC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: item.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0F23', marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: '#7A7A95' }}>{item.desc}</p>
                    </div>
                    <HiChevronRight style={{ color: '#C0C0D8', fontSize: 16, flexShrink: 0 }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
