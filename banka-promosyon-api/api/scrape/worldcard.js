// /pages/api/scrape/worldcard.js
import fetch from 'node-fetch';
import pLimit from 'p-limit';

async function fetchWithRetry(page, retries = 2) {
  const url = `https://www.worldcard.com.tr/api/campaigns?campaignSectorId=0&campaignTypeId=0&keyword=`;
  const headers = { 'Accept': 'application/json', 'Page': String(page) };
  try {
    const res = await fetch(url, { headers, method: 'GET' });
    if (!res.ok) throw new Error(`Sayfa ${page} HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    if (retries > 0) return fetchWithRetry(page, retries - 1);
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    // 1) İlk sayfayı al, boyutu öğren
    const first = await fetchWithRetry(0);
    const pageSize = first.Items.length;
    const totalPages = Math.ceil(first.TotalItems / pageSize);

    // 2) p-limit ile eşzamanlılığı 5’e indir
    const limit = pLimit(5);
    const pagePromises = Array.from({ length: totalPages }, (_, i) =>
      limit(() => fetchWithRetry(i))
    );

    const pages = await Promise.all(pagePromises);

    // 3) Tüm Items’ı birleştir ve normalize et
    const allItems = pages.flatMap(p => p.Items);
    const campaigns = allItems.map(item => ({
      link:     item.Url,
      img:      item.ImageUrl.startsWith('http')
                  ? item.ImageUrl
                  : `https://www.worldcard.com.tr${item.ImageUrl}`,
      title:    item.PageTitle,
      endDate:  item.EndDate.split('T')[0],
      daysLeft: item.DaysLeft
    }));

    res.status(200).json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
