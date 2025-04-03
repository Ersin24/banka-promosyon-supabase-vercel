import bcrypt from 'bcrypt';
import {jwt} from 'jsonwebtoken';
import { supabase } from '@/utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, username } = req.body;
  if (!email || !password || !username)
    return res.status(400).json({ error: "Email, şifre ve kullanıcı adı boş bırakılamaz" });

  // Basit email kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Lütfen geçerli bir e-posta adresi giriniz." });

  try {
    // Check user existence
    let { data: existingUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    if (existingUsers && existingUsers.length > 0)
      return res.status(400).json({ error: "Bu e-posta ile kayıtlı kullanıcı bulunmaktadır." });

    // Check username existence
    let { data: existingUsernames } = await supabase
      .from('usernames')
      .select('*')
      .eq('username', username);
    if (existingUsernames && existingUsernames.length > 0)
      return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılıyor." });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into 'users' table
    let { data: newUser, error: insertUserError } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }])
      .select('*')
      .single();
    if (insertUserError) throw insertUserError;

    // Insert into 'usernames' table
    let { data: newUsername, error: insertUsernameError } = await supabase
      .from('usernames')
      .insert([{ user_id: newUser.id, username }])
      .select('*')
      .single();
    if (insertUsernameError) throw insertUsernameError;

    return res.status(201).json({
      message: "Kullanıcı başarıyla kayıt oldu",
      user: { id: newUser.id, email: newUser.email, username: newUsername.username }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: error.message });
  }
}
