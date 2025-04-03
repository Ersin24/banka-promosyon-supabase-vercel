// /api/comment-likes.js
import { supabase } from '../utils/supabase.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey'

export default async function handler(req, res) {
  const { method, body, query, headers } = req
  const token = headers.authorization?.split(' ')[1]
  let userId = null

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      userId = decoded.userId
    } catch {
      return res.status(401).json({ error: 'Geçersiz token' })
    }
  }

  // POST: Yorum beğen
  if (method === 'POST') {
    if (!userId) return res.status(401).json({ error: 'Giriş gerekli' })
    const { comment_id } = body
    if (!comment_id) return res.status(400).json({ error: 'comment_id gerekli' })

    // Daha önce beğenmiş mi kontrol
    const { data: existing, error: checkError } = await supabase
      .from('comment_likes')
      .select('*')
      .eq('comment_id', comment_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError) return res.status(500).json({ error: checkError.message })
    if (existing) return res.status(400).json({ error: 'Zaten beğenilmiş' })

    const { data, error } = await supabase
      .from('comment_likes')
      .insert({ comment_id, user_id: userId })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  // DELETE: Yorum beğenisini kaldır
  if (method === 'DELETE') {
    if (!userId) return res.status(401).json({ error: 'Giriş gerekli' })
    const { comment_id } = query
    if (!comment_id) return res.status(400).json({ error: 'comment_id gerekli' })

    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', comment_id)
      .eq('user_id', userId)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ message: 'Beğeni kaldırıldı' })
  }

  return res.status(405).json({ error: 'Method Not Allowed' })
}
