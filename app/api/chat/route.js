import { embedText } from '@/lib/embed'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { message, history } = await request.json()
    if (!message) return Response.json({ error: 'Message is required' }, { status: 400 })

    const embedding = await embedText(message)
    const { data: results, error } = await supabase.rpc('match_notes', {
      query_embedding: embedding,
      match_count: 5
    })
    if (error) return Response.json({ error: error.message }, { status: 500 })

    const context = results && results.length > 0
      ? results.map((r, i) => `[Note ${i + 1}]: ${r.content}`).join('\n\n')
      : 'No relevant notes found.'

    const contents = [
      {
        role: 'user',
        parts: [{ text: `You are a personal AI assistant for a Second Brain app. Answer using ONLY these saved notes:\n\n${context}\n\nQuestion: ${message}` }]
      }
    ]
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${process.env.GEMINI_API_KEY}``

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json({ error: `Gemini API error: ${JSON.stringify(data)}` }, { status: 500 })
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!reply) {
      return Response.json({ error: `No reply. Raw: ${JSON.stringify(data)}` }, { status: 500 })
    }

    return Response.json({ reply, sources: results?.length || 0 })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}