// pages/api/scrape/axess.js
import axios from "axios";
const cheerio = require("cheerio");

export default async function handler(req, res) {
  const url = "https://www.axess.com.tr/axess/kampanya/8/3403/chip-para-kampanyalari";

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const kampanyalar = [];

    $(".campaign-card").each((_, el) => {
      const title = $(el).find(".campaign-title").text().trim();
      const image = $(el).find("img").attr("src");
      const relativeLink = $(el).find("a").attr("href");
      const fullLink = relativeLink.startsWith("http")
        ? relativeLink
        : `https://www.axess.com.tr${relativeLink}`;

      if (title && fullLink) {
        kampanyalar.push({
          title,
          image,
          link: fullLink,
        });
      }
    });

    return res.status(200).json({ count: kampanyalar.length, kampanyalar });
  } catch (err) {
    console.error("Axess scraper hatası:", err.message);
    return res.status(500).json({ error: "Veri çekme sırasında hata oluştu" });
  }
}
