import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiUserAdd, HiTrash, HiPencil, HiPhone, HiShieldCheck, HiX, HiCheck, HiPlus } from 'react-icons/hi'
/* Official WhatsApp logo — green circle + white icon */
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Green background circle */}
      <circle cx="24" cy="24" r="24" fill="#25D366" />
      {/* Official white speech-bubble phone path */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 10C16.268 10 10 16.268 10 24c0 2.493.672 4.83 1.845 6.84L10 38l7.37-1.818A13.94 13.94 0 0 0 24 38c7.732 0 14-6.268 14-14S31.732 10 24 10Zm-4.382 7.697c-.38-.853-.78-.87-1.14-.885-.295-.013-.633-.012-.97-.012-.338 0-.887.127-1.351.634-.464.507-1.774 1.733-1.774 4.227 0 2.494 1.816 4.905 2.069 5.243.253.338 3.548 5.65 8.732 7.692 4.32 1.703 5.198 1.364 6.137 1.279.94-.085 3.03-1.238 3.457-2.435.428-1.196.428-2.222.3-2.435-.127-.211-.464-.338-.97-.592-.507-.253-3-.1481-3.507-1.901-.507-.253-.845-.38-1.2.38-.354.76-1.38 1.901-1.69 2.28-.312.38-.633.423-1.14.17-.507-.254-2.14-.789-4.075-2.516-1.506-1.343-2.523-3.001-2.818-3.508-.295-.507-.031-.781.222-1.033.227-.226.507-.592.76-.887.254-.296.338-.507.507-.845.17-.338.085-.634-.042-.887Z"
        fill="white"
      />
    </svg>
  )
}
import { contactsApi } from '../services/api'

const MAX_CONTACTS = 5

interface Contact { id: string; name: string; phone: string; relation: string }

interface MessageTarget { contact: Contact; prefill?: string }

const QUICK_TEMPLATES = [
  { label: 'Unsafe', text: 'I am feeling unsafe. Please call me immediately.' },
  { label: 'Need Help', text: 'I need help. Please check my location.' },
  { label: 'SOS Active', text: 'I have triggered SOS. Please contact me right away.' },
  { label: 'Check In', text: 'Please check on me. I have not arrived home yet.' },
]

const relationMeta: Record<string, { color: string; bg: string; gradient: string }> = {
  Mother:  { color: '#E91E8C', bg: '#FFF0F9', gradient: 'linear-gradient(135deg,#F472B6,#EC4899)' },
  Father:  { color: '#3B82F6', bg: '#EFF6FF', gradient: 'linear-gradient(135deg,#60A5FA,#3B82F6)' },
  Sister:  { color: '#8B5CF6', bg: '#F5F3FF', gradient: 'linear-gradient(135deg,#A78BFA,#7C3AED)' },
  Brother: { color: '#6366F1', bg: '#EEF2FF', gradient: 'linear-gradient(135deg,#818CF8,#4F46E5)' },
  Friend:  { color: '#10B981', bg: '#ECFDF5', gradient: 'linear-gradient(135deg,#34D399,#059669)' },
  Husband: { color: '#F43F5E', bg: '#FFF1F2', gradient: 'linear-gradient(135deg,#FB7185,#E11D48)' },
  Other:   { color: '#7A7A95', bg: '#F4F6FB', gradient: 'linear-gradient(135deg,#9CA3AF,#6B7280)' },
}

const getMeta = (relation: string) => relationMeta[relation] ?? relationMeta['Other']

const commonRelations = ['Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Husband', 'Other']

/** Detect if we are on a mobile / touch device */
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

/* ─── WhatsApp emergency sender ─────────────────────────── */
function sendWhatsApp(phone: string, contactName: string) {
  // Sanitise phone: strip spaces, dashes, parentheses; ensure leading +
  const clean = phone.replace(/[\s\-().]/g, '')
  const e164  = clean.startsWith('+') ? clean : `+91${clean}` // default India code

  const doSend = (lat: number | null, lng: number | null) => {
    const locationPart = lat !== null && lng !== null
      ? `\n📍 My live location: https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`
      : '\n📍 Location unavailable — please call me immediately.'

    const message =
      `🚨 EMERGENCY ALERT 🚨\n` +
      `I need immediate help! This is an emergency.\n` +
      `Sent via Safique Safety App.` +
      locationPart

    const url = `https://wa.me/${e164.replace('+', '')}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => doSend(pos.coords.latitude, pos.coords.longitude),
      ()    => doSend(null, null),
      { timeout: 5000, maximumAge: 30000 }
    )
  } else {
    doSend(null, null)
  }
}

/* ─── Chat / message SVG icon ───────────────────────────── */
function MessageIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

/* ─── Tooltip wrapper ────────────────────────────────────── */
function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
              transform: 'translateX(-50%)', background: '#0F0F23',
              color: 'white', fontSize: 11, fontWeight: 600,
              padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap',
              pointerEvents: 'none', zIndex: 100,
              boxShadow: '0 4px 12px rgba(15,15,35,0.25)',
            }}
          >
            {label}
            {/* Arrow */}
            <div style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #0F0F23',
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Message Modal ──────────────────────────────────────── */
function MessageModal({ target, onClose }: { target: MessageTarget; onClose: () => void }) {
  const [msgText, setMsgText] = useState(target.prefill ?? '')
  const [sent, setSent]       = useState(false)
  const textareaRef           = useRef<HTMLTextAreaElement>(null)
  const { contact }           = target
  const meta                  = getMeta(contact.relation)

  /* focus textarea on open */
  useEffect(() => { textareaRef.current?.focus() }, [])

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSend = () => {
    if (!msgText.trim()) return
    if (isMobileDevice()) {
      /* On mobile — open native SMS app */
      const smsUrl = `sms:${contact.phone}${/iPhone|iPad/i.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(msgText)}`
      window.open(smsUrl, '_self')
      onClose()
      return
    }
    /* Desktop — simulate sending */
    setSent(true)
    setTimeout(onClose, 1800)
  }

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,15,35,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      aria-modal="true"
      role="dialog"
      aria-label={`Send message to ${contact.name}`}
    >
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        style={{
          background: 'white', borderRadius: 24, width: '100%', maxWidth: 480,
          boxShadow: '0 24px 64px rgba(15,15,35,0.18), 0 4px 16px rgba(15,15,35,0.08)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1.5px solid #EAEDF5',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: meta.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${meta.color}30`,
          }}>
            <span style={{ color: 'white', fontSize: 15, fontWeight: 800 }}>
              {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0F0F23', marginBottom: 2 }}>{contact.name}</p>
            <p style={{ fontSize: 13, color: '#7A7A95', fontWeight: 500 }}>{contact.phone}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close message dialog"
            style={{
              width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#F4F6FB', color: '#7A7A95',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#EAEDF5')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F4F6FB')}
          >
            <HiX style={{ fontSize: 17 }} />
          </button>
        </div>

        {/* Sent state */}
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ padding: '40px 24px', textAlign: 'center' }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'linear-gradient(135deg, #00C48C, #00A878)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 10px 28px rgba(0,196,140,0.3)',
              }}>
                <HiCheck style={{ color: 'white', fontSize: 30 }} />
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#0F0F23', marginBottom: 6 }}>Message Sent!</p>
              <p style={{ fontSize: 13, color: '#7A7A95', lineHeight: 1.5 }}>
                Your message has been sent to {contact.name}
              </p>
            </motion.div>
          ) : (
            <motion.div key="compose" style={{ padding: '20px 24px 24px' }}>

              {/* Quick templates */}
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 10,
              }}>Quick Templates</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {QUICK_TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => setMsgText(t.text)}
                    style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s', border: 'none', fontFamily: 'inherit',
                      background: msgText === t.text ? '#6C63FF' : '#F0EEFF',
                      color: msgText === t.text ? 'white' : '#6C63FF',
                      boxShadow: msgText === t.text ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="msg-textarea"
                  style={{
                    fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: '#7A7A95', display: 'block', marginBottom: 8,
                  }}
                >
                  Message
                </label>
                <textarea
                  id="msg-textarea"
                  ref={textareaRef}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  rows={4}
                  placeholder="Type your message here or pick a template above…"
                  style={{
                    width: '100%', padding: '13px 15px',
                    background: '#F7F8FC', border: '2px solid #E2E4EE', borderRadius: 14,
                    fontSize: 14, color: '#0F0F23', fontFamily: 'inherit', lineHeight: 1.6,
                    resize: 'vertical', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#6C63FF'
                    e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.12)'
                    e.target.style.background = '#FAFAFA'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#E2E4EE'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#F7F8FC'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11.5, color: '#9A9AB0' }}>
                    {isMobileDevice() ? 'Will open SMS app' : 'Desktop: simulates sending'}
                  </span>
                  <span style={{ fontSize: 11.5, color: msgText.length > 140 ? '#FFB800' : '#9A9AB0' }}>
                    {msgText.length} chars
                  </span>
                </div>
              </div>

              {/* Buttons — row 1: Cancel + SMS */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '12px 20px', background: '#F4F6FB', color: '#7A7A95',
                    border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#EAEDF5')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F4F6FB')}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={msgText.trim() ? { y: -1 } : {}}
                  whileTap={msgText.trim() ? { scale: 0.97 } : {}}
                  onClick={handleSend}
                  disabled={!msgText.trim()}
                  aria-label={`Send SMS to ${contact.name}`}
                  style={{
                    flex: 2, padding: '12px 20px', border: 'none', borderRadius: 12,
                    fontSize: 14, fontWeight: 700, cursor: msgText.trim() ? 'pointer' : 'not-allowed',
                    background: msgText.trim()
                      ? 'linear-gradient(135deg, #6C63FF, #5A52D5)'
                      : '#E2E4EE',
                    color: msgText.trim() ? 'white' : '#9A9AB0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: msgText.trim() ? '0 6px 18px rgba(108,99,255,0.3)' : 'none',
                    fontFamily: 'inherit', transition: 'box-shadow 0.18s',
                  }}
                >
                  <MessageIcon size={16} />
                  {isMobileDevice() ? 'Open SMS App' : 'Send Message'}
                </motion.button>
              </div>

              {/* Buttons — row 2: WhatsApp (full width) */}
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 10px 28px rgba(37,211,102,0.40)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { sendWhatsApp(contact.phone, contact.name); onClose() }}
                aria-label={`Send WhatsApp emergency message to ${contact.name}`}
                style={{
                  width: '100%', padding: '13px 20px', border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  background: 'linear-gradient(135deg, #25D366, #1DA851)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 6px 20px rgba(37,211,102,0.30)',
                  transition: 'box-shadow 0.18s',
                }}
              >
                <WhatsAppIcon size={22} />
                Send via WhatsApp
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function EmergencyContacts() {
  const [contacts, setContacts]               = useState<Contact[]>([])
  const [loading, setLoading]                 = useState(true)
  const [showForm, setShowForm]               = useState(false)
  const [form, setForm]                       = useState({ name: '', phone: '', relation: 'Friend' })
  const [editingId, setEditingId]             = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [messageTarget, setMessageTarget]     = useState<MessageTarget | null>(null)
  const [saving, setSaving]                   = useState(false)

  // Load contacts from API on mount
  useEffect(() => {
    contactsApi.getAll()
      .then(({ data }) => {
        const mapped: Contact[] = (data.contacts || []).map((c: any) => ({
          id: c._id,
          name: c.contactName,
          phone: c.contactPhone,
          relation: c.relation,
        }))
        setContacts(mapped)
      })
      .catch(() => {/* silently stay empty */})
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => { setForm({ name: '', phone: '', relation: 'Friend' }); setEditingId(null); setShowForm(true) }
  const openEdit = (c: Contact) => { setForm({ name: c.name, phone: c.phone, relation: c.relation }); setEditingId(c.id); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditingId(null) }

  const saveContact = async () => {
    if (!form.name.trim() || !form.phone.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        const { data } = await contactsApi.update(editingId, {
          contactName: form.name, contactPhone: form.phone, relation: form.relation,
        })
        setContacts(contacts.map(c => c.id === editingId
          ? { id: data.contact._id, name: data.contact.contactName, phone: data.contact.contactPhone, relation: data.contact.relation }
          : c
        ))
      } else {
        if (contacts.length >= MAX_CONTACTS) return
        const { data } = await contactsApi.add({
          contactName: form.name, contactPhone: form.phone, relation: form.relation,
        })
        const nc: Contact = { id: data.contact._id, name: data.contact.contactName, phone: data.contact.contactPhone, relation: data.contact.relation }
        setContacts([...contacts, nc])
      }
      closeForm()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save contact')
    } finally { setSaving(false) }
  }

  const confirmDelete = async (id: string) => {
    try {
      await contactsApi.delete(id)
      setContacts(contacts.filter(c => c.id !== id))
    } catch { alert('Failed to delete contact') }
    setDeleteConfirmId(null)
  }

  return (
    <div className="page-wrapper">

      {/* Message modal */}
      <AnimatePresence>
        {messageTarget && (
          <MessageModal target={messageTarget} onClose={() => setMessageTarget(null)} />
        )}
      </AnimatePresence>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#7A7A95', fontSize: 15 }}>
          Loading contacts…
        </div>
      )}

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#7A7A95', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Safety</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F0F23', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 8 }}>
              Emergency Contacts
            </h1>
            <p style={{ fontSize: 15, color: '#7A7A95', lineHeight: 1.5 }}>
              These contacts are notified instantly when you trigger an SOS alert
            </p>
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            disabled={contacts.length >= MAX_CONTACTS}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
              background: contacts.length >= MAX_CONTACTS ? '#F4F6FB' : 'linear-gradient(135deg, #6C63FF, #5A52D5)',
              color: contacts.length >= MAX_CONTACTS ? '#9A9AB0' : 'white',
              border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: contacts.length >= MAX_CONTACTS ? 'not-allowed' : 'pointer',
              boxShadow: contacts.length >= MAX_CONTACTS ? 'none' : '0 6px 18px rgba(108,99,255,0.3)',
              transition: 'all 0.18s',
            }}
          >
            <HiPlus style={{ fontSize: 18 }} />
            Add Contact
          </motion.button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* ── Left: Contacts list ── */}
        <div>

          {/* Capacity tracker */}
          <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '18px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HiShieldCheck style={{ color: '#6C63FF', fontSize: 20 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F0F23' }}>Contact slots used</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#6C63FF' }}>{contacts.length} / {MAX_CONTACTS}</span>
              </div>
              <div className="progress-bar">
                <motion.div className="progress-fill"
                  animate={{ width: `${(contacts.length / MAX_CONTACTS) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  style={{ background: 'linear-gradient(90deg, #6C63FF80, #6C63FF)' }} />
              </div>
            </div>
          </motion.div>

          {/* Add / Edit form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="card" style={{ padding: 24, borderColor: '#6C63FF30', borderWidth: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F0F23' }}>
                      {editingId ? 'Edit Contact' : 'Add New Contact'}
                    </h3>
                    <button onClick={closeForm} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#F4F6FB', color: '#7A7A95', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HiX style={{ fontSize: 16 }} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', display: 'block', marginBottom: 8 }}>Full Name</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contact name"
                        style={{ width: '100%', padding: '12px 14px', background: '#F7F8FC', border: '2px solid #E2E4EE', borderRadius: 10, fontSize: 14, color: '#0F0F23', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = '#6C63FF')} onBlur={e => (e.target.style.borderColor = '#E2E4EE')} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', display: 'block', marginBottom: 8 }}>Phone Number</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX"
                        style={{ width: '100%', padding: '12px 14px', background: '#F7F8FC', border: '2px solid #E2E4EE', borderRadius: 10, fontSize: 14, color: '#0F0F23', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = '#6C63FF')} onBlur={e => (e.target.style.borderColor = '#E2E4EE')} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', display: 'block', marginBottom: 10 }}>Relation</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {commonRelations.map(r => {
                        const meta = getMeta(r); const isSelected = form.relation === r
                        return (
                          <button key={r} type="button" onClick={() => setForm({ ...form, relation: r })} style={{ padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: '2px solid transparent', background: isSelected ? meta.bg : '#F4F6FB', color: isSelected ? meta.color : '#7A7A95', borderColor: isSelected ? meta.color + '50' : 'transparent' }}>
                            {r}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={closeForm} style={{ flex: 1, padding: '11px 20px', background: '#F4F6FB', color: '#7A7A95', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveContact} disabled={!form.name.trim() || !form.phone.trim() || saving} style={{ flex: 2, padding: '11px 20px', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: (!form.name.trim() || !form.phone.trim()) ? 'not-allowed' : 'pointer', background: (!form.name.trim() || !form.phone.trim()) ? '#E2E4EE' : 'linear-gradient(135deg, #6C63FF, #5A52D5)', color: (!form.name.trim() || !form.phone.trim()) ? '#9A9AB0' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: (!form.name.trim() || !form.phone.trim()) ? 'none' : '0 4px 14px rgba(108,99,255,0.3)' }}>
                      <HiCheck style={{ fontSize: 16 }} />
                      {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Contact'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contact cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence>
              {contacts.map((contact, i) => {
                const meta = getMeta(contact.relation)
                return (
                  <motion.div
                    key={contact.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card" style={{ padding: '20px 24px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Avatar */}
                      <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: meta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${meta.color}30` }}>
                        <span style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F0F23' }}>{contact.name}</p>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: meta.bg, color: meta.color }}>{contact.relation}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#7A7A95', fontWeight: 500 }}>{contact.phone}</p>
                      </div>

                      {/* ── Actions: Call | Message | Edit | Delete ── */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>

                        {/* Call */}
                        <Tooltip label="Call">
                          <a
                            href={`tel:${contact.phone}`}
                            aria-label={`Call ${contact.name}`}
                            style={{ width: 36, height: 36, borderRadius: 10, background: '#EDFBF6', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background 0.15s' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#D0F5EB')}
                            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#EDFBF6')}
                          >
                            <HiPhone style={{ color: '#00A878', fontSize: 16 }} />
                          </a>
                        </Tooltip>

                        {/* Message */}
                        <Tooltip label="Send Message">
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => setMessageTarget({ contact })}
                            aria-label={`Send message to ${contact.name}`}
                            style={{ width: 36, height: 36, borderRadius: 10, background: '#F0EEFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s, box-shadow 0.15s', color: '#6C63FF' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E0DBFF'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(108,99,255,0.22)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0EEFF'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
                          >
                            <MessageIcon size={16} />
                          </motion.button>
                        </Tooltip>

                        {/* WhatsApp */}
                        <Tooltip label="Send via WhatsApp">
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => sendWhatsApp(contact.phone, contact.name)}
                            aria-label={`Send WhatsApp message to ${contact.name}`}
                            style={{ width: 36, height: 36, borderRadius: 10, background: '#E7F9EF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s, box-shadow 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C8F0D8'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(37,211,102,0.28)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E7F9EF'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
                          >
                            <WhatsAppIcon size={20} />
                          </motion.button>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip label="Edit">
                          <button
                            onClick={() => openEdit(contact)}
                            aria-label={`Edit ${contact.name}`}
                            style={{ width: 36, height: 36, borderRadius: 10, background: '#F4F6FB', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#EAEDF5')}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#F4F6FB')}
                          >
                            <HiPencil style={{ color: '#7A7A95', fontSize: 16 }} />
                          </button>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip label="Remove">
                          <button
                            onClick={() => setDeleteConfirmId(contact.id)}
                            aria-label={`Remove ${contact.name}`}
                            style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF0F3', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#FFE0E6')}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#FFF0F3')}
                          >
                            <HiTrash style={{ color: '#E04A6A', fontSize: 16 }} />
                          </button>
                        </Tooltip>

                      </div>
                    </div>

                    {/* Delete confirm inline */}
                    <AnimatePresence>
                      {deleteConfirmId === contact.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                          <div style={{ marginTop: 16, background: '#FFF0F3', border: '1.5px solid rgba(255,90,122,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: 13, color: '#E04A6A', fontWeight: 500 }}>
                              Remove <strong>{contact.name}</strong> from your emergency contacts?
                            </p>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                              <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '6px 16px', background: 'white', border: '1.5px solid #E2E4EE', borderRadius: 8, fontSize: 12, color: '#7A7A95', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                              <button onClick={() => confirmDelete(contact.id)} style={{ padding: '6px 16px', background: '#FF5A7A', border: 'none', borderRadius: 8, fontSize: 12, color: 'white', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {contacts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <HiUserAdd style={{ fontSize: 28, color: '#C0C0D8' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F0F23', marginBottom: 8 }}>No emergency contacts</h3>
              <p style={{ fontSize: 14, color: '#7A7A95', maxWidth: 260, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Add up to {MAX_CONTACTS} trusted contacts who'll be notified when you trigger SOS
              </p>
              <button onClick={openAdd} style={{ padding: '10px 24px', background: 'rgba(108,99,255,0.08)', color: '#6C63FF', border: '1.5px solid rgba(108,99,255,0.2)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Add First Contact
              </button>
            </motion.div>
          )}
        </div>

        {/* ── Right: Info panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

          {/* How SOS works */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 16 }}>
              How SOS Notifications Work
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🆘', title: 'You trigger SOS',    desc: 'Hold button for 3 seconds or use voice command' },
                { icon: '📍', title: 'Location shared',    desc: 'Your exact GPS coordinates are sent instantly'  },
                { icon: '📞', title: 'Contacts alerted',   desc: 'All emergency contacts receive an SMS alert'    },
                { icon: '🚔', title: 'Police notified',    desc: 'Nearest station dispatch receives your location' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F23', marginBottom: 2 }}>{step.title}</p>
                    <p style={{ fontSize: 12, color: '#7A7A95', lineHeight: 1.4 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick message panel */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 14 }}>
              Quick Message All Contacts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_TEMPLATES.map(t => (
                <button
                  key={t.label}
                  disabled={contacts.length === 0}
                  onClick={() => contacts.length > 0 && setMessageTarget({ contact: contacts[0], prefill: t.text })}
                  style={{
                    padding: '10px 14px', background: '#F7F8FC', border: '1.5px solid #EAEDF5',
                    borderRadius: 10, fontSize: 12.5, fontWeight: 500, color: contacts.length === 0 ? '#B0B0C8' : '#0F0F23',
                    cursor: contacts.length === 0 ? 'not-allowed' : 'pointer',
                    textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit', lineHeight: 1.45,
                  }}
                  onMouseEnter={e => { if (contacts.length > 0) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6C63FF'; (e.currentTarget as HTMLButtonElement).style.background = '#F0EEFF' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#EAEDF5'; (e.currentTarget as HTMLButtonElement).style.background = '#F7F8FC' }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6C63FF', display: 'block', marginBottom: 3 }}>{t.label}</span>
                  {t.text}
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div style={{ background: '#FFF8E6', border: '1.5px solid rgba(255,184,0,0.25)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 13, color: '#7A7A95', lineHeight: 1.6 }}>
              Use the <strong style={{ color: '#6C63FF' }}>💬 message button</strong> on any contact to send an emergency SMS. On mobile, it opens your native SMS app.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
