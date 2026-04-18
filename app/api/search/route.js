import { supabase } from '@/lib/supabase'
import { embedText } from '@/lib/embed'

export async function POST(request) {
  try {
    const { query } = await request.json()
    if (!query) return Response.json({ error: 'Query is required' }, { status: 400 })

    const embedding = await embedText(query)
    const { data, error } = await supabase.rpc('match_notes', {
      query_embedding: embedding,
      match_count: 5
    })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ results: data })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}