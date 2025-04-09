'use client';

import Image, { StaticImageData } from 'next/image';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { AuroraText } from '@/components/magicui/aurora-text';
import { IconWhatsapp } from '@/public/icons';

interface ReusablePageProps {
    logoSrc: StaticImageData; // Ruta del logo
    businessName: string; // Nombre a mostrar
    whatsappLink: string; // Enlace de WhatsApp
  rounded?: boolean;
  width?: number;
}

export default function ReusablePage({
  logoSrc,
  businessName,
  whatsappLink,
  rounded = true,
  width = 222
}: ReusablePageProps) {
    const handleClick = async () => {
        const userId = localStorage.getItem("userId") || crypto.randomUUID();
        localStorage.setItem("userId", userId);

        const body = JSON.stringify({
            userId: userId,
            business: businessName,
        });

        console.log("Body enviado:", body);

        try {
            const response = await fetch("/api/clicks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: body,
      });
      
            if (!response.ok) {
                throw new Error("Error en la solicitud al backend");
            }

            const data = await response.json();
            console.log("Estadísticas actualizadas:", data);
    } catch (error) {
            console.error("Error al enviar clic:", error);
    }
  };

  return (
        <section className="flex flex-col items-center justify-center h-screen">
            <div className="mb-4">
        <Image 
          src={logoSrc} 
                    height={222}
                    alt={`Logo de ${businessName}`}
                    className={rounded ? "rounded-full" : ""}
                    width={width}
        />
      </div>
            <div className="inline-block max-w-lg text-center justify-center pb-5">
                <h1 className='text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl' >Bienvenido a&nbsp;</h1>
                <AuroraText className='text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl'>{businessName}&nbsp;</AuroraText>
                <br />
                <h1 className='text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl' ></h1>
                <h2 className='text-xl font-bold tracking-tighter' >
                    Jugá tranquilo, nosotros te representamos.
                </h2>
            </div>
      <RainbowButton 
                color="primary"
                onClick={handleClick}
      >
                <IconWhatsapp />
                <a href={whatsappLink}>Hablar por WhatsApp</a>
      </RainbowButton>
        </section>
  );
}