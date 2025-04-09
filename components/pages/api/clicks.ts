import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { siteConfig } from "@/config/site";

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
    ],    GoldenBot: [
        siteConfig.whatsappNumbers.principalGolden.numero1,
        siteConfig.whatsappNumbers.principalGolden.numero2
    ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Leer datos persistentes
    const data = readData();

    if (req.method === "GET") {
        const { business } = req.query;

        if (
            !business ||
            typeof business !== "string" ||
            !(business in numbers)
        ) {
            return res.status(400).json({ error: "Negocio no válido" });
        }

        const businessKey = business as BusinessType;
        const businessData = data[businessKey] || { clickCount: 0, uniqueUsers: [] };
        const currentNumber =
            numbers[businessKey][Math.floor(businessData.clickCount / 10) % numbers[businessKey].length];

        return res.status(200).json({
            clickCount: businessData.clickCount,
            uniqueUsers: businessData.uniqueUsers.length,
            currentNumber,
        });
    }

    if (req.method === "POST") {
        const { userId, business } = req.body;

        // Validación de entrada
        if (
            !userId ||
            !business ||
            typeof userId !== "string" ||
            typeof business !== "string" ||
            !(business in numbers)
        ) {
            return res.status(400).json({ error: "Datos inválidos o negocio no válido" });
        }

        const businessKey = business as BusinessType;

        // Obtener datos específicos del negocio
        const businessData = data[businessKey] || { clickCount: 0, uniqueUsers: [] };

        // Verificar usuario único
        if (!businessData.uniqueUsers.includes(userId)) {
            businessData.uniqueUsers.push(userId);
            businessData.clickCount++;
        }

        // Calcular el número actual
        const currentNumber =
            numbers[businessKey][Math.floor(businessData.clickCount / 10) % numbers[businessKey].length];
        businessData.currentNumber = currentNumber;

        // Actualizar los datos globales
        data[businessKey] = businessData;
        writeData(data);

        return res.status(200).json({
            clickCount: businessData.clickCount,
            uniqueUsers: businessData.uniqueUsers.length,
            currentNumber: businessData.currentNumber,
            message: "Número actualizado correctamente",
        });
    }

    return res.status(405).json({ error: "Método no permitido" });
}