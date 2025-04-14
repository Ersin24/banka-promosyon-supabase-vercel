// /api/comment-likes.js
import { checkRateLimit } from "../utils/rateLimiter.js";
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

  const { method, body, query, headers } = req;
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

  if (method === "POST") {
    if (!(await checkRateLimit(req, res))) return;
    
    if (!userId) return res.status(401).json({ error: "Giriş gerekli" });
    const { comment_id } = body;
    if (!comment_id)
      return res.status(400).json({ error: "comment_id gerekli" });

    // Daha önce beğenmiş mi kontrol
    const { data: existing, error: checkError } = await supabase
      .from("comment_likes")
      .select("*")
      .eq("comment_id", comment_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) return res.status(500).json({ error: checkError.message });
    if (existing) return res.status(400).json({ error: "Zaten beğenilmiş" });

    const { data, error } = await supabase
      .from("comment_likes")
      .insert({ comment_id, user_id: userId })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (method === "DELETE") {
    if (!userId) return res.status(401).json({ error: "Giriş gerekli" });
    const { comment_id } = query;
    if (!comment_id)
      return res.status(400).json({ error: "comment_id gerekli" });

    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", comment_id)
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Beğeni kaldırıldı" });
  }

  return res.status(405).json({ error: "Yönteme izin verilmiyor" });
}
