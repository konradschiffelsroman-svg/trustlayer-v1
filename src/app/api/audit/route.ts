import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

const AUDIT_PROMPT = `Eres un auditor de seguridad informática senior.
Analiza el siguiente texto/documento y realiza una auditoría de seguridad lo más estructurada posible.

Responde ÚNICAMENTE con un JSON válido (sin markdown ni texto adicional) con esta estructura exacta:
{
  "auditorias": 1,
  "riesgos": <número de riesgos detectados, 0 o más>,
  "sistemasProtegidos": <porcentaje 0-100 de aspectos bien protegidos>,
  "analisis": "<resumen del análisis en 2-4 párrafos, con conclusiones globales>",
  "riesgosDetalle": [
    {
      "id": 1,
      "titulo": "<título corto del riesgo>",
      "descripcion": "<descripción del riesgo y su impacto>",
      "criticidad": "Alta" | "Media" | "Baja",
      "area": "<área afectada, por ejemplo: Red, Aplicación Web, Datos, Identidad, Cumplimiento, Infraestructura, etc.>",
      "recomendacion": "<acción concreta recomendada para mitigar el riesgo>"
    }
  ]
}

Reglas:
- auditorias siempre es 1 (cada análisis cuenta como 1 auditoría)
- riesgos: número total de elementos dentro de riesgosDetalle
- sistemasProtegidos: estima qué % está bien configurado/protegido
- analisis: resumen ejecutivo en español, claro y profesional
- riesgosDetalle: lista priorizada (primero Alta, luego Media, luego Baja)
- Si no se detecta ningún riesgo, devuelve riesgos = 0 y un array vacío en riesgosDetalle

Texto a auditar:
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

