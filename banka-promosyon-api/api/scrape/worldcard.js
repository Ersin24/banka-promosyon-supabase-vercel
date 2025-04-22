// /api/scrape/worldcard.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    // Worldcard'in sunduğu JSON API'yi doğrudan çağırıyoruz:
    const { data } = await axios.get(
      "https://www.worldcard.com.tr/api/campaigns",
      {
        params: {
          campaignSectorId: 0,
          campaignTypeId: 0,
          keyword: "",
        },
      }
    );

    // data içinde muhtemelen { rc: [ ... ] } var
    const list = data.rc || [];

    const campaigns = list.map((item) => {
      // item.Url, item.ImageUrl, item.PageTitle, item.EndDate, item.DaysLeft
      let link = item.Url || "";
      let img = item.ImageUrl || "";
      // Tam yol değilse başına domain ekle
      if (link && !link.startsWith("http")) {
        link = "https://www.worldcard.com.tr" + link;
      }
      if (img && !img.startsWith("http")) {
        img = "https://www.worldcard.com.tr" + img;
      }
      return {
        link,
        img,
        title: item.PageTitle || item.TitleForAlt || "",
        endDate: item.EndDate,      // "30.04.2025" gibi
        daysLeft: item.DaysLeft,    // "8 Gün Kaldı" gibi
      };
    });

    res.status(200).json(campaigns);
  } catch (err) {
    console.error("Worldcard scrape error:", err);
    res.status(500).json({ error: err.message });
  }
}
