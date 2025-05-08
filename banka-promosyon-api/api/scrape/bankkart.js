// pages/api/kampanyalar.js
import { load } from 'cheerio';

 async function handler(req, res) {
  try {
    const campaigns = [];

    // 1) İlk sayfadaki blokları al
    const pageRes = await fetch('https://www.bankkart.com.tr/kampanyalar', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!pageRes.ok) throw new Error(`Ana sayfa fetch hatası: ${pageRes.status}`);
    const pageHtml = await pageRes.text();
    const $ = load(pageHtml);

    $('a.campaign-box').each((_, el) => {
      const $el      = $(el);
      const href     = $el.attr('href');
      const imgSrc   = $el.find('img').attr('src');
      const title    = $el.find('h4').first().text().trim();
      const dateTxt  = $el.find('.bottom .date').text().trim();

      let endDate = '';
      let daysLeft = '';
      const mDate = dateTxt.match(/(\d{1,2}\.\d{1,2}\.\d{4})/);
      if (mDate) {
        const [g, a, y] = mDate[1].split('.');
        endDate = `${y}-${a.padStart(2,'0')}-${g.padStart(2,'0')}`;
      } else {
        const mDays = dateTxt.match(/Son\s+(\d+)\s+Gün/);
        if (mDays) daysLeft = mDays[1];
      }

      campaigns.push({
        link:     href.startsWith('http') ? href : `https://www.bankkart.com.tr${href}`,
        img:      imgSrc.startsWith('http') ? imgSrc : `https://www.bankkart.com.tr${imgSrc}`,
        title,
        endDate,
        daysLeft
      });
    });

    // 2) Scroll’la gelenleri JSON API’dan çek
    let page = 1;
    while (true) {
      const url = new URL('https://www.bankkart.com.tr/api/Campaigns/GetMoreShow');
      url.searchParams.set('indexNo', page);
      url.searchParams.set('CategoryId', '');
      url.searchParams.set('cuzdan', '');
      url.searchParams.set('arsiv', '');
      url.searchParams.set('type', 'Bireysel');

      const apiRes = await fetch(url.href, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.bankkart.com.tr/kampanyalar',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      // 404 olursa “daha fazla öge yok” demektir
      if (apiRes.status === 404) break;
      if (!apiRes.ok) {
        throw new Error(`API fetch hatası (indexNo=${page}): ${apiRes.status}`);
      }

      const payload = await apiRes.json();
      // Data array’i ya da doğrudan array
      const items = Array.isArray(payload) ? payload : payload.Data;
      if (!items?.length) break;

      items.forEach(item => {
        campaigns.push({
          link:     item.Url.startsWith('http') ? item.Url : `https://www.bankkart.com.tr${item.Url}`,
          img:      item.ImageUrl.startsWith('http') ? item.ImageUrl : `https://www.bankkart.com.tr${item.ImageUrl}`,
          title:    item.PageTitle?.trim() || item.Title?.trim() || '',
          endDate:  item.EndDate ? item.EndDate.split('T')[0] : '',
          daysLeft: item.DaysLeft?.toString() || ''
        });
      });

      page++;
    }

    return res.status(200).json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}


export { handler };
export default handler;
