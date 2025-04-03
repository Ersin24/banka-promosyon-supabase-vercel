import jwt from 'jsonwebtoken';
import { supabase } from '@/utils/supabase';

async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
}

export async function blockUser(req, res) {
  const { id } = req.query; // user id to block
  try {
    const decoded = await verifyToken(req);
    if (!decoded.isAdmin)
      return res.status(403).json({ error: "Admin privileges required" });
    const { data, error } = await supabase
      .from('users')
      .update({ is_blocked: true })
      .eq('id', id)
      .single();
    if (error) throw error;
    return res.status(200).json({ message: 'User blocked successfully', data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function unblockUser(req, res) {
  const { id } = req.query; // user id to unblock
  try {
    const decoded = await verifyToken(req);
    if (!decoded.isAdmin)
      return res.status(403).json({ error: "Admin privileges required" });
    const { data, error } = await supabase
      .from('users')
      .update({ is_blocked: false })
      .eq('id', id)
      .single();
    if (error) throw error;
    return res.status(200).json({ message: 'User unblocked successfully', data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const action = req.query.action; // "block" or "unblock"
    if (action === 'block') return blockUser(req, res);
    if (action === 'unblock') return unblockUser(req, res);
    return res.status(400).json({ error: "Invalid action" });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
