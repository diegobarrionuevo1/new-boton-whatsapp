// Script para actualizar clicks viejos en Redis y agregar el campo 'business'
// Ejecuta este script con: node scripts/fixOldClicks.js

const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Lista de negocios a procesar y sus claves
const businesses = [
  { key: 'Hero', listKey: 'clicks-Hero' },
  { key: 'GoldenBot', listKey: 'clicks-GoldenBot' },
  { key: 'Fichas Ya', listKey: 'clicks-Fichas Ya' },
];

(async () => {
  for (const business of businesses) {
    // Obtener todos los clicks de la lista
    const rawClicks = await redis.lrange(business.listKey, 0, -1);
    const fixedClicks = rawClicks.map(item => {
      try {
        const parsed = JSON.parse(item);
        // Si ya tiene el campo business, dejar igual
        if (parsed.business) return item;
        // Si no, agregar el campo
        return JSON.stringify({ ...parsed, business: business.key });
      } catch {
        // Si hay error de parseo, dejar igual
        return item;
      }
    });
    // Borrar la lista original
    await redis.del(business.listKey);
    // Insertar los clicks corregidos (en el mismo orden)
    if (fixedClicks.length > 0) {
      // Redis LPUSH inserta de derecha a izquierda, así que invertimos el array
      await redis.lpush(business.listKey, ...fixedClicks.reverse());
    }
    console.log(`Clicks de ${business.key} corregidos: ${fixedClicks.length}`);
  }
  process.exit(0);
})();
