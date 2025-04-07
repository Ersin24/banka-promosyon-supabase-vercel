// /api/posts.js
import { supabase } from "../utils/supabase.js";
import { verifyToken, verifyAdmin } from "../utils/auth.js";

export default async function handler(req, res) {
  // --- CORS BAŞLANGIÇ ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // CORS preflight için erken çıkış
  }
  // --- CORS BİTİŞ ---

  const method = req.method;

  if (method === "GET") {
    const { bank, category, search, limit = 10, offset = 0 } = req.query;

    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .order("end_date", { ascending: true });

    if (bank) query = query.ilike("bank_name", `%${bank}%`);
    if (category) query = query.ilike("category", `%${category}%`);
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    query = query.range(
      parseInt(offset),
      parseInt(offset) + parseInt(limit) - 1
    );

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === "POST") {
    const user = await verifyToken(req, res);
    if (!user) return; // verifyToken zaten response döner

    const adminCheck = await verifyAdmin(user.userId);
    if (!adminCheck)
      return res.status(403).json({ error: "Admin yetkisi gerekli" });

    const {
      title,
      content,
      image_url,
      bank_name,
      category,
      start_date,
      end_date,
    } = req.body;
    if (!title || !content || !start_date || !end_date) {
      return res.status(400).json({ error: "Zorunlu alanlar eksik" });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          title,
          content,
          image_url,
          bank_name,
          category,
          start_date,
          end_date,
        },
      ]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
