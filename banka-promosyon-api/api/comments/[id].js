import jwt from 'jsonwebtoken';
import { supabase } from '@/utils/supabase';

async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
}

export default async function handler(req, res) {
  const { id } = req.query; // comment id

  if (req.method === 'PUT') {
    try {
      const decoded = await verifyToken(req);
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: 'Content is required' });
      const { data, error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', id)
        .eq('user_id', decoded.userId)
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const decoded = await verifyToken(req);
      const { data, error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', decoded.userId)
        .single();
      if (error) throw error;
      return res.status(200).json({ message: 'Comment deleted successfully', data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
