'use client'
import { useState, useRef } from 'react'

const TYPES = [
  { id: 'note', label: 'Note', icon: '✏️', placeholder: 'Write anything — thoughts, ideas, learnings...' },
  { id: 'url',  label: 'URL',  icon: '🔗', placeholder: 'Paste a URL and describe what it\'s about...' },
  { id: 'voice',label: 'Voice',icon: '🎙️', placeholder: 'Transcribe or summarise a voice memo...' },
  { id: 'pdf',  label: 'PDF',  icon: '📄', placeholder: 'Paste text from a PDF or describe it...' },
]

export default function AddPage() {
  const [type, setType] = useState('note')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const textRef = useRef()

  const current = TYPES.find(t => t.id === type)

  async function save() {
    if (!content.trim()) return
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          type,
          source_url: url.trim() || null
        })
      })
      const data = await res.json()
      if (data.success) {
        setStatus('saved')
        setContent('')
        setUrl('')
      } else {
        setStatus('error: ' + data.error)
      }
    } catch (e) {
      setStatus('error: ' + e.message)
    }
    setSaving(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-title">Add to Brain</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TYPES.map(t => (
          <button key={t.id} className={`btn-ghost ${type === t.id ? 'active' : ''}`} onClick={() => { setType(t.id); setStatus(null) }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <textarea
        ref={textRef}
        className="input"
        placeholder={current.placeholder}
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={6}
        style={{ resize: 'none', marginBottom: 12, fontFamily: 'inherit' }}
      />

      {type === 'url' && (
        <input
          className="input"
          placeholder="Source URL (optional)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{ marginBottom: 12 }}
        />
      )}

      <button className="btn" onClick={save} disabled={saving || !content.trim()}>
        {saving ? 'Saving to brain...' : `Save ${current.label}`}
      </button>

      {status === 'saved' && (
        <div style={{
          marginTop: 14, padding: '12px 16px', borderRadius: 12,
          background: '#0f2318', border: '1px solid #1D9E75',
          color: '#3da87a', fontSize: 14, textAlign: 'center'
        }}>
          ✓ Saved and embedded into your brain!
        </div>
      )}

      {status && status.startsWith('error') && (
        <div style={{
          marginTop: 14, padding: '12px 16px', borderRadius: 12,
          background: '#2a1010', border: '1px solid #a32d2d',
          color: '#f09595', fontSize: 13
        }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Tips</div>
        {[
          'Be descriptive — more context = better search',
          'Add the URL when saving web articles',
          'You can paste full paragraphs from PDFs',
          'Voice memos: just type what you said'
        ].map((tip, i) => (
          <div key={i} style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--accent)' }}>→</span> {tip}
          </div>
        ))}
      </div>
    </div>
  )
}