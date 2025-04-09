'use client';

import { useEffect, useState } from "react";
import { StaticImageData } from "next/image";

interface Stats {
    clickCount: number;
    uniqueUsers: number;
    currentNumber: string;
}

interface LinkData {
    href: string;
    logoSrc: StaticImageData;
    logoAlt: string;
}

interface SiteConfigType {
    name: string;
    description: string;
    descriptionPlataform: string;
    whatsappNumbers: {
        principalGolden: {
            numero1: string;
            numero2: string;
        };
        descartableHero: {
            numero1: string;
            numero2: string;
        };
    };
    platforms: LinkData[];
}

export default function StatsPage() {
    const [heroStats, setHeroStats] = useState<Stats | null>(null);
    const [goldenBotStats, setGoldenBotStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<SiteConfigType | null>(null);
    const [configLoading, setConfigLoading] = useState<boolean>(true);
    const [configError, setConfigError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch de Hero
                const heroResponse = await fetch("/api/clicks?business=Hero", {
                    method: "GET",
                });
                const goldenBotResponse = await fetch("/api/clicks?business=GoldenBot", {
                    method: "GET",
                });

                if (!heroResponse.ok || !goldenBotResponse.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }

                const heroData = await heroResponse.json();
                const goldenBotData = await goldenBotResponse.json();

                setHeroStats(heroData);
                setGoldenBotStats(goldenBotData);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setConfigLoading(true);
                const response = await fetch("/api/config", {
                    method: "GET",
                });

                if (!response.ok) {
                    throw new Error("Error al obtener la configuración");
                }

                const configData = await response.json();
                setConfig(configData);
            } catch (err) {
                setConfigError((err as Error).message);
            } finally {
                setConfigLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleConfigChange = (section: string, field: string, value: string) => {
        setConfig((prevConfig) => {
            if (!prevConfig) return null;
            
            const newConfig = { ...prevConfig };
            
            if (section === 'root') {
                // Manejar los campos de nivel raíz de forma individual
                if (field === 'name') {
                    newConfig.name = value;
                } else if (field === 'description') {
                    newConfig.description = value;
                } else if (field === 'descriptionPlataform') {
                    newConfig.descriptionPlataform = value;
                }
            } else if (section === 'whatsappNumbers.principalGolden') {
                if (field === 'numero1' || field === 'numero2') {
                    newConfig.whatsappNumbers.principalGolden[field] = value;
                }
            } else if (section === 'whatsappNumbers.descartableHero') {
                if (field === 'numero1' || field === 'numero2') {
                    newConfig.whatsappNumbers.descartableHero[field] = value;
                }
            }
            
            return newConfig;
        });
    };

    const saveConfig = async () => {
        try {
            const response = await fetch("/api/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                throw new Error("Error al guardar la configuración");
            }

            setSuccessMessage("Configuración actualizada correctamente");
            
            // Ocultar el mensaje después de 3 segundos
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            setConfigError((err as Error).message);
        }
    };

    if (loading || configLoading) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen">Error en estadísticas: {error}</div>;
    }

    if (configError) {
        return <div className="flex items-center justify-center h-screen">Error en configuración: {configError}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
            <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

            {/* Mensaje de éxito */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {successMessage}
                </div>
            )}

            {/* Estadísticas */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Estadísticas Generales</h2>
                
                {/* Estadísticas de Hero */}
                {heroStats && (
                    <div className="mb-8 p-4 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Hero</h3>
                        <p><strong>Total de clics:</strong> {heroStats.clickCount}</p>
                        <p><strong>Usuarios únicos:</strong> {heroStats.uniqueUsers}</p>
                        <p>
                            <strong>Número actual:</strong>{" "}
                            <a
                                href={heroStats.currentNumber}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                {heroStats.currentNumber}
                            </a>
                        </p>
                    </div>
                )}

                {/* Estadísticas de GoldenBot */}
                {goldenBotStats && (
                    <div className="p-4 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">GoldenBot</h3>
                        <p><strong>Total de clics:</strong> {goldenBotStats.clickCount}</p>
                        <p><strong>Usuarios únicos:</strong> {goldenBotStats.uniqueUsers}</p>
                        <p>
                            <strong>Número actual:</strong>{" "}
                            <a
                                href={goldenBotStats.currentNumber}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                {goldenBotStats.currentNumber}
                            </a>
                        </p>
                    </div>
                )}
            </div>

            {/* Configuración del sitio */}
            {config && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Configuración del Sitio</h2>
                    
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium mb-4">Información General</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Sitio
                                </label>
                                <input
                                    type="text"
                                    value={config.name || ""}
                                    onChange={(e) => handleConfigChange('root', 'name', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={config.description || ""}
                                    onChange={(e) => handleConfigChange('root', 'description', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción Plataforma
                                </label>
                                <input
                                    type="text"
                                    value={config.descriptionPlataform || ""}
                                    onChange={(e) => handleConfigChange('root', 'descriptionPlataform', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-medium mb-4">Números de WhatsApp - GoldenBot</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número 1
                                </label>
                                <input
                                    type="text"
                                    value={config.whatsappNumbers?.principalGolden?.numero1 || ""}
                                    onChange={(e) => handleConfigChange('whatsappNumbers.principalGolden', 'numero1', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número 2
                                </label>
                                <input
                                    type="text"
                                    value={config.whatsappNumbers?.principalGolden?.numero2 || ""}
                                    onChange={(e) => handleConfigChange('whatsappNumbers.principalGolden', 'numero2', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-medium mb-4">Números de WhatsApp - Hero</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número 1
                                </label>
                                <input
                                    type="text"
                                    value={config.whatsappNumbers?.descartableHero?.numero1 || ""}
                                    onChange={(e) => handleConfigChange('whatsappNumbers.descartableHero', 'numero1', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número 2
                                </label>
                                <input
                                    type="text"
                                    value={config.whatsappNumbers?.descartableHero?.numero2 || ""}
                                    onChange={(e) => handleConfigChange('whatsappNumbers.descartableHero', 'numero2', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <button
                                onClick={saveConfig}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Guardar Configuración
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}