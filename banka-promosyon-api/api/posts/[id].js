// /api/posts/[id].js
import { supabase } from '../../utils/supabase.js';
import { setCorsHeaders } from '../../utils/cors.js';

export default async function handler(req, res) {
  const allowedOrigin = process.env.FRONTEND_ORIGIN.replace(/\/+$/, "");
  setCorsHeaders(res, allowedOrigin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Yönteme izin verilmiyor' });
}
