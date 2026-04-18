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

    const geminiHistory = (history || []).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const systemPrompt = `You are a personal AI assistant for a Second Brain app. Answer questions using ONLY the user's saved notes below. Be conversational and concise. If notes don't contain relevant info, say so honestly.

USER'S RELEVANT NOTES:
${context}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [...geminiHistory, { role: 'user', parts: [{ text: message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    )

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, could not generate a response.'
    return Response.json({ reply, sources: results?.length || 0 })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}