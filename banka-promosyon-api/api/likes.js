// /api/likes.js
import { supabase } from "../utils/supabase.js";
import { setCorsHeaders } from "../utils/cors.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET tanımsız!");
}

export default async function handler(req, res) {
  const allowedOrigin = process.env.FRONTEND_ORIGIN.replace(/\/+$/, "");
  setCorsHeaders(res, allowedOrigin);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { method, query, body, headers } = req;
  const token = headers.authorization?.split(" ")[1];
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch {
      return res.status(401).json({ error: "Geçersiz token" });
    }
  }

  // GET: Beğeni sayısı getir
  if (method === "GET") {
    const { post_id } = query;
    if (!post_id) {
      return res.status(400).json({ error: "post_id parametresi gerekli" });
    }

    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post_id);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ likes: count || 0 });
  }

  // POST: Beğeni ekle
  if (method === "POST") {
    if (!userId) return res.status(401).json({ error: "Giriş gerekli" });
    const { post_id } = body;
    if (!post_id) return res.status(400).json({ error: "post_id gerekli" });

    // Zaten beğenmiş mi kontrol
    const { data: existing, error: checkError } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) return res.status(500).json({ error: checkError.message });
    if (existing) return res.status(400).json({ error: "Zaten beğenilmiş" });

    const { data, error } = await supabase
      .from("likes")
      .insert({ post_id, user_id: userId })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  // DELETE: Beğeni kaldır
  if (method === "DELETE") {
    if (!userId) return res.status(401).json({ error: "Giriş gerekli" });
    const { post_id } = query;
    if (!post_id) return res.status(400).json({ error: "post_id gerekli" });

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Beğeni kaldırıldı" });
  }

  return res.status(405).json({ error: "Yönteme izin verilmiyor" });
}
