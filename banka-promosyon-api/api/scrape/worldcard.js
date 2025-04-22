// pages/api/scrape/worldcard.js
export default async function handler(req, res) {
    try {
      let allItems = [];
      let pageIndex = 0;
      let totalItems = Infinity;
      const baseUrl = 'https://www.worldcard.com.tr/api/campaigns?campaignSectorId=0&campaignTypeId=0&keyword=';
  
      while (allItems.length < totalItems) {
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: {
            'Page': String(pageIndex),
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          return res.status(response.status).json({ error: `Worldcard API hata: ${response.status}` });
        }
  
        const data = await response.json();
        totalItems = data.TotalItems;
        allItems.push(...data.Items);
  
        // eğer bir sayfada hiç item yoksa kır
        if (data.Items.length === 0) break;
        pageIndex++;
      }
  
      // Sadece ihtiyaç duyduğumuz alanları dönüyoruz
      const campaigns = allItems.map(item => ({
        link: item.Url,
        img: item.ImageUrl.startsWith('http')
          ? item.ImageUrl
          : `https://www.worldcard.com.tr${item.ImageUrl}`,
        title: item.PageTitle,
        endDate: item.EndDate.split('T')[0],
        daysLeft: item.DaysLeft
      }));
  
      res.status(200).json(campaigns);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
  