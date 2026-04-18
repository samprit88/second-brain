import { supabase } from '@/lib/supabase'
import { embedText } from '@/lib/embed'

export async function POST(request) {
  try {
    const { content, type, source_url } = await request.json()
    if (!content) return Response.json({ error: 'Content is required' }, { status: 400 })

    const embedding = await embedText(content)
    const { data, error } = await supabase
      .from('notes')
      .insert({ content, type: type || 'note', source_url, embedding })
      .select()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true, note: data[0] })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('id, content, type, source_url, created_at')
      .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ notes: data })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json()
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}