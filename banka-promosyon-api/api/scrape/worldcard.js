// /api/scrape/worldcard.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      "https://www.worldcard.com.tr/api/campaigns",
      {
        params: {
          campaignSectorId: 0,
          campaignTypeId: 0,
          keyword: "",
        },
        // bazı API'ler JSON bekler, headers eklemek gerekirse buraya eklersin
        // headers: { Accept: "application/json" }
      }
    );

    // ➊ Ham JSON'u dön
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Worldcard API error:", err);
    res.status(500).json({ error: err.message });
  }
}
