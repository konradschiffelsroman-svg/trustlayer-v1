import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

const AUDIT_PROMPT = `
Eres un Senior Revenue Engineer especialista en colivings. Audita este chat.

CONTEXTO DEL CHAT:
\${chatContent}

RESPONDE SOLO EN JSON SIN MARKDOWN:
{
  "riesgosDetalle": [],
  "diagnostico": "por qué falló el bot",
  "ingresos_en_riesgo": "euros perdidos estimados",
  "solucion_inmediata": "frase exacta que debería haber dicho el bot",
  "parche_tecnico": "instrucción para el system prompt del bot"
}
`;

type RiesgoDetalle = {
  id?: number;
  titulo?: string;
  descripcion?: string;
  criticidad?: string;
  area?: string;
  recomendacion?: string;
};

type AuditJson = {
  auditorias?: number;
  riesgos?: number;
  sistemasProtegidos?: number;
  analisis?: string;
  riesgosDetalle?: RiesgoDetalle[];
  diagnostico?: string;
  ingresos_en_riesgo?: string;
  solucion_inmediata?: string;
  parche_tecnico?: string;
};

export async function POST(req: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada en .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const promptInput = typeof body.prompt === "string" ? body.prompt : "";
    const prompt = promptInput.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Se requiere el campo 'prompt' con el texto a auditar" },
        { status: 400 }
      );
    }

    const fullPrompt = AUDIT_PROMPT + prompt;

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
      }),
    });

    if (!res.ok) {
      let errorMessage = `Error de Gemini: ${res.status} ${res.statusText}`;
      try {
        const errorBody: any = await res.json();
        if (errorBody?.error?.message) {
          errorMessage = `Error de Gemini: ${errorBody.error.message}`;
        }
      } catch {
        // ignorar fallo al parsear el error
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const data: any = await res.json();
    const rawText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: "Respuesta vacía de la IA" },
        { status: 500 }
      );
    }

    const cleanText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: AuditJson;

    try {
      parsed = JSON.parse(cleanText) as AuditJson;
    } catch {
      return NextResponse.json({
        auditorias: 1,
        riesgos: 0,
        sistemasProtegidos: 0,
        analisis: rawText,
        riesgosDetalle: [],
      });
    }

    const riesgosDetalle = Array.isArray(parsed.riesgosDetalle)
      ? parsed.riesgosDetalle
      : [];

    const responsePayload = {
      auditorias: parsed.auditorias ?? 1,
      riesgos:
        parsed.riesgos ??
        (Array.isArray(parsed.riesgosDetalle)
          ? parsed.riesgosDetalle.length
          : 0),
      sistemasProtegidos: parsed.sistemasProtegidos ?? 0,
      analisis: parsed.analisis ?? rawText,
      riesgosDetalle,
      diagnostico: parsed.diagnostico ?? "",
      ingresos_en_riesgo: parsed.ingresos_en_riesgo ?? "",
      solucion_inmediata: parsed.solucion_inmediata ?? "",
      parche_tecnico: parsed.parche_tecnico ?? "",
    };

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    console.error("Error audit API:", error);
    return NextResponse.json(
      { error: "Error en la conexión con la IA" },
      { status: 500 }
    );
  }
}

