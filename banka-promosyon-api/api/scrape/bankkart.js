// /pages/api/scrape/bankkart.js

export default async function handler(req, res) {
    try {
      const baseUrl = 'https://www.bankkart.com.tr/api/campaigns';
      const campaigns = [];
  
      let page = 1;
      let keepFetching = true;
  
      while (keepFetching) {
        const response = await fetch(`${baseUrl}?page=${page}`, {
          headers: { 'Accept': 'application/json' }
        });
  
        if (!response.ok) throw new Error(`Sayfa ${page} hata: ${response.status}`);
  
        const data = await response.json();
  
        if (data.length === 0) {
          keepFetching = false;
        } else {
          campaigns.push(...data.map(item => ({
            link: `https://www.bankkart.com.tr${item.Url}`,
            img: item.ImageUrl.startsWith('http')
                  ? item.ImageUrl
                  : `https://www.bankkart.com.tr${item.ImageUrl}`,
            title: item.PageTitle || item.Title || "",
            endDate: item.EndDate ? item.EndDate.split('T')[0] : "",
            daysLeft: item.DaysLeft || ""
          })));
          page++;
        }
      }
  
      res.status(200).json(campaigns);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
  