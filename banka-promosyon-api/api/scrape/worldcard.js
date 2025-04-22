// /api/scrape/worldcard.js
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { load } from "cheerio";

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

    // Önce temel sayfayı yükle
    await page.goto("https://www.worldcard.com.tr/kampanyalar", {
      waitUntil: "domcontentloaded",
    });
    // İlk 6 kampanyanın yüklenmesini bekle
    await page.waitForSelector(".campaign-box .col-lg-4");

    // Eski sayı ile yeni sayı aynı olana dek “Daha Fazla Göster” butonuna bas
    let prevCount = 0;
    while (true) {
      const items = await page.$$eval(
        ".campaign-box .col-lg-4",
        (els) => els.length
      );
      // Eğer eklenebilecek yeni öğe yoksa döngüyü kır
      if (items === prevCount) break;
      prevCount = items;

      const btn = await page.$("a.show-more");
      if (!btn) break;

      // Buton görünene dek scroll et
      await btn.evaluate((b) => b.scrollIntoView());
      // Hem network isteği gelsin hem DOM değişsin diye Promise.all
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes("/api/campaigns") &&
            r.status() === 200,
          { timeout: 5000 }
        ),
        btn.click(),
      ]);
      // Yeni öğe eklenene dek bekle
      await page.waitForFunction(
        (prev) =>
          document.querySelectorAll(".campaign-box .col-lg-4").length >
          prev,
        {},
        prevCount
      );
    }

    // Son olarak Cheerio ile çek
    const $ = load(await page.content());
    const campaigns = [];
    $(".campaign-box .col-lg-4").each((_, el) => {
      const $el = $(el);
      let link = $el.find("a").attr("href") || "";
      let img = $el.find("img").attr("src") || "";
      const title = $el.find("p").last().text().trim();
      const endDate = $el
        .find(".last-day p")
        .text()
        .replace("Son Gün", "")
        .trim();
      const daysLeft = $el.find(".last-day span").text().trim();

      if (link && !/^https?:\/\//.test(link)) {
        link = `https://www.worldcard.com.tr${link}`;
      }
      if (img && !/^https?:\/\//.test(img)) {
        img = `https://www.worldcard.com.tr${img}`;
      }
      campaigns.push({ link, img, title, endDate, daysLeft });
    });

    return res.status(200).json(campaigns);
  } catch (err) {
    console.error("Worldcard scrape hata:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
}
