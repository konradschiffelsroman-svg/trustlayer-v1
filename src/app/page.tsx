'use client';

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';
import { useSession } from './supabase-session-provider';

type RiskItem = {
  id?: number;
  titulo?: string;
  descripcion?: string;
  criticidad?: string;
  area?: string;
  recomendacion?: string;
};

export default function Dashboard() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analisis, setAnalisis] = useState<string | null>(null);
  const [riesgosDetalle, setRiesgosDetalle] = useState<RiskItem[]>([]);
  const [diagnostico, setDiagnostico] = useState<string | null>(null);
  const [ingresosEnRiesgo, setIngresosEnRiesgo] = useState<string | null>(null);
  const [solucionInmediata, setSolucionInmediata] = useState<string | null>(null);
  const [parcheTecnico, setParcheTecnico] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: 'Auditorías Totales', value: '0', icon: FileText, color: 'text-blue-500' },
    { label: 'Riesgos Detectados', value: '0', icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Sistemas Protegidos', value: '0%', icon: ShieldCheck, color: 'text-green-500' },
  ]);

  const userEmail = session?.user?.email ?? null;
  const role: 'Admin' | 'Cliente' =
    userEmail === 'konradschiffelsroman@gmail.com' ? 'Admin' : 'Cliente';

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [sessionLoading, session, router]);

  async function handleAnalizar() {
    const text = inputText.trim();
    if (!text) {
      setError('Escribe o pega el texto/documento a auditar.');
      return;
    }
    setError(null);
    setAnalisis(null);
    setRiesgosDetalle([]);
    setDiagnostico(null);
    setIngresosEnRiesgo(null);
    setSolucionInmediata(null);
    setParcheTecnico(null);
    setLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userEmail ? { 'x-user-email': userEmail } : {}),
        },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el análisis');

      setStats([
        { label: 'Auditorías Totales', value: String(data.auditorias ?? 0), icon: FileText, color: 'text-blue-500' },
        { label: 'Riesgos Detectados', value: String(data.riesgos ?? 0), icon: AlertTriangle, color: 'text-red-500' },
        { label: 'Sistemas Protegidos', value: `${data.sistemasProtegidos ?? 0}%`, icon: ShieldCheck, color: 'text-green-500' },
      ]);
      setAnalisis(data.analisis ?? null);
      setRiesgosDetalle(Array.isArray(data.riesgosDetalle) ? data.riesgosDetalle : []);
      setDiagnostico(typeof data.diagnostico === 'string' ? data.diagnostico : null);
      setIngresosEnRiesgo(typeof data.ingresos_en_riesgo === 'string' ? data.ingresos_en_riesgo : null);
      setSolucionInmediata(typeof data.solucion_inmediata === 'string' ? data.solucion_inmediata : null);
      setParcheTecnico(typeof data.parche_tecnico === 'string' ? data.parche_tecnico : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setInputText('');
    setError(null);
    setAnalisis(null);
    setRiesgosDetalle([]);
    setDiagnostico(null);
    setIngresosEnRiesgo(null);
    setSolucionInmediata(null);
    setParcheTecnico(null);
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
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <p className="text-slate-400">Hoy es un buen día para auditar con seguridad.</p>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <div className="text-right text-xs text-slate-300">
                <div className="font-medium">{userEmail}</div>
                <div className="text-slate-400">{role === 'Admin' ? 'Rol: Admin' : 'Rol: Cliente'}</div>
              </div>
            )}
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="text-sm px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <Icon className={stat.color} size={24} />
              <p className="text-slate-400 text-sm mt-4">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
            );
          })}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search size={20} className="text-blue-400" /> Nueva Auditoría
          </h2>
          <textarea
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 h-32 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Pega aquí configuraciones, políticas, código o documentación a auditar..."
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

        {analisis && (
          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Resultado del Análisis</h2>
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
              {analisis}
            </div>
          </div>
        )}

        {riesgosDetalle.length > 0 && (
          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-red-400 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-400" />
              Riesgos detectados
            </h2>
            <div className="space-y-4">
              {riesgosDetalle.map((riesgo, index) => (
                <div
                  key={riesgo.id ?? index}
                  className="border border-slate-800 rounded-lg p-4 bg-slate-950/40"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm text-slate-400">
                        {riesgo.area ? `${riesgo.area} · ` : ''}{riesgo.criticidad || 'Criticidad no especificada'}
                      </p>
                      <h3 className="text-lg font-semibold mt-1">
                        {riesgo.titulo || `Riesgo ${index + 1}`}
                      </h3>
                    </div>
                    <span
                      className={
                        'px-2 py-1 text-xs rounded-full border ' +
                        (riesgo.criticidad === 'Alta'
                          ? 'border-red-500 text-red-400'
                          : riesgo.criticidad === 'Media'
                          ? 'border-yellow-500 text-yellow-400'
                          : 'border-slate-500 text-slate-300')
                      }
                    >
                      {riesgo.criticidad || 'Sin nivel'}
                    </span>
                  </div>
                  {riesgo.descripcion && (
                    <p className="mt-3 text-sm text-slate-300">
                      {riesgo.descripcion}
                    </p>
                  )}
                  {riesgo.recomendacion && (
                    <div className="mt-3 text-sm">
                      <span className="font-semibold text-slate-200">Recomendación: </span>
                      <span className="text-slate-300">{riesgo.recomendacion}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(diagnostico || ingresosEnRiesgo || solucionInmediata || parcheTecnico) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagnostico && (
              <div className="bg-slate-900 border border-blue-500 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-2 text-blue-400">🔍 Diagnóstico</h3>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{diagnostico}</p>
              </div>
            )}

            {ingresosEnRiesgo && (
              <div className="bg-slate-900 border border-red-500 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-2 text-red-400">💸 Ingresos en Riesgo</h3>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{ingresosEnRiesgo}</p>
              </div>
            )}

            {solucionInmediata && (
              <div className="bg-slate-900 border border-green-500 rounded-xl p-6 shadow-xl flex flex-col gap-3">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-400">✅ Solución Inmediata</h3>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{solucionInmediata}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (solucionInmediata) {
                        void navigator.clipboard.writeText(solucionInmediata);
                      }
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors"
                  >
                    Copiar frase
                  </button>
                </div>
              </div>
            )}

            {parcheTecnico && (
              <div className="bg-slate-900 border border-yellow-500 rounded-xl p-6 shadow-xl flex flex-col gap-3">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-yellow-400">🔧 Parche para tu Bot</h3>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{parcheTecnico}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (parcheTecnico) {
                        void navigator.clipboard.writeText(parcheTecnico);
                      }
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-900 transition-colors"
                  >
                    Copiar parche
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 max-w-2xl">
            TrustLayer IA es una herramienta de asistencia técnica basada en modelos de lenguaje extenso.
            El análisis es generado automáticamente por inteligencia artificial y los resultados tienen
            carácter informativo, por lo que deben ser validados por un profesional de seguridad cualificado
            antes de tomar cualquier decisión empresarial o técnica. El uso de esta plataforma no constituye
            asesoramiento legal o de auditoría vinculante.
          </p>
        </footer>
      </main>
    </div>
  );
}
