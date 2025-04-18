import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { siteConfig } from "@/config/site";

export async function GET() {
  try {
    // Intentar obtener la configuración de KV
    const config = await kv.get("site-config");
    
    // Si hay configuración en KV, usarla
    if (config) {
      return NextResponse.json(config);
    }
    
    // Si no hay configuración en KV, usar la importada directamente
    return NextResponse.json(siteConfig);
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    return NextResponse.json({ error: 'Error al obtener la configuración' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newConfig = await request.json();
    
    // Guardar la configuración en KV
    await kv.set("site-config", newConfig);
    
    return NextResponse.json({ success: true, message: 'Configuración actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar la configuración' }, { status: 500 });
  }
}
