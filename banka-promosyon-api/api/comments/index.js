import jwt from 'jsonwebtoken';
import { supabase } from '@/utils/supabase';

async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { post_id } = req.query;
    if (!post_id) return res.status(400).json({ error: 'post_id query parameter is required' });
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post_id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    try {
      const decoded = await verifyToken(req);
      const { post_id, content } = req.body;
      if (!post_id || !content)
        return res.status(400).json({ error: 'post_id and content are required' });
      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id, user_id: decoded.userId, content }])
        .select('*')
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
