// /pages/api/scrape/worldcard.js
export default async function handler(req, res) {
    try {
      const baseUrl = 'https://www.worldcard.com.tr/api/campaigns?campaignSectorId=0&campaignTypeId=0&keyword=';
      // 1) İlk sayfayı alıp toplam öğe sayısını (TotalItems) ve sayfa başına düşen öğe adedini bul
      const first = await fetch(baseUrl, {
        headers: { 'Page': '0', 'Accept': 'application/json' }
      });
      if (!first.ok) throw new Error(`API hata: ${first.status}`);
      const { Items: firstItems, TotalItems } = await first.json();
  
      const pageSize = firstItems.length;
      const totalPages = Math.ceil(TotalItems / pageSize);
  
      // 2) 0’dan totalPages‑1’e kadar tüm sayfa indexlerini paralel çek
      const promises = Array.from({ length: totalPages }, (_, i) =>
        fetch(baseUrl, {
          headers: { 'Page': String(i), 'Accept': 'application/json' }
        }).then(r => {
          if (!r.ok) throw new Error(`Sayfa ${i} hata: ${r.status}`);
          return r.json();
        })
      );
      const pages = await Promise.all(promises);
  
      // 3) Tüm Items dizilerini birleştir
      const allItems = pages.flatMap(p => p.Items);
  
      // 4) Sadece ihtiyaç duyduğumuz alanları dön
      const campaigns = allItems.map(item => ({
        link:   item.Url,
        img:    item.ImageUrl.startsWith('http')
                  ? item.ImageUrl
                  : `https://www.worldcard.com.tr${item.ImageUrl}`,
        title:  item.PageTitle,
        endDate:item.EndDate.split('T')[0],
        daysLeft:item.DaysLeft
      }));
  
      res.status(200).json(campaigns);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
  