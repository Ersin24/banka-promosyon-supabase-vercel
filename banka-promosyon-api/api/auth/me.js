import jwt from 'jsonwebtoken';
import { supabase } from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    // Get user data from 'users' table
    let { data: user, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('id', decoded.userId)
      .single();
    if (error || !user) return res.status(404).json({ error: "User not found" });

    // Get username from 'usernames' table
    let { data: usernameData } = await supabase
      .from('usernames')
      .select('username')
      .eq('user_id', decoded.userId)
      .single();
    user.username = usernameData ? usernameData.username : null;

    return res.status(200).json(user);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
