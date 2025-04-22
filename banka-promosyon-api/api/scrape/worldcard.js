// /api/scrape/worldcard.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const {
      campaignSectorId = 0,
      campaignTypeId   = 0,
      keyword           = ""
    } = req.query;

    const BASE = "https://www.worldcard.com.tr/api/campaigns";
    const PAGE_SIZE = 6;

    let skip = 0;
    const all = [];

    while (true) {
      const { data } = await axios.get(BASE, {
        params: {
          campaignSectorId,
          campaignTypeId,
          keyword,
          skip,
          take: PAGE_SIZE
        }
      });

      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data);
      skip += data.length;
    }

    const formatted = all.map(item => ({
      link:     item.Url.startsWith("http")
                  ? item.Url
                  : `https://www.worldcard.com.tr${item.Url}`,
      img:      item.ImageUrl.startsWith("http")
                  ? item.ImageUrl
                  : `https://www.worldcard.com.tr${item.ImageUrl}`,
      title:    item.PageTitle || item.TitleForAlt,
      endDate:  item.EndDate,
      daysLeft: item.DaysLeft
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Worldcard scrape hata:", err);
    res.status(500).json({ error: err.message });
  }
}
