import { embedText } from '@/lib/embed'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Generate embedding for the user's message
    const embedding = await embedText(message)

    // Search similar notes from Supabase
    const { data: results, error } = await supabase.rpc('match_notes', {
      query_embedding: embedding,
      match_count: 5
    })

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Build context from matched notes
    const context =
      results && results.length > 0
        ? results
            .map((r, i) => `[Note ${i + 1}]: ${r.content}`)
            .join('\n\n')
        : 'No relevant notes found.'

    // Prepare Gemini request contents
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `You are a personal AI assistant for a Second Brain app. Answer using ONLY these saved notes:\n\n${context}\n\nQuestion: ${message}`
          }
        ]
      }
    ]

    // ✅ Updated to stable Gemini model
    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

    // Call Gemini API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    })

    const data = await response.json()

    // Handle API errors
    if (!response.ok) {
      return Response.json(
        {
          error: `Gemini API error: ${JSON.stringify(data)}`
        },
        { status: 500 }
      )
    }

    // Extract reply text
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!reply) {
      return Response.json(
        {
          error: `No reply. Raw: ${JSON.stringify(data)}`
        },
        { status: 500 }
      )
    }

    // Return successful response
    return Response.json({
      reply,
      sources: results?.length || 0
    })
  } catch (e) {
    return Response.json(
      { error: e.message },
      { status: 500 }
    )
  }
}