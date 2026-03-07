import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan las variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveAuditLog(
  company: string,
  content: string,
  score: number,
  findings: string[],
  level: string,
  summary: string
) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          company_name: company,
          chat_content: content,
          risk_score: score,
          findings,
          nivel: level,
          resumen: summary,
        },
      ]);

    if (error) {
      console.error('Supabase error:', error);
    }
  } catch (err) {
    console.error('saveAuditLog error:', err);
  }
}