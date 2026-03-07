'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Search
} from 'lucide-react';

export default function Dashboard() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: 'Auditorías Totales', value: '0', icon: FileText, color: 'text-blue-500' },
    { label: 'Riesgos Detectados', value: '0', icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Sistemas Protegidos', value: '0%', icon: ShieldCheck, color: 'text-green-500' },
  ]);

  async function handleAnalizar() {
    const text = inputText.trim();
    if (!text) {
      setError('Escribe o pega texto para analizar.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el análisis');
      setStats([
        { label: 'Auditorías Totales', value: String(data.auditorias ?? 0), icon: FileText, color: 'text-blue-500' },
        { label: 'Riesgos Detectados', value: String(data.riesgos ?? 0), icon: AlertTriangle, color: 'text-red-500' },
        { label: 'Sistemas Protegidos', value: `${data.sistemasProtegidos ?? 0}%`, icon: ShieldCheck, color: 'text-green-500' },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setInputText('');
    setError(null);
    setStats([
      { label: 'Auditorías Totales', value: '0', icon: FileText, color: 'text-blue-500' },
      { label: 'Riesgos Detectados', value: '0', icon: AlertTriangle, color: 'text-red-500' },
      { label: 'Sistemas Protegidos', value: '0%', icon: ShieldCheck, color: 'text-green-500' },
    ]);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-400">
          <ShieldCheck size={32} />
          <span>TrustLayer IA</span>
        </div>
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 bg-blue-600/10 text-blue-400 p-3 rounded-lg text-left">
            <LayoutDashboard size={20} /> Dashboard
          </button>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <p className="text-slate-400">Hoy es un buen día para auditar con seguridad.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <stat.icon className={stat.color} size={24} />
              <p className="text-slate-400 text-sm mt-4">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search size={20} className="text-blue-400" /> Nueva Auditoría
          </h2>
          <textarea 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 h-32 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Pega tu texto aquí..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-slate-600 hover:bg-slate-500 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Nueva Sesión
            </button>
            <button
              onClick={handleAnalizar}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Analizando...' : 'Analizar con TrustLayer'}
            </button>
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 max-w-2xl">
          "TrustLayer IA es una herramienta de asistencia técnica basada en modelos de lenguaje extenso. El análisis es generado automáticamente por inteligencia artificial y los resultados tienen carácter informativo, por lo que deben ser validados por un profesional de seguridad cualificado antes de tomar cualquier decisión empresarial o técnica. El uso de esta plataforma no constituye asesoramiento legal o de auditoría vinculante. Al utilizar este servicio, el usuario acepta que TrustLayer IA no se hace responsable de las interpretaciones, omisiones o acciones derivadas del uso de la información proporcionada."
          </p>
        </footer>
      </main>
    </div>
  );
}