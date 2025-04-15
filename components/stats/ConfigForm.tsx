'use client';

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
  platforms: string[];
}

interface ConfigFormProps {
  config: SiteConfigType;
  onConfigChange: (section: string, field: string, value: string) => void;
  onSave: () => void;
  successMessage: string | null;
}

export default function ConfigForm({ config, onConfigChange, onSave, successMessage }: ConfigFormProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Configuración del Sitio</h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

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
              onChange={(e) => onConfigChange('root', 'name', e.target.value)}
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
              onChange={(e) => onConfigChange('root', 'description', e.target.value)}
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
              onChange={(e) => onConfigChange('root', 'descriptionPlataform', e.target.value)}
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
              onChange={(e) => onConfigChange('whatsappNumbers.principalGolden', 'numero1', e.target.value)}
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
              onChange={(e) => onConfigChange('whatsappNumbers.principalGolden', 'numero2', e.target.value)}
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
              onChange={(e) => onConfigChange('whatsappNumbers.descartableHero', 'numero1', e.target.value)}
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
              onChange={(e) => onConfigChange('whatsappNumbers.descartableHero', 'numero2', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
