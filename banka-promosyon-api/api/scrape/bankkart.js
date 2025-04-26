import { load } from "cheerio";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://www.bankkart.com.tr/kampanyalar", { waitUntil: "networkidle2" });

    // Sonsuz Scroll Fonksiyonu
    let previousHeight;
    try {
      while (true) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForTimeout(1500); // yüklenmesi için bekle
        const newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight) break; // Artık yeni içerik yoksa çık
      }
    } catch (err) {
      console.error("Scroll hatası:", err);
    }

    // Şimdi tüm kampanyalar yüklendi
    const $ = load(await page.content());
    const campaigns = [];

    $("section.col-md-3.col-sm-4.col-xs-6").each((_, el) => {
      const $el = $(el);
      let link = $el.find("a.campaign-box").attr("href") || "";
      let img = $el.find("img").attr("src") || "";
      const title = $el.find("h4").first().text().trim();
      const dateText = $el.find(".date").text().trim();

      let endDate = "";
      let daysLeft = "";

      if (dateText.includes("Son Gün")) {
        endDate = dateText.replace("Son Gün", "").trim();
      } else if (dateText.includes("Son")) {
        daysLeft = dateText.trim();
      }

      if (link && !link.startsWith("http"))
        link = `https://www.bankkart.com.tr${link}`;
      if (img && !img.startsWith("http"))
        img = `https://www.bankkart.com.tr${img}`;

      campaigns.push({ link, img, title, endDate, daysLeft });
    });

    res.status(200).json(campaigns);
  } catch (err) {
    console.error("Bankkart Scraper Hatası:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
}
