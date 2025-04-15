import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { siteConfig } from '@/config/site';

// Ruta al archivo de configuración
const configFilePath = path.join(process.cwd(), 'config', 'site.ts');

export async function GET() {
  try {
    // En lugar de intentar parsear el archivo, usamos la configuración importada directamente
    return NextResponse.json(siteConfig);
  } catch (error) {
    console.error('Error al leer la configuración:', error);
    return NextResponse.json({ error: 'Error al leer la configuración' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newConfig = await request.json();
    
    // Leer el archivo de configuración actual
    const configContent = fs.readFileSync(configFilePath, 'utf-8');
    
    // Convertir el objeto de configuración a una cadena formateada
    const configString = JSON.stringify(newConfig, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // Eliminar comillas de las claves
      .replace(/"(https?:\/\/[^"]+)"/g, '"$1"') // Mantener comillas en URLs
      .replace(/"/g, '\''); // Cambiar comillas dobles por simples
    
    // Reemplazar la configuración en el archivo
    const newConfigContent = configContent.replace(
      /export const siteConfig = ({[\s\S]*?});/,
      `export const siteConfig = ${configString};`
    );
    
    // Escribir el nuevo contenido al archivo
    fs.writeFileSync(configFilePath, newConfigContent, 'utf-8');
    
    return NextResponse.json({ success: true, message: 'Configuración actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    // LOG EXTRA: mostrar el error exacto que se enviará al frontend
    if (error instanceof Error) {
      console.error('Mensaje enviado al frontend:', error.message);
    } else {
      console.error('Mensaje enviado al frontend:', String(error));
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
