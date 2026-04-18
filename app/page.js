'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const TYPE_LABELS = { note: 'Note', url: 'URL', voice: 'Voice', pdf: 'PDF' }
const TYPE_TAGS = { note: 'tag-note', url: 'tag-url', voice: 'tag-voice', pdf: 'tag-pdf' }

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Home() {
  const [notes, setNotes] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchNotes() }, [])

  async function fetchNotes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/notes', { cache: 'no-store' })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setNotes(data.notes || [])
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function deleteNote(id) {
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setNotes(notes.filter(n => n.id !== id))
  }

  const filtered = notes.filter(n => {
    const matchType = filter === 'all' || n.type === filter
    const matchSearch = n.content.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-title">Second Brain</span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{notes.length} notes</span>
      </div>

      <input
        className="input"
        placeholder="Search your notes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'note', 'url', 'voice', 'pdf'].map(f => (
          <button key={f} className={`btn-ghost ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>Loading your brain...</div>
      )}

      {error && (
        <div style={{ background: '#2a1010', border: '1px solid #a32d2d', borderRadius: 12, padding: '12px 16px', color: '#f09595', fontSize: 13, marginBottom: 12 }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Your brain is empty</div>
          <Link href="/add" style={{ color: 'var(--accent)', fontSize: 14 }}>Add your first note →</Link>
        </div>
      )}

      {filtered.map(note => (
        <div key={note.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span className={`tag ${TYPE_TAGS[note.type] || 'tag-note'}`}>
              {TYPE_LABELS[note.type] || 'Note'}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(note.created_at)}</span>
              <button
                onClick={() => deleteNote(note.id)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
              >×</button>
            </div>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', wordBreak: 'break-word' }}>
            {note.content.length > 200 ? note.content.slice(0, 200) + '...' : note.content}
          </p>
          {note.source_url && (
            <a href={note.source_url} target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, display: 'block', wordBreak: 'break-all' }}>
              {note.source_url}
            </a>
          )}
        </div>
      ))}

      <button onClick={fetchNotes} style={{
        width: '100%', padding: '10px', marginTop: 8,
        background: 'transparent', border: '1px solid var(--border)',
        borderRadius: 12, color: 'var(--muted)', fontSize: 13, cursor: 'pointer'
      }}>
        Refresh notes
      </button>
    </div>
  )
}