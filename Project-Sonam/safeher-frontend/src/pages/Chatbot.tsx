import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPaperAirplane, HiX, HiChevronRight } from 'react-icons/hi'

interface Message { id: number; text: string; isBot: boolean; ts: string }

const quickReplies = [
  { label: 'Safety Tips',     icon: '🌟' },
  { label: 'Emergency Guide', icon: '🚨' },
  { label: 'Nearby Police',   icon: '📍' },
  { label: 'Helpline Numbers',icon: '📞' },
  { label: 'Self Defense',    icon: '🥋' },
  { label: 'Night Safety',    icon: '🌙' },
]

const safetyData: Record<string, string> = {
  'safety tips': '🌟 **Top Safety Tips:**\n\n• Share your live location with a trusted contact before traveling\n• Stick to well-lit, crowded roads at night\n• Keep emergency numbers on speed dial\n• Tap SOS immediately if you feel unsafe\n• Trust your instincts — if it feels wrong, leave\n• Keep your phone fully charged while traveling\n• Avoid using earphones on isolated streets\n• Vary your routes to avoid predictable patterns',
  'emergency guide': '🚨 **Emergency Response Guide:**\n\n1. **Stay calm** — take a deep breath\n2. Move to a crowded public area immediately\n3. **Tap the SOS button** in Safique right away\n4. Your location is shared with all your emergency contacts\n5. Dial **112** for police dispatch\n6. Make noise to attract attention around you\n7. Use the **Fake Call** feature to excuse yourself\n8. Try to remember identifying features of any threat',
  'nearby police': '📍 **Nearest Police Stations:**\n\n🚔 City Central Police Station — 0.5 km\n🚔 Women Safety Cell — 1.2 km\n🚔 Traffic Police Post — 0.8 km\n🚔 Police Booth (Market) — 0.3 km\n\n📞 Dial **112** anytime to reach emergency dispatch.',
  'helpline numbers': '📞 **Emergency Helplines:**\n\n🔴 **Women\'s Helpline** → 1091\n🔴 **Police Emergency** → 112\n🔴 **Ambulance** → 108\n🔵 **Anti-Stalking** → 1090\n🔵 **Cyber Crime** → 1930\n🟢 **NCW Helpline** → 7827170170\n🟢 **iCall (Counselling)** → 9152987821',
  'self defense': '🥋 **Self-Defense Basics:**\n\n• Carry a **personal safety alarm** in your bag\n• Aim for vulnerable spots: eyes, nose, throat, groin\n• A **palm-heel strike** to the nose is very effective\n• Use your **elbow** — it\'s the strongest body weapon\n• **Scream loudly** to draw attention\n• Pepper spray is legal in most states — carry it\n• Enrol in a basic self-defense class',
  'night safety': '🌙 **Night Travel Safety:**\n\n• Always inform someone of your route & ETA\n• Use **Safique\'s night mode** for stricter safety scoring\n• Prefer main roads over shortcuts at night\n• Sit near the driver/conductor in public transport\n• Avoid empty compartments in metro or train\n• Have a pre-arranged check-in with a family member\n• If followed, enter a busy shop or public building',
}

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getBotResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase().replace(/[?.!,]/g, '').trim()
  for (const [key, value] of Object.entries(safetyData)) {
    if (key.split(' ').every(w => msg.includes(w)) || msg.includes(key)) return value
  }
  if (/\b(hi|hello|hey|namaste)\b/.test(msg)) {
    return `Hello! 👋 I'm your **AI Safety Assistant**. I'm here to help you stay safe.\n\nAsk me about:\n🌟 Safety Tips  ·  🚨 Emergency Guide  ·  📍 Nearby Police\n📞 Helplines  ·  🥋 Self Defense  ·  🌙 Night Safety`
  }
  if (/thank/.test(msg)) return "You're welcome! 💜 Stay safe and don't hesitate to reach out anytime."
  if (/\b(sos|help|emergency|danger)\b/.test(msg)) {
    return '🚨 **If you are in immediate danger:**\n\n1. Press the red **SOS button** in the app\n2. Call **112** right now\n3. Move toward people and lights\n\nAre you safe right now?'
  }
  return `I didn't quite catch that. I can help with:\n\n🌟 **Safety Tips** · 🚨 **Emergency Guide** · 📍 **Nearby Police**\n📞 **Helpline Numbers** · 🥋 **Self Defense** · 🌙 **Night Safety**\n\nWhat would you like to know?`
}

function MessageBubble({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/)
  return (
    <span style={{ whiteSpace: 'pre-line' }}>
      {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}
    </span>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 16px' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#C0C0D8' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, delay: i * 0.12, repeat: Infinity, repeatDelay: 0.3 }}
        />
      ))}
    </div>
  )
}

let msgId = 100

const SUGGESTED = [
  { label: 'What to do if followed?', icon: '🚶' },
  { label: 'Safe routes at night',    icon: '🌙' },
  { label: 'Emergency contacts help', icon: '📞' },
  { label: 'How to use SOS?',         icon: '🆘' },
]

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      text: `Hello! 👋 I'm your **AI Safety Assistant**.\n\nI'm here to help you stay safe. Ask me anything about safety tips, emergency contacts, self-defense, or helpline numbers.`,
      isBot: true,
      ts: getTime(),
    },
  ])
  const [input, setInput]   = useState('')
  const [typing, setTyping] = useState(false)
  const chatEndRef          = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text?: string) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    const userMsg: Message = { id: msgId++, text: msg, isBot: false, ts: getTime() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const botMsg: Message = { id: msgId++, text: getBotResponse(msg), isBot: true, ts: getTime() }
      setMessages(prev => [...prev, botMsg])
    }, 900 + Math.random() * 500)
  }

  const clearChat = () => {
    setMessages([{ id: msgId++, text: `Chat cleared. How can I help you stay safe today? 💜`, isBot: true, ts: getTime() }])
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '36px 40px 0' }}>

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #9B59B6, #7D3C98)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(155,89,182,0.3)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F0F23', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6 }}>
                AI Safety Assistant
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C48C', display: 'inline-block' }} className="animate-blink" />
                <p style={{ fontSize: 14, color: '#7A7A95' }}>Always online · Ready to help</p>
              </div>
            </div>
          </div>
          <button onClick={clearChat} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px',
            background: 'white', border: '1.5px solid #EAEDF5', borderRadius: 10,
            fontSize: 13, fontWeight: 600, color: '#7A7A95', cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(15,15,35,0.04)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#6C63FF')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#EAEDF5')}
          >
            <HiX style={{ fontSize: 15 }} /> Clear chat
          </button>
        </div>
      </motion.div>

      {/* ── Main area: messages + sidebar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, flex: 1, minHeight: 0, paddingBottom: 36 }}>

        {/* Chat column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: 0 }}>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', background: 'white', borderRadius: '20px 20px 0 0',
            border: '1.5px solid #EAEDF5', borderBottom: 'none', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: 16,
          }} className="no-scrollbar">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', justifyContent: msg.isBot ? 'flex-start' : 'flex-end' }}
              >
                {msg.isBot && (
                  <div style={{
                    width: 32, height: 32, background: 'linear-gradient(135deg, #9B59B6, #7D3C98)',
                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: 10, marginTop: 2, flexShrink: 0, boxShadow: '0 2px 8px rgba(155,89,182,0.25)',
                  }}>
                    <span style={{ color: 'white', fontSize: 10, fontWeight: 800 }}>AI</span>
                  </div>
                )}
                <div style={{ maxWidth: '75%' }}>
                  <div style={{
                    padding: '12px 16px', fontSize: 14, lineHeight: 1.6, borderRadius: 16,
                    borderBottomLeftRadius: msg.isBot ? 4 : 16,
                    borderBottomRightRadius: msg.isBot ? 16 : 4,
                    background: msg.isBot ? '#F7F8FC' : 'linear-gradient(135deg, #6C63FF, #5A52D5)',
                    color: msg.isBot ? '#0F0F23' : 'white',
                    border: msg.isBot ? '1.5px solid #EAEDF5' : 'none',
                    boxShadow: msg.isBot ? '0 1px 3px rgba(15,15,35,0.04)' : '0 4px 14px rgba(108,99,255,0.25)',
                  }}>
                    <MessageBubble text={msg.text} />
                  </div>
                  <p style={{
                    fontSize: 10, color: '#9A9AB0', fontWeight: 500, marginTop: 5,
                    textAlign: msg.isBot ? 'left' : 'right',
                    paddingLeft: msg.isBot ? 4 : 0, paddingRight: msg.isBot ? 0 : 4,
                  }}>
                    {msg.ts}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {typing && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, background: 'linear-gradient(135deg, #9B59B6, #7D3C98)',
                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: 'white', fontSize: 10, fontWeight: 800 }}>AI</span>
                  </div>
                  <div style={{ background: '#F7F8FC', border: '1.5px solid #EAEDF5', borderRadius: 16, borderBottomLeftRadius: 4 }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Quick replies */}
          <div style={{
            padding: '12px 16px', background: 'white',
            borderLeft: '1.5px solid #EAEDF5', borderRight: '1.5px solid #EAEDF5',
            borderTop: '1px solid #F4F6FB',
            display: 'flex', gap: 8, overflowX: 'auto',
          }} className="no-scrollbar">
            {quickReplies.map(qr => (
              <button key={qr.label} onClick={() => sendMessage(qr.label)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                background: '#F7F8FC', border: '1.5px solid #EAEDF5', borderRadius: 999,
                fontSize: 12.5, fontWeight: 600, color: '#7A7A95', whiteSpace: 'nowrap',
                cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6C63FF'; (e.currentTarget as HTMLButtonElement).style.color = '#6C63FF'; (e.currentTarget as HTMLButtonElement).style.background = '#F0EEFF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#EAEDF5'; (e.currentTarget as HTMLButtonElement).style.color = '#7A7A95'; (e.currentTarget as HTMLButtonElement).style.background = '#F7F8FC' }}
              >
                <span>{qr.icon}</span>{qr.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '14px 16px', background: 'white',
            borderRadius: '0 0 20px 20px', border: '1.5px solid #EAEDF5', borderTop: '1px solid #F4F6FB',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#F7F8FC', border: '2px solid #E2E4EE', borderRadius: 14,
              padding: '10px 12px 10px 16px', transition: 'border-color 0.15s',
            }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = '#6C63FF')}
              onBlurCapture={e => (e.currentTarget.style.borderColor = '#E2E4EE')}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask anything about safety..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, color: '#0F0F23', fontFamily: 'inherit',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none',
                  background: input.trim() ? 'linear-gradient(135deg, #6C63FF, #5A52D5)' : '#E2E4EE',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: input.trim() ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
              >
                <HiPaperAirplane style={{ fontSize: 16, transform: 'rotate(90deg)', color: input.trim() ? 'white' : '#9A9AB0' }} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Suggested topics */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 14 }}>
              Suggested Topics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTED.map(s => (
                <button key={s.label} onClick={() => sendMessage(s.label)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: '#F7F8FC', border: '1.5px solid #EAEDF5', borderRadius: 10,
                  fontSize: 13, fontWeight: 500, color: '#0F0F23', cursor: 'pointer', transition: 'all 0.15s',
                  textAlign: 'left', width: '100%',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6C63FF'; (e.currentTarget as HTMLButtonElement).style.background = '#F0EEFF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#EAEDF5'; (e.currentTarget as HTMLButtonElement).style.background = '#F7F8FC' }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <HiChevronRight style={{ color: '#C0C0D8', fontSize: 14, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick emergency numbers */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 14 }}>
              Emergency Numbers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Police', num: '112', color: '#FF5A7A', bg: '#FFF0F3' },
                { label: "Women's Helpline", num: '1091', color: '#6C63FF', bg: '#F0EEFF' },
                { label: 'Ambulance', num: '108', color: '#00A878', bg: '#EDFBF6' },
              ].map(e => (
                <a key={e.label} href={`tel:${e.num}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: e.bg, borderRadius: 10, textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
                  onMouseEnter={el => (el.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={el => (el.currentTarget.style.opacity = '1')}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: e.color }}>{e.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: e.color }}>{e.num}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Privacy note */}
          <div style={{
            background: '#F7F8FC', border: '1.5px solid #EAEDF5', borderRadius: 14, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: 12, color: '#7A7A95', lineHeight: 1.5 }}>
              Your conversations are private. No messages are stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
