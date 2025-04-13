// utils/auth.js
import jwt from 'jsonwebtoken';
import { supabase } from './supabase.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET ortam değişkeni tanımlı değil! Güvenlik nedeniyle sunucu başlatılamaz.");
}

export const verifyToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Token gerekli' });
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz token' });
    return null;
  }
};

export const verifyAdmin = async (userId) => {
  const { data } = await supabase
    .from('admins')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle();

  return data?.is_admin || false;
};
