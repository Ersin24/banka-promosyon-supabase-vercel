// api/posts/[id]
import { supabase } from '../../utils/supabase.js';
import { setCorsHeaders } from '../../utils/cors.js';

async function handler(req, res) {
  const allowedOrigin = process.env.FRONTEND_ORIGIN?.replace(/\/+$/, "") || "*";
  setCorsHeaders(res, allowedOrigin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ ID'yi URL'den parçalayarak al
  const id = req.url.split("/").pop();
  const idNumber = parseInt(id, 10);

  if (isNaN(idNumber)) {
    return res.status(400).json({ error: "Geçersiz ID" });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', idNumber)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Yönteme izin verilmiyor' });
}

export { handler };
export default handler;
