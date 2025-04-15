// /api/posts.js
import { supabase } from "../utils/supabase.js";
import { verifyToken, verifyAdmin } from "../utils/auth.js";
import { sanitizeInput } from "../utils/sanitize.js";
import { setCorsHeaders } from "../utils/cors.js";

export default async function handler(req, res) {

  const allowedOrigin = process.env.FRONTEND_ORIGIN.replace(/\/+$/, "");
  setCorsHeaders(res, allowedOrigin);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const method = req.method;

    if (method === "GET") {
      const { bank, category, search, limit = 10, offset = 0 } = req.query;

      // VIEW üzerinden select yapıyoruz.
      let query = supabase
        .from("posts_view")
        .select("*", { count: "exact" });

      // Çoklu banka adı desteği
      if (bank) {
        const bankList = bank.split(",").map((b) => `bank_name.ilike.%${b}%`);
        query = query.or(bankList.join(","));
      }

      // Çoklu kategori desteği
      if (category) {
        const catList = category.split(",").map((c) => `category.ilike.%${c}%`);
        query = query.or(catList.join(","));
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Sıralama:
      // İlk olarak status_order sütununa (0: aktif, 1: süresi dolmuş) göre, sonra
      // aktif postlar kendi içinde remaining_time (kalan süre, saniye cinsinden) değerine göre sıralanır.
      query = query.order("status_order", { ascending: true })
                  .order("remaining_time", { ascending: true });

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

      const cleanTitle = sanitizeInput(title)
      const cleanContent = sanitizeInput(content)
      const cleanImageUrl = sanitizeInput(image_url)
  
      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            title: cleanTitle,
            content: cleanContent,
            image_url: cleanImageUrl,
            bank_name,
            category,
            start_date,
            end_date,
          },
        ]).select();
  
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data[0]);
    }
  
    return res.status(405).json({ error: "Yönteme izin verilmiyor" });
  } catch (error) {
    console.error("API /posts Hatası:", error);
    return res.status(500).json({
      error: "Sunucu hatası. Lütfen tekrar deneyin"
    })
  }
 
}
