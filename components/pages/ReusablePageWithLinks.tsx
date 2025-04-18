'use client';

import Image, { StaticImageData } from 'next/image';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Particles } from '../magicui/particles';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export interface LinkData {
    href: string;
    logoSrc: StaticImageData | string | {
        src: string;
        width: number;
        height: number;
        blurDataURL?: string;
        blurWidth?: number;
        blurHeight?: number;
    };
    logoAlt: string;
}

interface ReusablePageWithLinksProps {
    businessLogo: StaticImageData; // Logo principal
    logoAlt: string; // Alt del logo principal
    links: LinkData[]; // Lista de enlaces con sus logos
    titleText: string; // Texto del título principal
    subtitleText: string; // Texto del subtítulo
    rounded?: boolean;
    width?: number;
}

export default function ReusablePageWithLinks({
    businessLogo,
    logoAlt,
    links,
    titleText,
    subtitleText,
    rounded = false,
    width = 272
}: ReusablePageWithLinksProps) {
    const { resolvedTheme } = useTheme();
    const [color, setColor] = useState("#ffffff");
    const [isThemeResolved, setIsThemeResolved] = useState(false);
    
    useEffect(() => {
        setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000");
        setIsThemeResolved(true); // Ensure this runs after theme is resolved
    }, [resolvedTheme]); // Depend on resolvedTheme
    
    const handleClick = async (url: string) => {
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
            business: "Hero", // Asumimos que este componente se usa para Hero
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
            
            // Usar el enlace tal como está, sin formatear
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error al enviar clic:", error);
            // Si hay un error, aún así redirigimos al usuario
            window.open(url, '_blank');
        }
    };
    
    return (
        <section className="relative flex flex-col items-center justify-center h-screen">
            <div className='z-10 flex flex-col items-center justify-center h-screen'>
            {/* Logo principal */}
            <div className="mb-4">
                <Image
                    src={businessLogo}
                    width={width}
                    alt={`Logo de ${logoAlt}`}
                    className={rounded ? "rounded-full" : "" }
                />
            </div>

            {/* Títulos */}
            <div className="inline-block max-w-lg text-center justify-center pb-5">
                <AuroraText className='text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl'>{titleText}</AuroraText>
                <br />
                <h2 className='text-xl font-bold tracking-tighter'>{subtitleText}</h2>
            </div>

            {/* Botones con enlaces */}
            {isThemeResolved && links.map((link, index) => {
                // Determinar la fuente de la imagen
                let imageSrc;
                if (typeof link.logoSrc === 'string') {
                    imageSrc = link.logoSrc;
                } else if ('src' in link.logoSrc) {
                    imageSrc = link.logoSrc.src;
                } else {
                    imageSrc = link.logoSrc;
                }
                
                return (
                    <RainbowButton
                        key={index}
                        className={`${index > 0 ? "mt-5 " : " "} p-7 ${resolvedTheme === 'dark' ? 'bg-black' : ''}`}
                        onClick={() => handleClick(link.href)}
                    >
                        <Image
                            src={imageSrc}
                            height={58}
                            width={200}
                            alt={link.logoAlt}
                            className="m-0"
                        />
                    </RainbowButton>
                );
            })}
                
            </div>
            <Particles
                className="absolute inset-0 z-0"
                quantity={150}
                ease={80}
                color={color}
                staticity={30}
                size={2}
                refresh
            />
            
        </section>

    );
}