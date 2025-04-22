// /api/scrape/worldcard.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    // ➊ Worldcard JSON API'sini çağırıyoruz
    const { data } = await axios.get(
      "https://www.worldcard.com.tr/api/campaigns",
      {
        params: {
          campaignSectorId: 0,
          campaignTypeId: 0,
          keyword: "",
        },
        headers: { Accept: "application/json" },
      }
    );

    // ➋ Gelen Items dizisini istediğimiz forma çeviriyoruz
    const campaigns = (data.Items || []).map((item) => {
      // Görsel / link tam yol olacak şekilde normalize edelim
      const img =
        item.ImageUrl.startsWith("http")
          ? item.ImageUrl
          : `https://www.worldcard.com.tr${item.ImageUrl}`;
      const link = item.Url;

      return {
        link,
        img,
        title: item.PageTitle,
        endDate: new Date(item.EndDate).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        daysLeft: item.DaysLeft,
      };
    });

    // ➌ Sonucu dönelim
    res.status(200).json(campaigns);
  } catch (err) {
    console.error("Worldcard scrape error:", err);
    res.status(500).json({ error: err.message });
  }
}
