export default async function handler(req, res) {
    try {
      const baseUrl = 'https://www.bankkart.com.tr/api/campaigns/list'; // URL değişti
      const campaigns = [];
  
      let page = 1;
      let keepFetching = true;
  
      while (keepFetching) {
        const response = await fetch(`${baseUrl}?page=${page}`, {
          method: 'POST',
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "CampaignType": [],
            "CardType": [],
            "Sector": [],
            "SortType": 1,
            "CampaignFilterType": 1,
            "Language": "tr",
            "Page": page,
            "PageSize": 100
          })
        });
  
        if (!response.ok) throw new Error(`Sayfa ${page} hata: ${response.status}`);
  
        const data = await response.json();
  
        if (!data?.Data?.length) {
          keepFetching = false;
        } else {
          campaigns.push(...data.Data.map(item => ({
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
  