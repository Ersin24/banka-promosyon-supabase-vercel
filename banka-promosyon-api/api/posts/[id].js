import jwt from 'jsonwebtoken';
import { supabase } from '@/utils/supabase';

async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: "Post not found" });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    try {
      const decoded = await verifyToken(req);
      if (!decoded.isAdmin)
        return res.status(403).json({ error: "Admin privileges required" });
      const { title, content, image_url, bank_name, category } = req.body;
      const { data, error } = await supabase
        .from('posts')
        .update({ title, content, image_url, bank_name, category })
        .eq('id', id)
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
      if (!decoded.isAdmin)
        return res.status(403).json({ error: "Admin privileges required" });
      const { data, error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .single();
      if (error) throw error;
      return res.status(200).json({ message: "Post deleted successfully", data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
