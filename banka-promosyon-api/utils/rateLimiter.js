import { RateLimiterMemory } from 'rate-limiter-flexible';

// IP başına dakikada en fazla 5 istek
const rateLimiter = new RateLimiterMemory({
  points: 5, // Toplam izin verilen istek
  duration: 60, // Saniye cinsinden: 1 dakika
});

// Ana fonksiyon
export const checkRateLimit = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    await rateLimiter.consume(ip); // Bu IP’den 1 istek kullan
    return true; // geçebilir
  } catch {
    res.status(429).json({
      error: "Çok fazla deneme yaptınız. Lütfen biraz bekleyin.",
    });
    return false;
  }
};
