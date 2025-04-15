'use client';

interface StatsDisplayProps {
  title: string;
  stats: {
    clickCount: number;
    uniqueUsers: number;
    currentNumber: string;
  };
}

export default function StatsDisplay({ title, stats }: StatsDisplayProps) {
  return (
    <div className="p-4 bg-white shadow rounded-lg mb-4">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p><strong>Total de clics:</strong> {stats.clickCount}</p>
      <p><strong>Usuarios únicos:</strong> {stats.uniqueUsers}</p>
      <p>
        <strong>Número actual:</strong>{" "}
        <a
          href={stats.currentNumber}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {stats.currentNumber}
        </a>
      </p>
    </div>
  );
}
