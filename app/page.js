'use client'
import { useState, useRef, useEffect } from 'react'

const STARTERS = [
  'What have I saved about AI?',
  'Summarise all my ideas',
  'What did I learn this week?',
  'Find my notes on productivity',
]

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages })
      })
      const data = await res.json()
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.reply || data.error || 'Something went wrong.',
        sources: data.sources
      }])
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error: ' + e.message }])
    }
    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="page-title">Ask your Brain</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Powered by your saved notes</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px' }}>
        {messages.length === 0 && (
          <div>
            <div style={{ textAlign: 'center', padding: '30px 0 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🧠</div>
              <div style={{ fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>Ask anything about your notes</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>I'll search your brain and answer</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '11px 14px', color: 'var(--text)',
                    fontSize: 14, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s'
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            {m.role === 'user' ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div className="bubble-user">{m.content}</div>
              </div>
            ) : (
              <div>
                <div className="bubble-ai">{m.content}</div>
                {m.sources > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, marginLeft: 4 }}>
                    searched {m.sources} notes
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="bubble-ai" style={{ display: 'inline-block' }}>
            <span style={{ color: 'var(--muted)' }}>Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, padding: '10px 16px',
        background: 'var(--bg)', borderTop: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Ask your brain..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              background: 'var(--accent)', border: 'none', borderRadius: 12,
              width: 46, height: 46, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              opacity: loading || !input.trim() ? 0.5 : 1
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}