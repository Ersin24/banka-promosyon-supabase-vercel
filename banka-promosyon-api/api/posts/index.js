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
    // Optional query parameters: bank, category, search, limit, offset
    const { bank, category, search, limit = 10, offset = 0 } = req.query;
    let query = supabase.from('posts').select('*');

    if (bank) query = query.eq('bank_name', bank);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    query = query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Only admin can add new post
    try {
      const decoded = await verifyToken(req);
      if (!decoded.isAdmin) return res.status(403).json({ error: "Admin privileges required" });
      
      const { title, content, image_url, bank_name, category, start_date, end_date } = req.body;
      if (!title || !content || !start_date || !end_date)
        return res.status(400).json({ error: "Title, content, start_date and end_date are required" });
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{ title, content, image_url, bank_name, category, start_date, end_date }])
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
