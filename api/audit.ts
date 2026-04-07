/**
 * Vercel Serverless Function — Gemini audit proxy.
 *
 * Mantém a API key no servidor. O client chama POST /api/audit
 * com o body { lessonTitle, clientBriefing, content, imageBase64? }.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AuditRequest {
  lessonTitle: string;
  clientBriefing: string;
  content: string;
  imageBase64?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
  }

  const body = req.body as AuditRequest;
  if (!body.lessonTitle || !body.content) {
    return res.status(400).json({ error: 'lessonTitle e content são obrigatórios.' });
  }

  const systemInstruction = `Você é um DIRETOR DE ARTE SÊNIOR. 
Avalie se o trabalho do talento está pronto para o mercado real.
Dê um score de 0 a 100 e feedback focado em viabilidade comercial.
Retorne apenas JSON: { score, feedback, aprovado, mentor }.`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: `Lição: ${body.lessonTitle}\nBriefing: ${body.clientBriefing}\nEntrega: ${body.content}` },
  ];

  if (body.imageBase64) {
    const base64Data = body.imageBase64.includes(',')
      ? body.imageBase64.split(',')[1]
      : body.imageBase64;
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                score: { type: 'NUMBER' },
                feedback: { type: 'STRING' },
                aprovado: { type: 'BOOLEAN' },
                mentor: { type: 'STRING' },
              },
              required: ['score', 'feedback', 'aprovado', 'mentor'],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ error: `Gemini API error ${response.status}: ${errorText}` });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: 'Resposta vazia da Gemini API' });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return res.status(500).json({ error: message });
  }
}
