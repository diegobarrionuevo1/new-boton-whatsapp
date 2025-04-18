import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { siteConfig } from "@/config/site";

// Crear cliente Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

// Tipos permitidos para las claves de numbers
type BusinessType = "Hero" | "GoldenBot";

// Interfaz para los datos de negocio
interface BusinessData {
  clickCount: number;
  uniqueUsers: string[];
  dailyClicks: Record<string, number>;
  currentNumber?: string;
}

// Interfaz para la configuración del sitio
interface SiteConfig {
  whatsappNumbers: {
    descartableHero: {
      numero1: string;
      numero2: string;
    };
    principalGolden: {
      numero1: string;
      numero2: string;
    };
  };
}

// Función para obtener los números de WhatsApp actuales
const getNumbers = async (): Promise<Record<BusinessType, string[]>> => {
    try {
        // Intentar obtener la configuración de Redis
        const config = await redis.get<SiteConfig>("site-config");
        
        // Si hay configuración en Redis, usarla
        if (config && config.whatsappNumbers) {
            return {
                Hero: [
                    config.whatsappNumbers.descartableHero?.numero1 || siteConfig.whatsappNumbers.descartableHero.numero1,
                    config.whatsappNumbers.descartableHero?.numero2 || siteConfig.whatsappNumbers.descartableHero.numero2,
                ],
                GoldenBot: [
                    config.whatsappNumbers.principalGolden?.numero1 || siteConfig.whatsappNumbers.principalGolden.numero1,
                    config.whatsappNumbers.principalGolden?.numero2 || siteConfig.whatsappNumbers.principalGolden.numero2,
                ],
            };
        }
    } catch (error) {
        console.error("Error al obtener números de WhatsApp:", error);
    }
    
    // Usar la configuración por defecto si no hay datos en Redis
    return {
        Hero: [
            siteConfig.whatsappNumbers.descartableHero.numero1,
            siteConfig.whatsappNumbers.descartableHero.numero2,
        ],
        GoldenBot: [
            siteConfig.whatsappNumbers.principalGolden.numero1,
            siteConfig.whatsappNumbers.principalGolden.numero2
        ],
    };
};

export async function GET(request: NextRequest) {
    try {
        // Obtener el parámetro business de la URL
        const { searchParams } = new URL(request.url);
        const business = searchParams.get('business');
        
        // Validar el negocio
        if (!business || !(business === "Hero" || business === "GoldenBot")) {
            return NextResponse.json({ error: "Negocio no válido" }, { status: 400 });
        }
        
        const businessKey = business as BusinessType;
        
        // Obtener números actuales
        const numbers = await getNumbers();
        
        // Obtener datos del negocio desde Redis
        const statsKey = `stats-${businessKey}`;
        const businessData = await redis.get<BusinessData>(statsKey) || { 
            clickCount: 0, 
            uniqueUsers: [], 
            dailyClicks: {} 
        };
        
        // Asegurar que el índice no exceda el número de elementos en el array
        const numberIndex = numbers[businessKey].length > 0 
            ? Math.floor(businessData.clickCount / 10) % numbers[businessKey].length 
            : 0;
        
        // Usar el enlace tal como está, sin formatear
        const currentNumber = numbers[businessKey].length > 0 
            ? numbers[businessKey][numberIndex]
            : "";
        
        // Preparar datos históricos para los últimos 7 días
        const dailyClicksData = businessData.dailyClicks || {};
        const last7Days = [];
        
        // Generar array de los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push({
                date: dateStr,
                clicks: dailyClicksData[dateStr] || 0
            });
        }
        
        return NextResponse.json({
            clickCount: businessData.clickCount || 0,
            uniqueUsers: businessData.uniqueUsers?.length || 0,
            currentNumber,
            dailyClicks: businessData.dailyClicks || {},
            last7Days
        });
    } catch (error) {
        console.error("Error en GET:", error);
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const body = await request.json();
        const { userId, business } = body;
        
        // Validación de entrada
        if (
            !userId ||
            !business ||
            typeof userId !== "string" ||
            typeof business !== "string" ||
            !(business === "Hero" || business === "GoldenBot")
        ) {
            return NextResponse.json({ error: "Datos inválidos o negocio no válido" }, { status: 400 });
        }
        
        const businessKey = business as BusinessType;
        
        // Obtener números actuales
        const numbers = await getNumbers();
        
        // Obtener datos actuales desde Redis
        const statsKey = `stats-${businessKey}`;
        const businessData = await redis.get<BusinessData>(statsKey) || { 
            clickCount: 0, 
            uniqueUsers: [], 
            dailyClicks: {} 
        };
        
        // Obtener la fecha actual en formato YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        
        // Inicializar datos del día si no existen
        if (!businessData.dailyClicks) {
            businessData.dailyClicks = {};
        }
        
        if (!businessData.dailyClicks[today]) {
            businessData.dailyClicks[today] = 0;
        }
        
        // Incrementar siempre el contador de clicks
        businessData.clickCount = (businessData.clickCount || 0) + 1;
        
        // Incrementar el contador de clicks del día
        businessData.dailyClicks[today] = (businessData.dailyClicks[today] || 0) + 1;
        
        // Verificar usuario único (opcional, para estadísticas)
        const baseUserId = userId.split('_')[0]; // Extraer el ID base sin el timestamp
        if (!businessData.uniqueUsers) {
            businessData.uniqueUsers = [];
        }
        if (!businessData.uniqueUsers.includes(baseUserId)) {
            businessData.uniqueUsers.push(baseUserId);
        }
        
        // Asegurarse de que el índice no exceda el número de elementos en el array
        const numberIndex = numbers[businessKey].length > 0 
            ? Math.floor(businessData.clickCount / 10) % numbers[businessKey].length 
            : 0;
        
        // Usar el enlace tal como está, sin formatear
        const currentNumber = numbers[businessKey].length > 0 
            ? numbers[businessKey][numberIndex]
            : "";
        
        businessData.currentNumber = currentNumber;
        
        // Guardar datos actualizados en Redis
        await redis.set(statsKey, businessData);
        
        return NextResponse.json({
            clickCount: businessData.clickCount,
            uniqueUsers: businessData.uniqueUsers.length,
            currentNumber: businessData.currentNumber,
            dailyClicks: businessData.dailyClicks,
            message: "Número actualizado correctamente",
        });
    } catch (error) {
        console.error("Error en POST:", error);
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
    }
}
