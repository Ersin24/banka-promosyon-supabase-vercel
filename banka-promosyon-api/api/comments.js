// /api/comments.js
import { checkRateLimit } from "../utils/rateLimiter.js";
import { sanitizeInput } from "../utils/sanitize.js";
import { supabase } from "../utils/supabase.js";
import { setCorsHeaders } from "../utils/cors.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET tanımsız! .env dosyanı kontrol et.");
}
async function handler(req, res) {
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
      userId = null;
    }
  }

  // GET yorumları getir
  if (method === "GET") {
    const { post_id } = query;
    if (!post_id) {
      return res.status(400).json({ error: "post_id parametresi gerekli" });
    }
  
    const { data, error } = await supabase
      .from("comments")
      .select("*, usernames(username), comment_likes(user_id)")
      .eq("post_id", post_id)
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Yorumlar çekilirken hata:", error);
      return res.status(500).json({ error: error.message });
    }
  
    return res.status(200).json(data);
  }
  

  if (method === "POST") {

    if (!(await checkRateLimit(req, res))) return;

    if (!userId) return res.status(401).json({ error: "Giriş gerekli" });
    const { post_id, content } = body;
    const cleanContent = sanitizeInput(content);
    if (!post_id?.trim() || !content.trim()) {
      return res.status(400).json({ error: "post_id ve content gerekli" });
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id, user_id: userId, content: cleanContent })
      .select("*, usernames(username)")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({
      ...data,
      username: data.usernames?.username || null,
      like_count: 0,
      liked: false,
    });
  }

  // PUT yorum güncelle (sadece sahibi)
  if (method === "PUT") {
    if (!userId) return res.status(401).json({ error: "Giriş gerekli" });

    const { id } = query;
    const { content } = body;
    const cleanContent = sanitizeInput(content)
    if (!id || !content) {
      return res.status(400).json({ error: "id ve content gerekli" });
    }

    // Yorum sahibi kontrolü
    const { data: existing, error: existingError } = await supabase
      .from("comments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (existingError || !existing) {
      return res.status(403).json({ error: "Yorum size ait değil" });
    }

    const { data, error } = await supabase
      .from("comments")
      .update({ content: cleanContent })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json(data);
  }

  // DELETE yorum sil (sadece sahibi)
  if (method === "DELETE") {
    if (!userId) return res.status(401).json({ error: "Giriş gerekli" });

    const { id } = query;
    if (!id) return res.status(400).json({ error: "id parametresi gerekli" });

    // Yorum sahibi mi?
    const { data: existing, error: existingError } = await supabase
      .from("comments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (existingError || !existing) {
      return res.status(403).json({ error: "Yorum size ait değil" });
    }

    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: "Yorum silindi" });
  }

  return res.status(405).json({ error: "Yönteme izin verilmiyor" });
}

export { handler };
export default handler;