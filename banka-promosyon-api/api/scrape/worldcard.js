// pages/api/scrape/worldcard.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const allCampaigns = [];
    let pageIndex = 0;
    let totalItems = Infinity;
    const pageSize = 50; // istersen burayı 100 de yapabilirsin

    // Sayfalandırma: elimizdeki sayı < toplam öğe sayısı olduğu sürece çekmeye devam et
    while (allCampaigns.length < totalItems) {
      const { data } = await axios.get(
        "https://www.worldcard.com.tr/api/campaigns",
        {
          params: {
            campaignSectorId: 0,
            campaignTypeId: 0,
            keyword: "",
            pageIndex,
            pageSize,
          },
        }
      );

      // API bize her çağrıda bu ikisini döndürüyor
      totalItems = data.TotalItems;
      const items = data.Items;

      // Gelen her maddeyi front-end’imize uygun formatta diziye ekle
      for (const item of items) {
        allCampaigns.push({
          link: item.Url,
          img: item.ImageUrl.startsWith("http")
            ? item.ImageUrl
            : `https://www.worldcard.com.tr${item.ImageUrl}`,
          title: item.PageTitle,
          endDate: item.EndDate.split("T")[0], // “2025-04-30”
          daysLeft: item.DaysLeft,             // “8 Gün Kaldı”
        });
      }

      pageIndex++;
      // Eğer Items.length < pageSize geldiyse zaten son sayfayı aldık, döngü kırılacak
      if (items.length < pageSize) break;
    }

    return res.status(200).json(allCampaigns);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
