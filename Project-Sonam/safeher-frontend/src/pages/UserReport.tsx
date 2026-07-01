import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiShieldCheck, HiCheck, HiLocationMarker, HiClock, HiChevronRight, HiPlus, HiFilter } from 'react-icons/hi'
import { reportsApi } from '../services/api'

const reportTypes = [
  { label: 'Harassment',   icon: '🚫', color: '#FF5A7A', bg: '#FFF0F3' },
  { label: 'Dark Area',    icon: '🌑', color: '#6C63FF', bg: '#F0EEFF' },
  { label: 'Suspicious',   icon: '👤', color: '#FFB800', bg: '#FFF8E6' },
  { label: 'Unsafe Zone',  icon: '⚠️', color: '#FF7043', bg: '#FFF4F0' },
  { label: 'No Lighting',  icon: '💡', color: '#E5A600', bg: '#FFFAEB' },
  { label: 'Other',        icon: '📝', color: '#7A7A95', bg: '#F4F6FB' },
]

const severityConfig = [
  { level: 1, label: 'Minor',    color: '#00C48C' },
  { level: 2, label: 'Mild',     color: '#7BC67E' },
  { level: 3, label: 'Moderate', color: '#FFB800' },
  { level: 4, label: 'Serious',  color: '#FF8C42' },
  { level: 5, label: 'Critical', color: '#FF5A7A' },
]

export default function UserReport() {
  const [activeTab, setActiveTab]       = useState<'new' | 'history'>('new')
  const [selectedType, setSelectedType] = useState('')
  const [severity, setSeverity]         = useState(3)
  const [description, setDescription]  = useState('')
  const [submitted, setSubmitted]       = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [apiError, setApiError]         = useState('')
  const [pastReports, setPastReports]   = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Load history when switching to history tab
  const handleTabChange = (tab: 'new' | 'history') => {
    setActiveTab(tab)
    if (tab === 'history' && pastReports.length === 0) {
      setLoadingHistory(true)
      reportsApi.getMyReports()
        .then(({ data }) => setPastReports(data.reports || []))
        .catch(() => {})
        .finally(() => setLoadingHistory(false))
    }
  }

  const currentSeverity = severityConfig[severity - 1]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedType || !description.trim()) return
    setSubmitting(true)
    setApiError('')
    try {
      await reportsApi.add({
        location: 'Current location (GPS)',
        reportType: selectedType as any,
        description,
        severity,
      })
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setSelectedType('')
        setSeverity(3)
        setDescription('')
        // Refresh history
        reportsApi.getMyReports().then(({ data }) => setPastReports(data.reports || [])).catch(() => {})
        setActiveTab('history')
      }, 2500)
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="page-wrapper flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="text-center"
        >
          <div style={{
            width: 88, height: 88, borderRadius: 24,
            background: 'linear-gradient(135deg, #00C48C, #00A878)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 16px 40px rgba(0,196,140,0.3)',
          }}>
            <HiCheck style={{ color: 'white', fontSize: 40 }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F0F23', marginBottom: 8 }}>Report Submitted</h2>
          <p style={{ fontSize: 15, color: '#7A7A95', maxWidth: 300, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Thank you for helping keep the community safer. Our team will review it shortly.
          </p>
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: 0 }}
            transition={{ duration: 2.5, ease: 'linear' }}
            style={{ height: 4, background: '#00C48C', borderRadius: 999, maxWidth: 200, margin: '0 auto' }}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 36 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#7A7A95', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Safety</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F0F23', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 8 }}>
              Report an Incident
            </h1>
            <p style={{ fontSize: 15, color: '#7A7A95', lineHeight: 1.5 }}>
              Help others by flagging unsafe areas and conditions in your community
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: 'white', borderRadius: 10,
              border: '1.5px solid #EAEDF5', fontSize: 13, fontWeight: 600, color: '#7A7A95',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C48C', display: 'inline-block' }} />
              {pastReports.length} reports filed
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
        {([['new', '+ New Report'], ['history', `History (${pastReports.length})`]] as const).map(([t, label]) => (
          <button key={t} onClick={() => handleTabChange(t)} style={{
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
        {/* ── NEW REPORT ── */}
        {activeTab === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

              {/* Left: Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Incident Type */}
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 20 }}>
                    Incident Type
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {reportTypes.map((type) => {
                      const isSelected = selectedType === type.label
                      return (
                        <button
                          key={type.label}
                          type="button"
                          onClick={() => setSelectedType(type.label)}
                          style={{
                            padding: '18px 12px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.18s',
                            border: `2px solid ${isSelected ? type.color : '#EAEDF5'}`,
                            background: isSelected ? type.bg : 'white',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                            boxShadow: isSelected ? `0 4px 16px ${type.color}25` : 'none',
                          }}
                        >
                          <span style={{ fontSize: 28 }}>{type.icon}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? type.color : '#7A7A95' }}>
                            {type.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 16 }}>
                    Description
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Describe the incident or unsafe condition you observed in detail..."
                    required
                    style={{
                      width: '100%', padding: '14px 16px', background: '#F7F8FC',
                      border: '2px solid #E2E4EE', borderRadius: 12, fontSize: 14,
                      color: '#0F0F23', resize: 'vertical', fontFamily: 'inherit',
                      lineHeight: 1.6, outline: 'none', transition: 'border-color 0.15s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#6C63FF')}
                    onBlur={e => (e.target.style.borderColor = '#E2E4EE')}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#9A9AB0' }}>Be as specific as possible</span>
                    <span style={{ fontSize: 12, color: description.length > 400 ? '#FFB800' : '#9A9AB0' }}>{description.length}/500</span>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 16 }}>
                    Attach Photo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </div>
                  <div style={{
                    border: '2px dashed #E2E4EE', borderRadius: 14, padding: '32px 20px',
                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#6C63FF'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(108,99,255,0.03)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E4EE'; (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0F0F23', marginBottom: 4 }}>Drop photo here or click to upload</p>
                    <p style={{ fontSize: 12, color: '#7A7A95' }}>JPG, PNG up to 5MB</p>
                  </div>
                </div>

              </form>

              {/* Right: Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>

                {/* Location */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95', marginBottom: 16 }}>
                    Location
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                    background: '#F7F8FC', borderRadius: 12, border: '1.5px solid #EAEDF5',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <HiLocationMarker style={{ color: '#6C63FF', fontSize: 18 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F0F23', marginBottom: 3 }}>Current location detected</p>
                      <p style={{ fontSize: 12, color: '#7A7A95', lineHeight: 1.4 }}>Sector 7, Rohini, Delhi<br />28.6° N · 77.2° E</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#00A878', background: '#EDFBF6', padding: '3px 8px', borderRadius: 999 }}>GPS ✓</span>
                  </div>
                </div>

                {/* Severity */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95' }}>
                      Severity Level
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 800, padding: '4px 14px', borderRadius: 999,
                      background: currentSeverity.color, color: 'white',
                    }}>
                      {currentSeverity.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {severityConfig.map((s) => (
                      <button
                        key={s.level}
                        type="button"
                        onClick={() => setSeverity(s.level)}
                        style={{
                          flex: 1, height: 44, borderRadius: 10, border: '2px solid transparent',
                          background: severity === s.level ? s.color : '#F4F6FB',
                          cursor: 'pointer', transition: 'all 0.15s',
                          boxShadow: severity === s.level ? `0 4px 12px ${s.color}40` : 'none',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                        }}
                      >
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: severity === s.level ? 'white' : s.color }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: severity === s.level ? 'white' : '#7A7A95' }}>{s.label}</span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="range" min={1} max={5} step={1} value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    style={{ width: '100%', accentColor: currentSeverity.color }}
                  />
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!selectedType || !description.trim()}
                  style={{
                    width: '100%', padding: '15px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: (!selectedType || !description.trim()) ? '#E2E4EE' : 'linear-gradient(135deg, #6C63FF, #5A52D5)',
                    color: (!selectedType || !description.trim()) ? '#9A9AB0' : 'white',
                    fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: (!selectedType || !description.trim()) ? 'none' : '0 6px 20px rgba(108,99,255,0.35)',
                    transition: 'all 0.18s',
                  }}
                >
                  <HiShieldCheck style={{ fontSize: 18 }} />
                  Submit Report
                </motion.button>

                {!selectedType && (
                  <p style={{ fontSize: 12, color: '#9A9AB0', textAlign: 'center', marginTop: -8 }}>
                    Select an incident type to continue
                  </p>
                )}

              </div>
            </div>
          </motion.div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {pastReports.length === 0 ? (
              <div className="card" style={{ padding: 80, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F0F23', marginBottom: 8 }}>No reports yet</h3>
                <p style={{ fontSize: 14, color: '#7A7A95', marginBottom: 20 }}>Your submitted reports will appear here</p>
                <button onClick={() => setActiveTab('new')} style={{
                  padding: '10px 24px', background: 'rgba(108,99,255,0.08)', color: '#6C63FF',
                  border: '1.5px solid rgba(108,99,255,0.2)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Submit First Report
                </button>
              </div>
            ) : (
              <div>
                {/* Table Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                  padding: '0 20px 12px', gap: 16,
                }}>
                  {['Incident', 'Location', 'Severity', 'Status', 'Date'].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A7A95' }}>{h}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pastReports.map((report, i) => {
                    const sev   = severityConfig[(report.severity ?? 3) - 1] ?? severityConfig[2]
                    const rType = reportTypes.find(r => r.label === (report.reportType ?? report.type))
                    return (
                      <motion.div
                        key={report._id ?? report.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="card card-hover"
                        style={{ padding: '18px 20px' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 16, alignItems: 'center' }}>
                          {/* Incident */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: rType?.bg ?? '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                              {rType?.icon ?? '📝'}
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0F23', marginBottom: 3 }}>{report.reportType ?? report.type}</p>
                              <p style={{ fontSize: 12, color: '#7A7A95', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{report.description}</p>
                            </div>
                          </div>
                          {/* Location */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <HiLocationMarker style={{ color: '#6C63FF', fontSize: 14, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#0F0F23', fontWeight: 500 }}>{report.location}</span>
                          </div>
                          {/* Severity */}
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
                            background: sev.color, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {sev.label}
                          </span>
                          {/* Status */}
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
                            background: report.status === 'resolved' ? '#EDFBF6' : '#FFF8E6',
                            color: report.status === 'resolved' ? '#00A878' : '#E5A600',
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>
                            {report.status === 'resolved' ? '✓ Resolved' : '⏳ Pending'}
                          </span>
                          {/* Date */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <HiClock style={{ color: '#9A9AB0', fontSize: 13 }} />
                            <span style={{ fontSize: 12, color: '#7A7A95' }}>{report.date}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Tip */}
                <div style={{
                  marginTop: 20, display: 'flex', alignItems: 'flex-start', gap: 14,
                  background: '#FFF8E6', border: '1.5px solid rgba(255,184,0,0.2)',
                  borderRadius: 14, padding: '16px 20px',
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
                  <p style={{ fontSize: 13.5, color: '#7A7A95', lineHeight: 1.6 }}>
                    Your reports help improve safety scores for other users. Resolved reports have been reviewed by our safety team.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
