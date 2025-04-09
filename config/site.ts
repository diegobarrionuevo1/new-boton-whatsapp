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
	name: "GoldenBot",
	description: "Usa esta Web Cada vez que quieras contactarnos. Aqui siempre estaremos a tu disposición.",
	descriptionPlataform: "Juga tranquilo, nosotros te representamos.",
	whatsappNumbers: {
		principalGolden: {numero1 :"https://bit.ly/400OAQE",
			numero2 : "https://bit.ly/Goldenbot2",
		},
		descartableHero: { 
			numero1 :"https://shorkit.com/3512926515",
			numero2 : "https://shorkit.com/3516300985"},
	},
	platforms: links
};
