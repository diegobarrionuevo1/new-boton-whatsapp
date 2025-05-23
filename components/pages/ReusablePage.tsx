'use client';

import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
    // Función separada para manejar solo la analítica
    const handleClickAnalytics = async () => {
        // Asegurar que siempre tengamos un userId
        let userId = localStorage.getItem("userId");
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem("userId", userId);
        }

        // Agregar timestamp para evitar duplicados incluso con el mismo userId
        const timestamp = new Date().getTime();
        const uniqueId = `${userId}_${timestamp}`;

        const body = JSON.stringify({
            userId: uniqueId,
            business: businessName,
            timestamp: timestamp
        });

        console.log("Body enviado:", body);

        try {
            const response = await fetch("/api/clicks-redis", {
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
            {typeof whatsappLink === 'string' && whatsappLink.length > 0 ? (
          <Button 
              variant="outline" 
              className="h-auto  px-8 flex items-center gap-3 rounded-xl text-xl font-bold"
              asChild
          >
              <Link 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                      // Registrar el clic sin prevenir la navegación predeterminada
                      // Esto permite que el navegador maneje la navegación normalmente
                      setTimeout(() => {
                          handleClickAnalytics();
                      }, 0);
                  }}
              >
                  <IconWhatsapp className="size-6 fill-green-500" />
                  <span className="font-bold">Hablar por WhatsApp</span>
              </Link>
          </Button>
        ) : (
          <span className="text-red-500 font-semibold block py-4">Enlace de WhatsApp no disponible</span>
        )}
        </section>
    );
}