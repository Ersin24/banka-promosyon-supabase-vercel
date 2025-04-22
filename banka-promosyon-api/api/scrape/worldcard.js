// pages/api/scrape/worldcard.js
import { load } from "cheerio";

export default async function handler(req, res) {
  try {
    // 1) Siteyi fetch ile alıyoruz
    const response = await fetch("https://www.worldcard.com.tr/kampanyalar");
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const html = await response.text();

    // 2) Cheerio ile parse ediyoruz
    const $ = load(html);

    const campaigns = [];

    // 3) Her bir kampanya kartı için:
    $(".campaign-box .col-lg-4.col-md-6.col-6").each((_, el) => {
      const $el = $(el);

      // Link
      const link = $el.find("a").attr("href")?.trim() || "";

      // Resim URL'si
      const img = $el.find("picture img").attr("src")?.trim() || "";

      // Başlık metni (en son <p> etiketi)
      const title = $el.find("> p").last().text().trim();

      // "Son Gün 30.04.2025" kısmındaki tarih
      const endDateText = $el
        .find(".last-day p")
        .text()
        .replace(/Son Gün/i, "")
        .trim();

      // "<span>8 Gün Kaldı</span>"
      const daysLeft = $el.find(".last-day span").text().trim();

      campaigns.push({ link, img, title, endDate: endDateText, daysLeft });
    });

    return res.status(200).json(campaigns);
  } catch (err) {
    console.error("🛠 scrape/worldcard error:", err);
    return res.status(500).json({ error: err.message });
  }
}
