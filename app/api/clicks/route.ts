import { siteConfig } from "@/config/site";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ruta al archivo JSON para persistencia
const filePath = path.resolve("./data.json");

// Función para leer datos del archivo JSON
const readData = () => {
    try {
        // Verificar si el archivo existe, si no, crearlo con un objeto vacío
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
        }
        const jsonData = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error al leer datos:", error);
        return {};
    }
};

// Función para escribir datos en el archivo JSON
const writeData = (data: object) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        console.error("Error al escribir datos:", error);
    }
};

// Tipos permitidos para las claves de numbers
type BusinessType = "Hero" | "GoldenBot";

// Números de WhatsApp para cada negocio
const getNumbers = (): Record<BusinessType, string[]> => {
    try {
        // Leer la configuración actual del archivo data.json
        const data = readData();
        const config = data.config || {};
        
        // Si hay configuración en data.json, usarla
        if (config.whatsappNumbers) {
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
    
    // Usar la configuración por defecto si no hay datos en data.json
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

// Obtener los números actuales
const numbers = getNumbers();

export async function GET(request: NextRequest) {
    // Leer datos persistentes
    const data = readData();
    
    // Obtener el parámetro business de la URL
    const { searchParams } = new URL(request.url);
    const business = searchParams.get('business');

    if (
        !business ||
        !(business in numbers)
    ) {
        return NextResponse.json({ error: "Negocio no válido" }, { status: 400 });
    }

    const businessKey = business as BusinessType;
    const businessData = data[businessKey] || { clickCount: 0, uniqueUsers: [], dailyClicks: {} };
    
    // Asegurarse de que el índice no exceda el número de elementos en el array
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
        clickCount: businessData.clickCount,
        uniqueUsers: businessData.uniqueUsers?.length || 0,
        currentNumber,
        dailyClicks: businessData.dailyClicks || {},
        last7Days
    });
}

export async function POST(request: NextRequest) {
    // Leer datos persistentes
    const data = readData();
    
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
            !(business in numbers)
        ) {
            return NextResponse.json({ error: "Datos inválidos o negocio no válido" }, { status: 400 });
        }

        const businessKey = business as BusinessType;

        // Inicializar datos del negocio si no existen
        if (!data[businessKey]) {
            data[businessKey] = { 
                clickCount: 0, 
                uniqueUsers: [],
                dailyClicks: {} 
            };
        }

        // Obtener datos específicos del negocio
        const businessData = data[businessKey];

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
        businessData.clickCount++;
        
        // Incrementar el contador de clicks del día
        businessData.dailyClicks[today]++;
        
        // Verificar usuario único (opcional, para estadísticas)
        const baseUserId = userId.split('_')[0]; // Extraer el ID base sin el timestamp
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

        // Actualizar los datos globales
        data[businessKey] = businessData;
        writeData(data);

        return NextResponse.json({
            clickCount: businessData.clickCount,
            uniqueUsers: businessData.uniqueUsers.length,
            currentNumber: businessData.currentNumber,
            dailyClicks: businessData.dailyClicks,
            message: "Número actualizado correctamente",
        });
    } catch (error) {
        console.error("Error en el procesamiento de la solicitud:", error);
        return NextResponse.json({ error: "Error en el procesamiento de la solicitud" }, { status: 500 });
    }
}
