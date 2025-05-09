'use client';

import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface StatsChartProps {
  chartData: Array<{date: string, hero: number, goldenBot: number, heroUsers?: number, goldenBotUsers?: number}>;
}

export default function StatsChart({ chartData }: StatsChartProps) {
  const [activeChart, setActiveChart] = useState<'hero' | 'goldenBot'>('hero');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('day');
  const [filteredChartData, setFilteredChartData] = useState<Array<{date: string, hero: number, goldenBot: number, heroUsers?: number, goldenBotUsers?: number}>>([]);
  const [activeTab, setActiveTab] = useState<'clicks' | 'users'>('clicks');

  // Configuración del gráfico para clics
  const clicksChartConfig: ChartConfig = {
    views: {
      label: "Clics",
    },
    hero: {
      label: "Hero",
      color: "hsl(215, 100%, 50%)", // Azul
    },
    goldenBot: {
      label: "GoldenBot",
      color: "hsl(45, 100%, 50%)", // Dorado
    },
  };

  // Configuración del gráfico para usuarios
  const usersChartConfig: ChartConfig = {
    views: {
      label: "Usuarios",
    },
    hero: {
      label: "Hero",
      color: "hsl(215, 100%, 50%)", // Azul
    },
    goldenBot: {
      label: "GoldenBot",
      color: "hsl(45, 100%, 50%)", // Dorado
    },
  };

  // Función para filtrar datos según el período seleccionado
  const filterChartData = useCallback((period: 'day' | 'week' | 'month') => {
    if (!chartData.length) return;
    
    let filtered = [];
    const now = new Date();
    
    switch (period) {
      case 'day':
        // Mostrar los últimos 7 días (como ya está)
        filtered = [...chartData];
        break;
      
      case 'week':
        // Agrupar por semana (últimas 4 semanas)
        const weeklyData = [];
        for (let i = 3; i >= 0; i--) {
          // Calcular fecha de inicio de la semana (i semanas atrás)
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (7 * i + 6));
          const weekLabel = `Sem ${i+1}`;
          
          // Sumar todos los clicks de la semana
          let heroSum = 0;
          let goldenBotSum = 0;
          let heroUsersSum = 0;
          let goldenBotUsersSum = 0;
          
          chartData.forEach(day => {
            const dayDate = new Date(day.date);
            const diffTime = Math.abs(dayDate.getTime() - weekStart.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 7) {
              heroSum += day.hero;
              goldenBotSum += day.goldenBot;
              heroUsersSum += day.heroUsers || 0;
              goldenBotUsersSum += day.goldenBotUsers || 0;
            }
          });
          
          weeklyData.push({
            date: weekLabel,
            hero: heroSum,
            goldenBot: goldenBotSum,
            heroUsers: heroUsersSum,
            goldenBotUsers: goldenBotUsersSum
          });
        }
        filtered = weeklyData;
        break;
      
      case 'month':
        // Agrupar por mes (últimos 3 meses)
        const monthlyData = [];
        for (let i = 2; i >= 0; i--) {
          // Calcular fecha de inicio del mes (i meses atrás)
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = monthStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          
          // Sumar todos los clicks del mes
          let heroSum = 0;
          let goldenBotSum = 0;
          let heroUsersSum = 0;
          let goldenBotUsersSum = 0;
          
          chartData.forEach(day => {
            const dayDate = new Date(day.date);
            if (dayDate.getMonth() === monthStart.getMonth() && 
                dayDate.getFullYear() === monthStart.getFullYear()) {
              heroSum += day.hero;
              goldenBotSum += day.goldenBot;
              heroUsersSum += day.heroUsers || 0;
              goldenBotUsersSum += day.goldenBotUsers || 0;
            }
          });
          
          monthlyData.push({
            date: monthLabel,
            hero: heroSum,
            goldenBot: goldenBotSum,
            heroUsers: heroUsersSum,
            goldenBotUsers: goldenBotUsersSum
          });
        }
        filtered = monthlyData;
        break;
    }
    
    setFilteredChartData(filtered);
  }, [chartData]);

  // Efecto para filtrar datos cuando cambia el período
  useEffect(() => {
    filterChartData(timeFilter);
  }, [timeFilter, filterChartData]);

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Estadísticas de Bots</CardTitle>
          <CardDescription>
            Comparativa entre Hero y GoldenBot
          </CardDescription>
        </div>
        <div className="flex">
          {["hero", "goldenBot"].map((key) => {
            const chart = key as keyof typeof clicksChartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart as 'hero' | 'goldenBot')}
              >
                <span className="text-xs text-muted-foreground">
                  {clicksChartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {key === 'hero' 
                    ? activeTab === 'clicks'
                      ? chartData.reduce((acc, curr) => acc + curr.hero, 0).toLocaleString()
                      : chartData.reduce((acc, curr) => acc + (curr.heroUsers || 0), 0).toLocaleString()
                    : activeTab === 'clicks'
                      ? chartData.reduce((acc, curr) => acc + curr.goldenBot, 0).toLocaleString()
                      : chartData.reduce((acc, curr) => acc + (curr.goldenBotUsers || 0), 0).toLocaleString()
                  }
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      
      {/* Pestañas para alternar entre clics y usuarios únicos */}
      <div className="px-6 pt-4 border-b bg-muted/20">
        <div className="flex justify-center mb-2">
          <h3 className="text-lg font-semibold">Tipo de estadística</h3>
        </div>
        
        <Tabs 
          defaultValue="clicks" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value as 'clicks' | 'users')}
        >
          <TabsList className="grid w-full grid-cols-2 mb-2 h-13">
            <TabsTrigger value="clicks" className="text-base py-2">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Clics Totales
              </span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-base py-2">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Usuarios Únicos
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clicks">
            {/* Filtros de tiempo para clics */}
            <div className="pb-2">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setTimeFilter('day')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'day' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Día
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'week' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'month' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>
            
            {/* Gráfico de clics */}
            <CardContent className="px-2 sm:p-6">
              <ChartContainer
                config={clicksChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  data={filteredChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short"
                      });
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[180px]"
                        nameKey="views"
                        labelFormatter={(value: string) => {
                          const date = new Date(value);
                          return isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          });
                        }}
                      />
                    }
                  />
                  <Bar dataKey="hero" fill={clicksChartConfig.hero.color} />
                  <Bar dataKey="goldenBot" fill={clicksChartConfig.goldenBot.color} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="users">
            {/* Filtros de tiempo para usuarios */}
            <div className="pb-2">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setTimeFilter('day')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'day' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Día
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'week' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'month' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>
            
            {/* Gráfico de usuarios */}
            <CardContent className="px-2 sm:p-6">
              <ChartContainer
                config={usersChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  data={filteredChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short"
                      });
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[180px]"
                        nameKey="views"
                        labelFormatter={(value: string) => {
                          const date = new Date(value);
                          return isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          });
                        }}
                      />
                    }
                  />
                  <Bar dataKey="heroUsers" name="hero" fill={usersChartConfig.hero.color} />
                  <Bar dataKey="goldenBotUsers" name="goldenBot" fill={usersChartConfig.goldenBot.color} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
