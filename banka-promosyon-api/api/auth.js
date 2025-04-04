// File: /api/auth.js

import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { allowCors } from "./_cors";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function handler(req, res) {
  // --- CORS BAŞLANGIÇ ---
  res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

  // --- CORS BİTİŞ ---
  const { method, query, body, headers } = req;

  if (method === "POST") {
    const { type, email, password, username } = body;
    if (type === "register") {
      if (!email || !password || !username) {
        return res.status(400).json({ error: "Eksik alanlar var." });
      }

      // Kullanıcı var mı kontrolü
      const { data: userExist } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (userExist) {
        return res.status(400).json({ error: "Bu e-posta zaten kayıtlı." });
      }

      const { data: usernameExist } = await supabase
        .from("usernames")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (usernameExist) {
        return res
          .status(400)
          .json({ error: "Bu kullanıcı adı kullanılıyor." });
      }

      const { data: createdUser, error } = await supabase.auth.admin.createUser(
        {
          email,
          password,
          email_confirm: true,
        }
      );

      if (error) return res.status(500).json({ error: error.message });

      await supabase
        .from("usernames")
        .insert({ user_id: createdUser.user.id, username });

      return res.status(201).json({ message: "Kayıt başarılı" });
    }

    if (type === "login") {
      const { data: signInData, error: loginError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (loginError) return res.status(401).json({ error: "Geçersiz giriş." });

      const token = jwt.sign(
        { userId: signInData.user.id },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "1h" }
      );

      // Admin kontrolü
      const { data: adminRow } = await supabase
        .from("admins")
        .select("is_admin")
        .eq("id", signInData.user.id)
        .maybeSingle();

      return res.json({ token, isAdmin: adminRow?.is_admin || false });
    }
  }

  if (method === "GET") {
    const authHeader = headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token gerekli" });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
      const { data: user } = await supabase
        .from("users")
        .select("id, email, created_at")
        .eq("id", decoded.userId)
        .maybeSingle();
      const { data: usernameRow } = await supabase
        .from("usernames")
        .select("username")
        .eq("user_id", decoded.userId)
        .maybeSingle();
      return res.json({ ...user, username: usernameRow?.username || null });
    } catch (err) {
      return res.status(401).json({ error: "Token geçersiz" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default allowCors(handler)