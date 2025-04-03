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
    if (!post_id) return res.status(400).json({ error: 'post_id is required' });
    const { data, error } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('post_id', post_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ likes: data.length });
  }

  if (req.method === 'POST') {
    try {
      const decoded = await verifyToken(req);
      const { post_id } = req.body;
      if (!post_id) return res.status(400).json({ error: 'post_id is required' });
      // Check if like exists
      let { data: existing } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post_id)
        .eq('user_id', decoded.userId);
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Already liked' });
      }
      const { data, error } = await supabase
        .from('likes')
        .insert([{ post_id, user_id: decoded.userId }])
        .select('*')
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const decoded = await verifyToken(req);
      const { post_id } = req.query;
      if (!post_id) return res.status(400).json({ error: 'post_id is required' });
      const { data, error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', post_id)
        .eq('user_id', decoded.userId)
        .single();
      if (error) throw error;
      return res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
