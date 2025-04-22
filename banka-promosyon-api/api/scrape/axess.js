import axios from "axios";
import { load } from "cheerio";

export default async function handler(req, res) {
  const url = "https://www.axess.com.tr/axess/kampanya/8/3403/chip-para-kampanyalari";

  try {
    const { data: html } = await axios.get(url);
    const $ = load(html); // ✅ cheerio kullanımı burada

    const kampanyalar = [];

    $(".campaign-card").each((_, el) => {
      const title = $(el).find(".campaign-title").text().trim();
      const image = $(el).find("img").attr("src");
      const relativeLink = $(el).find("a").attr("href");
      const fullLink = relativeLink.startsWith("http")
        ? relativeLink
        : `https://www.axess.com.tr${relativeLink}`;

      if (title && fullLink) {
        kampanyalar.push({ title, image, link: fullLink });
      }
    });

    return res.status(200).json(kampanyalar);
  } catch (err) {
    console.error("Scrape Hatası:", err.message);
    return res.status(500).json({ error: "Veriler alınamadı" });
  }
}
