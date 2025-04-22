import chromium from "chrome-aws-lambda";
import {load}  from "cheerio";

export default async function handler(req, res) {
  let browser = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto("https://www.worldcard.com.tr/kampanyalar", { waitUntil: "networkidle2" });

    // "Daha Fazla Göster" kalmayana dek tıkla
    while (await page.$("a.show-more")) {
      await Promise.all([
        page.click("a.show-more"),
        page.waitForTimeout(1000),
      ]);
    }

    const $ = cheerio.load(await page.content());
    const campaigns = [];
    $(".campaign-box .col-lg-4.col-md-6.col-6").each((_, el) => {
      const $el      = $(el);
      let   link     = $el.find("a").attr("href") || "";
      let   img      = $el.find("img").attr("src")  || "";
      const title    = $el.find("p").last().text().trim();
      const endDate  = $el.find(".last-day p").text().replace("Son Gün", "").trim();
      const daysLeft = $el.find(".last-day span").text().trim();

      if (link && !link.startsWith("http")) link = `https://www.worldcard.com.tr${link}`;
      if (img  && !img.startsWith("http"))  img  = `https://www.worldcard.com.tr${img}`;
      campaigns.push({ link, img, title, endDate, daysLeft });
    });

    res.status(200).json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
}
