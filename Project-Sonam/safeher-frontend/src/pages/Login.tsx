import { useState, type FormEvent, type CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiShieldCheck, HiEye, HiEyeOff, HiExclamationCircle } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

/* ─── Feature cards data ─────────────────────────────────── */
const features = [
  {
    icon: '🛡️',
    title: 'AI Safety Scoring',
    desc: 'Every route is scored in real time using crime stats, lighting conditions, and crowd density.',
  },
  {
    icon: '🗺️',
    title: 'Live Safety Heatmap',
    desc: 'See danger zones overlaid on a live map before you step outside.',
  },
  {
    icon: '🆘',
    title: 'One-tap SOS',
    desc: 'Alert trusted contacts and dispatch police with a single hold — no unlocking required.',
  },
  {
    icon: '📞',
    title: 'Fake Call Escape',
    desc: 'Simulate a realistic incoming call to exit uncomfortable situations discreetly.',
  },
]

/* ─── Animated blob ──────────────────────────────────────── */
function Blob({ style }: { style: CSSProperties }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

/* ─── Mail icon SVG ──────────────────────────────────────── */
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

/* ─── Lock icon SVG ──────────────────────────────────────── */
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/* ─── Component ─────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [emailFocused, setEmailFocused]   = useState(false)
  const [pwdFocused, setPwdFocused]       = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim())                    { setError('Email address is required'); return }
    if (!/\S+@\S+\.\S+/.test(email))     { setError('Please enter a valid email address'); return }
    if (!password)                        { setError('Password is required'); return }

    setLoading(true)
    try {
      const { authApi } = await import('../services/api')
      const { data } = await authApi.login({ email: email.trim().toLowerCase(), password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(msg || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '55% 45%',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* ════════════════════════════════════════
          LEFT — Branding Panel
      ════════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #0D0D1F 0%, #14143A 35%, #1C1040 65%, #1A0E2E 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 64px',
      }}>
        {/* Animated blobs */}
        <Blob style={{ width: 520, height: 520, top: '-140px', right: '-140px', background: 'radial-gradient(circle, #6C63FF, transparent)' }} />
        <Blob style={{ width: 420, height: 420, bottom: '-100px', left: '-100px', background: 'radial-gradient(circle, #FF5A7A, transparent)', animationDelay: '3s' }} />
        <Blob style={{ width: 300, height: 300, top: '40%', left: '30%', background: 'radial-gradient(circle, #9B59B6, transparent)', animationDelay: '5s' }} />

        {/* Grid texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 64 }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #6C63FF, #5A52D5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(108,99,255,0.45)',
              flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 22, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Safique</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2, fontWeight: 500 }}>AI Safety Navigation</div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            style={{ marginBottom: 24 }}
          >
            <h1 style={{
              fontSize: 56, fontWeight: 700, color: 'white', lineHeight: 1.1,
              letterSpacing: '-0.03em', margin: 0,
            }}>
              Travel Smarter,
              <br />
              <span style={{
                backgroundImage: 'linear-gradient(135deg, #A78BFF 0%, #FF6B9D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Stay Safer.
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{
              fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
              maxWidth: 440, margin: '0 0 48px 0', fontWeight: 400,
            }}
          >
            Safique uses AI to analyze route safety in real time — so every woman can travel with confidence and peace of mind.
          </motion.p>

          {/* Feature cards grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                style={{
                  minHeight: 80,
                  padding: '20px 20px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  transition: 'background 0.2s, border-color 0.2s',
                  cursor: 'default',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.18)' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>{f.icon}</span>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13.5, fontWeight: 700, marginBottom: 5, lineHeight: 1.3 }}>{f.title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            position: 'absolute', bottom: 32, left: 64,
            color: 'rgba(255,255,255,0.18)', fontSize: 12, fontWeight: 500,
            letterSpacing: '0.04em', zIndex: 1,
          }}
        >
          Empowering Women's Safety Through Smart Navigation
        </motion.p>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Login Form Panel
      ════════════════════════════════════════ */}
      <div style={{
        background: '#F5F6FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        overflowY: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'white',
            borderRadius: 28,
            padding: '48px',
            boxShadow: '0 4px 6px rgba(15,15,35,0.04), 0 24px 60px rgba(15,15,35,0.08), 0 1px 2px rgba(15,15,35,0.06)',
            border: '1px solid rgba(15,15,35,0.06)',
          }}
        >
          {/* Card logo (desktop visible) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #6C63FF, #5A52D5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(108,99,255,0.35)', flexShrink: 0,
            }}>
              <HiShieldCheck style={{ color: 'white', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0F0F23', lineHeight: 1.1 }}>Safique</div>
              <div style={{ fontSize: 11, color: '#9A9AB0', marginTop: 1, fontWeight: 500 }}>Secure Sign In</div>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 40, fontWeight: 700, color: '#0F0F23',
              letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 10px 0',
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 16, color: '#7A7A95', margin: 0, lineHeight: 1.5, fontWeight: 400 }}>
              Sign in to your Safique account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Email field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 14, fontWeight: 600,
                color: '#0F0F23', marginBottom: 8, letterSpacing: '-0.01em',
              }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                  color: emailFocused ? '#6C63FF' : '#9A9AB0',
                  transition: 'color 0.15s', pointerEvents: 'none',
                  display: 'flex', alignItems: 'center',
                }}>
                  <MailIcon />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    height: 56,
                    paddingLeft: 52,
                    paddingRight: 18,
                    fontSize: 16,
                    color: '#0F0F23',
                    background: emailFocused ? '#FAFAFA' : '#F7F8FC',
                    border: `2px solid ${emailFocused ? '#6C63FF' : '#E8EAF2'}`,
                    borderRadius: 16,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
                    boxShadow: emailFocused ? '0 0 0 4px rgba(108,99,255,0.10)' : 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#0F0F23', letterSpacing: '-0.01em' }}>
                  Password
                </label>
                <button
                  type="button"
                  style={{
                    fontSize: 13, fontWeight: 600, color: '#6C63FF',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#5A52D5')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6C63FF')}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                  color: pwdFocused ? '#6C63FF' : '#9A9AB0',
                  transition: 'color 0.15s', pointerEvents: 'none',
                  display: 'flex', alignItems: 'center',
                }}>
                  <LockIcon />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onFocus={() => setPwdFocused(true)}
                  onBlur={() => setPwdFocused(false)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: 56,
                    paddingLeft: 52,
                    paddingRight: 56,
                    fontSize: 16,
                    color: '#0F0F23',
                    background: pwdFocused ? '#FAFAFA' : '#F7F8FC',
                    border: `2px solid ${pwdFocused ? '#6C63FF' : '#E8EAF2'}`,
                    borderRadius: 16,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
                    boxShadow: pwdFocused ? '0 0 0 4px rgba(108,99,255,0.10)' : 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
                    color: '#9A9AB0', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: 0, transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#0F0F23')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9A9AB0')}
                >
                  {showPwd
                    ? <HiEyeOff style={{ fontSize: 20 }} />
                    : <HiEye style={{ fontSize: 20 }} />
                  }
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#FFF0F3', border: '1.5px solid rgba(255,90,122,0.25)',
                    borderRadius: 12, padding: '13px 16px',
                    fontSize: 14, color: '#E04A6A', fontWeight: 500,
                  }}>
                    <HiExclamationCircle style={{ fontSize: 18, flexShrink: 0 }} />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign In button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { y: -2, boxShadow: '0 12px 32px rgba(108,99,255,0.45)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 16,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 16,
                fontWeight: 600,
                color: 'white',
                background: loading
                  ? 'linear-gradient(135deg, #9A95E8, #8A86E0)'
                  : 'linear-gradient(135deg, #6C63FF 0%, #5A52D5 50%, #4A43C0 100%)',
                boxShadow: loading ? 'none' : '0 6px 24px rgba(108,99,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'box-shadow 0.2s',
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
                marginBottom: 0,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    animation: 'spin .7s linear infinite',
                    flexShrink: 0,
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <HiShieldCheck style={{ fontSize: 20 }} />
                  Sign In to Safique
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#EAEDF5' }} />
            <span style={{ fontSize: 12, color: '#9A9AB0', fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
              QUICK DEMO
            </span>
            <div style={{ flex: 1, height: 1, background: '#EAEDF5' }} />
          </div>

          {/* Demo buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Demo User',  emoji: '👩', email: 'user@safique.app',  pwd: 'safique123', color: '#6C63FF', bg: '#F0EEFF', hoverBg: '#E5E0FF' },
              { label: 'Demo Admin', emoji: '🛡️', email: 'admin@safique.app', pwd: 'admin123',   color: '#00A878', bg: '#EDFBF6', hoverBg: '#D8F5EC' },
            ].map(d => (
              <motion.button
                key={d.label}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setEmail(d.email); setPassword(d.pwd); setError('') }}
                style={{
                  height: 48, borderRadius: 14, border: `1.5px solid ${d.color}20`,
                  background: d.bg, cursor: 'pointer', fontSize: 13.5, fontWeight: 700,
                  color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = d.hoverBg }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = d.bg }}
              >
                <span style={{ fontSize: 16 }}>{d.emoji}</span>
                {d.label}
              </motion.button>
            ))}
          </div>

          {/* Register link */}
          <p style={{
            textAlign: 'center', fontSize: 14.5, color: '#9A9AB0',
            margin: 0, lineHeight: 1.5,
          }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#6C63FF', fontWeight: 700, textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#5A52D5')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#6C63FF')}
            >
              Create an account
            </Link>
          </p>

        </motion.div>
      </div>

      {/* ── Responsive override styles ── */}
      <style>{`
        @media (max-width: 1024px) {
          .auth-grid { grid-template-columns: 50% 50% !important; }
        }
        @media (max-width: 768px) {
          .auth-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto 1fr !important;
            height: auto !important;
            min-height: 100vh !important;
          }
          .auth-left {
            padding: 40px 32px !important;
            min-height: 340px !important;
          }
          .auth-right {
            padding: 32px 20px !important;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
