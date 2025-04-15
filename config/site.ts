import { StaticImageData } from "next/image";
import logoGanamos from "../public/logo.png";
import logoApostamos from "../public/logo-apostamos.png";

export type SiteConfig = typeof siteConfig;
interface LinkData {
	href: string;
	logoSrc: StaticImageData;
	logoAlt: string;
}

const links: LinkData[] = [
	{
		href: "https://Ganamos.biz",
		logoSrc: logoGanamos,
		logoAlt: "Logo Ganamos",
	},
	// {
	// 	href: "https://shorkit.com/553ec7d5",
	// 	logoSrc: logoJugasi,
	// 	logoAlt: "Logo Jugasi",
	// },
	/* {
		href: "https://shorkit.com/f04fb794",
		logoSrc: logoMillonarios,
		logoAlt: "Logo Millonarios",
	}, */
	{
		href: "https://bit.ly/42kdCNj",
		logoSrc: logoApostamos,
		logoAlt: "Logo Apostamos",
	}
];

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
      logoSrc: {
        src: '/server/assets/logo.a320b10b.png',
        width: 184,
        height: 66,
        blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAADCAYAAACuyE5IAAAAbklEQVR42gFjAJz/ACkpKSYsJS83MC0wMyUlJSQpKSknMTExLy8vLysqKionAFJSU1RjT2mOYlxkd1lZWV5dXV1iYmJialVTUVVSUE1TABUVFQ4aGRsTFxYXDRgYGA0VFRUMDg0LDCwkFiYqIRIiKzAT2L2kjLwAAAAASUVORK5CYII=',
        blurWidth: 8,
        blurHeight: 3
      },
      logoAlt: 'Logo Ganamos'
    },
    {
      href: 'https://bit.ly/42kdCNj',
      logoSrc: {
        src: '/server/assets/logo-apostamos.f141d0c6.png',
        width: 1463,
        height: 379,
        blurDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAATUlEQVR42gFCAL3/AEIxMkstLS02Li8vNx4kHzAoKik1LS0sNiokFC8pIQ0vAD84OUkzMzM9NTU1QCAnITY0NTRDNzc1QjYuFz4uJQ01hwcL5LK0SHoAAAAASUVORK5CYII=',
        blurWidth: 8,
        blurHeight: 2
      },
      logoAlt: 'Logo Apostamos'
    }
  ]
};
