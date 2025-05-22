 import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: "https://tough-pig-12003.upstash.io",
  token: "AS7jAAIjcDExOWUwMGJjYjlmMDQ0NzBiOGFiYTY2ODYxZWRlNzU5YXAxMA",
});

const businessKeys = ['Hero', 'GoldenBot', 'Fichas Ya'];

async function cleanClicksList(business) {
  const key = `clicks-${business}`;
  const rawClicks = await redis.lrange(key, 0, -1);
  let validJSON = [];
  let invalid = 0;

  for (const item of rawClicks) {
    try {
      // Si ya es JSON válido, lo dejamos
      JSON.parse(item);
      validJSON.push(item);
    } catch {
      // Si es un objeto JS plano, lo intentamos convertir a JSON válido
      try {
        // Evalúa el string a objeto JS (¡solo si confías en los datos!)
        // eslint-disable-next-line no-eval
        const obj = eval('(' + item + ')');
        const jsonStr = JSON.stringify(obj);
        validJSON.push(jsonStr);
      } catch {
        invalid++;
      }
    }
  }

  // Borra la lista original
  await redis.del(key);

  // Inserta solo los válidos (en el mismo orden)
  if (validJSON.length > 0) {
    await redis.rpush(key, ...validJSON.reverse());
  }

  console.log(`Limpieza de ${key}: ${validJSON.length} válidos, ${invalid} descartados.`);
}

async function main() {
  for (const business of businessKeys) {
    await cleanClicksList(business);
  }
  console.log('Limpieza terminada.');
}

main();
