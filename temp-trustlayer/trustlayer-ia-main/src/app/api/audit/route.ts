import { NextResponse } from "next/server";

const GEMINI_KEY = process.env.GEMINI_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json(); console.log("Cuerpo recibido:", body); const prompt = body.prompt;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hola Gemini, dime si recibes este mensaje fijo"
          }]
        }]
      }),
    });

    const data = await res.json();
    
    if (data.error) {
       return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const analysis = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ analysis });

  } catch (error: any) {
    return NextResponse.json({ error: "Error en la conexión con la IA" }, { status: 500 });
  }
}