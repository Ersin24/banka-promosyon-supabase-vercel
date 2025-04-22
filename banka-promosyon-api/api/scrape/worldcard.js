// /pages/api/scrape/worldcard.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    // Site’nin arka planda kullandığı endpoint’e istek at
    const { data } = await axios.get(
      "https://www.worldcard.com.tr/api/campaigns?campaignSectorId=0&campaignTypeId=0&keyword="
    );

    // Gelen data.rc dizisi tüm kampanyaları içeriyor
    const campaigns = (data.rc || []).map((item) => {
      // Mutlaka tam URL yapalım
      const link = item.Url.startsWith("http")
        ? item.Url
        : `https://www.worldcard.com.tr${item.Url}`;
      const img = item.ImageUrl.startsWith("http")
        ? item.ImageUrl
        : `https://www.worldcard.com.tr${item.ImageUrl}`;

      return {
        link,
        img,
        title: item.PageTitle,
        endDate: item.EndDate,   // örn. "30.04.2025"
        daysLeft: item.DaysLeft,  // örn. "8 Gün Kaldı"
      };
    });

    res.status(200).json(campaigns);
  } catch (err) {
    console.error("Worldcard scrape hatası:", err);
    res.status(500).json({ error: err.message });
  }
}
