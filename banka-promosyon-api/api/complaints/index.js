import jwt from 'jsonwebtoken';
import { supabase } from '@/utils/supabase';

async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const decoded = await verifyToken(req);
      const { comment_id, reason } = req.body;
      if (!comment_id || !reason) return res.status(400).json({ error: 'comment_id and reason are required' });
      const { data, error } = await supabase
        .from('complaints')
        .insert([{ comment_id, user_id: decoded.userId, reason }])
        .select('*')
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'GET') {
    // Only admin can fetch all complaints
    try {
      const decoded = await verifyToken(req);
      if (!decoded.isAdmin)
        return res.status(403).json({ error: "Admin privileges required" });
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: "Method not allowed" });
}
