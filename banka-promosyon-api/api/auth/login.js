import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email ve şifre gerekli." });

  try {
    // Fetch user by email
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(400).json({ error: "Geçersiz kullanıcı" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Geçersiz şifre" });

    // Check if admin from 'admins' table
    let { data: adminData } = await supabase
      .from('admins')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    const isAdmin = adminData ? adminData.is_admin : false;

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, isAdmin },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
}
