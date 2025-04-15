import logoGanamos from "../public/logo.png";
import logoApostamos from "../public/logo-apostamos.png";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'GoldenBot',
  description: 'Usa esta Web Cada vez que quieras contactarnos. Aqui siempre estaremos a tu disposición.',
  descriptionPlataform: 'Jugá tranquilo, nosotros te representamos.',
  whatsappNumbers: {
    principalGolden: {
      numero1: 'https://bit.ly/400OAQE',
      numero2: 'https://bit.ly/Goldenbot2'
    },
    descartableHero: {
      numero1: 'https://shorkit.com/3512926515',
      numero2: 'https://shorkit.com/3516300985'
    }
  },
  platforms: [
    {
      href: 'https://Ganamos.biz',
      logoSrc: logoGanamos,
      logoAlt: 'Logo Ganamos'
    },
    {
      href: 'https://Apostamos.co',
      logoSrc: logoApostamos,
      logoAlt: 'Logo Apostamos'
    }
  ]
};
