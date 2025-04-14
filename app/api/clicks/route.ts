import { siteConfig } from "@/config/site";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ruta al archivo JSON para persistencia
const filePath = path.resolve("./data.json");

// Función para leer datos del archivo JSON
const readData = () => {
    // Verificar si el archivo existe, si no, crearlo con un objeto vacío
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
    }
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData);
};

// Función para escribir datos en el archivo JSON
const writeData = (data: object) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Tipos permitidos para las claves de numbers
type BusinessType = "Hero" | "GoldenBot";

// Números de WhatsApp para cada negocio
const numbers: Record<BusinessType, string[]> = {
    Hero: [
        siteConfig.whatsappNumbers.descartableHero.numero1,
        siteConfig.whatsappNumbers.descartableHero.numero2,
    ],
    GoldenBot: [
        siteConfig.whatsappNumbers.principalGolden.numero1,
        siteConfig.whatsappNumbers.principalGolden.numero2
    ],
};

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
    const businessData = data[businessKey] || { clickCount: 0, uniqueUsers: [] };
    
    // Asegurarse de que el índice no exceda el número de elementos en el array
    const numberIndex = numbers[businessKey].length > 0 
        ? Math.floor(businessData.clickCount / 10) % numbers[businessKey].length 
        : 0;
    
    // Usar el enlace tal como está, sin formatear
    const currentNumber = numbers[businessKey].length > 0 
        ? numbers[businessKey][numberIndex]
        : "";

    return NextResponse.json({
        clickCount: businessData.clickCount,
        uniqueUsers: businessData.uniqueUsers?.length || 0,
        currentNumber,
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
            data[businessKey] = { clickCount: 0, uniqueUsers: [] };
        }

        // Obtener datos específicos del negocio
        const businessData = data[businessKey];

        // Verificar usuario único
        if (!businessData.uniqueUsers.includes(userId)) {
            businessData.uniqueUsers.push(userId);
            businessData.clickCount++;
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
            message: "Número actualizado correctamente",
        });
    } catch (error) {
        console.error("Error en el procesamiento de la solicitud:", error);
        return NextResponse.json({ error: "Error en el procesamiento de la solicitud" }, { status: 500 });
    }
}
