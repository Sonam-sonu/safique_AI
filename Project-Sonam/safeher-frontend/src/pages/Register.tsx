import React, { useState, type FormEvent, type ChangeEvent, type CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiShieldCheck, HiEye, HiEyeOff,
  HiUser, HiMail, HiPhone, HiLockClosed,
  HiExclamationCircle, HiCheckCircle,
} from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

/* ─── Constants ──────────────────────────────────────────── */
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const features = [
  {
    icon: '🛡️',
    title: 'AI Safety Scoring',
    desc: 'Every route scored in real time using crime stats, lighting and crowd density.',
  },
  {
    icon: '🗺️',
    title: 'Live Safety Heatmap',
    desc: 'See danger zones overlaid on a live map before you step outside.',
  },
  {
    icon: '🆘',
    title: 'One-tap SOS',
    desc: 'Alert trusted contacts and dispatch police with a single hold.',
  },
  {
    icon: '📞',
    title: 'Fake Call Escape',
    desc: 'Simulate a realistic incoming call to exit unsafe situations.',
  },
]

/* ─── Animated blob (identical to Login) ─────────────────── */
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

/* ─── Password strength meter ────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6+ chars',  ok: password.length >= 6 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number',    ok: /\d/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const barColor = ['#EF4444', '#F59E0B', '#10B981'][score - 1] ?? '#E5E7EB'
  const label    = ['Weak', 'Medium', 'Strong'][score - 1] ?? ''
  const labelColor = ['#EF4444', '#F59E0B', '#10B981'][score - 1] ?? 'transparent'
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 999,
            background: i < score ? barColor : '#E5E7EB',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          {checks.map(c => (
            <span key={c.label} style={{
              fontSize: 11, fontWeight: 500,
              color: c.ok ? '#10B981' : '#9A9AB0',
            }}>
              {c.ok ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: labelColor }}>{label}</span>
        )}
      </div>
    </div>
  )
}

/* ─── Shared input style helper ─────────────────────────── */
function inputStyle(focused: boolean): CSSProperties {
  return {
    width: '100%',
    height: 56,
    paddingLeft: 52,
    paddingRight: 18,
    fontSize: 16,
    color: '#0F0F23',
    background: focused ? '#FAFAFA' : '#F7F8FC',
    border: `2px solid ${focused ? '#6C63FF' : '#E8EAF2'}`,
    borderRadius: 16,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
    boxShadow: focused ? '0 0 0 4px rgba(108,99,255,0.10)' : 'none',
    boxSizing: 'border-box' as const,
  }
}

/* ─── Icon wrapper helper ────────────────────────────────── */
function IconWrap({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
      color: focused ? '#6C63FF' : '#9A9AB0',
      transition: 'color 0.15s', pointerEvents: 'none',
      display: 'flex', alignItems: 'center',
    }}>
      {children}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', bloodGroup: '',
  })
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [step,     setStep]     = useState<1 | 2>(1)

  // Focus states — mirrors Login exactly
  const [nameFocused,  setNameFocused]  = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [pwdFocused,   setPwdFocused]   = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const validateStep1 = () => {
    if (!form.name.trim())               return 'Full name is required'
    if (!form.email.trim())              return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email'
    return ''
  }

  const validateStep2 = () => {
    if (!form.phone.trim())              return 'Phone number is required'
    if (!form.password)                  return 'Password is required'
    if (form.password.length < 6)       return 'Password must be at least 6 characters'
    return ''
  }

  const next = () => {
    const e = validateStep1()
    if (e) { setError(e); return }
    setError('')
    setStep(2)
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      const { authApi } = await import('../services/api')
      const { data } = await authApi.register({
        name:       form.name.trim(),
        email:      form.email.toLowerCase(),
        phone:      form.phone,
        password:   form.password,
        bloodGroup: form.bloodGroup || '',
      })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (apiErr: any) {
      const msg = apiErr?.response?.data?.message
      setError(msg || 'Registration failed. Please try again.')
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

      {/* ══════════════════════════════════════════
           LEFT — Branding panel (identical to Login)
      ══════════════════════════════════════════ */}
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
        <Blob style={{ width: 420, height: 420, bottom: '-100px', left: '-100px', background: 'radial-gradient(circle, #FF5A7A, transparent)', animationDelay: '3s' } as CSSProperties} />
        <Blob style={{ width: 300, height: 300, top: '40%', left: '30%', background: 'radial-gradient(circle, #9B59B6, transparent)', animationDelay: '5s' } as CSSProperties} />

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
              boxShadow: '0 8px 24px rgba(108,99,255,0.45)', flexShrink: 0,
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
              fontSize: 56, fontWeight: 700, color: 'white',
              lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0,
            }}>
              Your Safety,<br />
              <span style={{
                backgroundImage: 'linear-gradient(135deg, #A78BFF 0%, #FF6B9D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Our Priority.
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
            Safique — <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Safe + Unique</strong>. A platform that provides safety in a unique and intelligent way.
          </motion.p>

          {/* Feature cards grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                style={{
                  minHeight: 80, padding: '20px 20px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
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

      {/* ══════════════════════════════════════════
           RIGHT — Register form panel
      ══════════════════════════════════════════ */}
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

          {/* Card logo */}
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
              <div style={{ fontSize: 11, color: '#9A9AB0', marginTop: 1, fontWeight: 500 }}>Create Account</div>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontSize: 40, fontWeight: 700, color: '#0F0F23',
              letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 10px 0',
            }}>
              Create account
            </h2>
            <p style={{ fontSize: 16, color: '#7A7A95', margin: 0, lineHeight: 1.5, fontWeight: 400 }}>
              Join Safique for safer travel
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            {([1, 2] as const).map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                  background: step > s ? '#10B981' : step === s ? '#6C63FF' : '#E8EAF2',
                  color: step >= s ? 'white' : '#9A9AB0',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}>
                  {step > s ? <HiCheckCircle style={{ fontSize: 16 }} /> : s}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: step === s ? '#0F0F23' : '#9A9AB0',
                }}>
                  {s === 1 ? 'Account Info' : 'Personal Details'}
                </span>
                {s < 2 && (
                  <div style={{
                    width: 40, height: 2, borderRadius: 999,
                    background: step > 1 ? 'rgba(16,185,129,0.5)' : '#E8EAF2',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={step === 1 ? (e) => { e.preventDefault(); next() } : handleRegister}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
          >
            <AnimatePresence mode="wait">

              {/* ── Step 1 — name + email ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}
                >
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F0F23', marginBottom: 8, letterSpacing: '-0.01em' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <IconWrap focused={nameFocused}>
                        <HiUser style={{ fontSize: 18 }} />
                      </IconWrap>
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        placeholder="Sonam Kumari"
                        autoComplete="name"
                        style={inputStyle(nameFocused)}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F0F23', marginBottom: 8, letterSpacing: '-0.01em' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <IconWrap focused={emailFocused}>
                        <HiMail style={{ fontSize: 18 }} />
                      </IconWrap>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        placeholder="sonam@example.com"
                        autoComplete="email"
                        style={inputStyle(emailFocused)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2 — phone + blood group + password ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}
                >
                  {/* Phone + Blood Group — side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                    {/* Phone */}
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F0F23', marginBottom: 8, letterSpacing: '-0.01em' }}>
                        Phone
                      </label>
                      <div style={{ position: 'relative' }}>
                        <IconWrap focused={phoneFocused}>
                          <HiPhone style={{ fontSize: 17 }} />
                        </IconWrap>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={onChange}
                          onFocus={() => setPhoneFocused(true)}
                          onBlur={() => setPhoneFocused(false)}
                          placeholder="9876543210"
                          autoComplete="tel"
                          style={{ ...inputStyle(phoneFocused), paddingLeft: 48 }}
                        />
                      </div>
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F0F23', marginBottom: 8, letterSpacing: '-0.01em' }}>
                        Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={form.bloodGroup}
                        onChange={onChange}
                        style={{
                          width: '100%', height: 56, padding: '0 16px',
                          fontSize: 16, color: form.bloodGroup ? '#0F0F23' : '#9A9AB0',
                          background: '#F7F8FC', border: '2px solid #E8EAF2',
                          borderRadius: 16, outline: 'none', fontFamily: 'inherit',
                          cursor: 'pointer', boxSizing: 'border-box',
                          transition: 'border-color 0.18s',
                          appearance: 'auto',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#6C63FF')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#E8EAF2')}
                      >
                        <option value="">Select</option>
                        {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#0F0F23', marginBottom: 8, letterSpacing: '-0.01em' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <IconWrap focused={pwdFocused}>
                        <HiLockClosed style={{ fontSize: 18 }} />
                      </IconWrap>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        onFocus={() => setPwdFocused(true)}
                        onBlur={() => setPwdFocused(false)}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        style={{ ...inputStyle(pwdFocused), paddingRight: 56 }}
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
                        {showPwd ? <HiEyeOff style={{ fontSize: 20 }} /> : <HiEye style={{ fontSize: 20 }} />}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Error */}
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

            {/* Buttons row */}
            <div style={{ display: 'flex', gap: 12 }}>

              {/* Back — only on step 2 */}
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => { setStep(1); setError('') }}
                  style={{
                    flex: 1, height: 56, borderRadius: 16, border: '2px solid #E8EAF2',
                    background: 'white', color: '#7A7A95', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6C63FF'; (e.currentTarget as HTMLButtonElement).style.color = '#6C63FF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8EAF2'; (e.currentTarget as HTMLButtonElement).style.color = '#7A7A95' }}
                >
                  ← Back
                </button>
              )}

              {/* Continue / Create Account */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { y: -2, boxShadow: '0 12px 32px rgba(108,99,255,0.45)' } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  flex: 1, height: 56, borderRadius: 16, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 16, fontWeight: 600, color: 'white',
                  background: loading
                    ? 'linear-gradient(135deg, #9A95E8, #8A86E0)'
                    : 'linear-gradient(135deg, #6C63FF 0%, #5A52D5 50%, #4A43C0 100%)',
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(108,99,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'box-shadow 0.2s', fontFamily: 'inherit', letterSpacing: '-0.01em',
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
                    Creating account…
                  </>
                ) : step === 1 ? (
                  'Continue →'
                ) : (
                  <>
                    <HiShieldCheck style={{ fontSize: 20 }} />
                    Create Account
                  </>
                )}
              </motion.button>
            </div>

          </form>

          {/* Sign-in link */}
          <p style={{
            textAlign: 'center', fontSize: 14.5, color: '#9A9AB0',
            margin: '28px 0 0', lineHeight: 1.5,
          }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#5A52D5')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#6C63FF')}
            >
              Sign in
            </Link>
          </p>

        </motion.div>
      </div>

      {/* Responsive styles + spin keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .auth-grid { grid-template-columns: 50% 50% !important; }
        }
        @media (max-width: 768px) {
          .auth-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            min-height: 100vh !important;
          }
        }
      `}</style>
    </div>
  )
}
