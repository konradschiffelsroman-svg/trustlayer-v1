'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/supabase';

export default function LoginPage() {
  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 w-full max-w-md shadow-xl">
        <div className="flex flex-col items-center gap-3 mb-8">
          <ShieldCheck className="text-blue-400" size={40} />
          <h1 className="text-2xl font-bold">TrustLayer IA</h1>
          <p className="text-sm text-slate-400 text-center">
            Accede con tu cuenta de Google para auditar conversaciones y detectar riesgos de negocio.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-medium py-3 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span>Entrar con Google</span>
        </button>
      </div>
    </div>
  );
}

