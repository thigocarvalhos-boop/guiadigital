/**
 * API Proxy para auditoria com Gemini.
 * 
 * IMPORTANTE: Este arquivo é um TEMPLATE para deploy server-side.
 * NÃO é importado pelo código do client (App.tsx, componentes, etc.).
 * 
 * Em produção, deploy como serverless function (Vercel, Cloudflare, etc.)
 * para que a API key (process.env.GEMINI_API_KEY) fique apenas no servidor.
 * 
 * Durante desenvolvimento local, o Vite proxy pode ser configurado em
 * vite.config.ts para redirecionar /api/audit para um handler local.
 */

export interface AuditRequest {
  lessonTitle: string;
  clientBriefing: string;
  content: string;
  imageBase64?: string;
}

export interface AuditResponse {
  score: number;
  feedback: string;
  aprovado: boolean;
  mentor: string;
}

/**
 * Chama a Gemini API server-side.
 * A chave vem de variável de ambiente, nunca exposta no client.
 */
export async function handleAudit(body: AuditRequest): Promise<AuditResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no servidor.');
  }

  const systemInstruction = `Você é um DIRETOR DE ARTE SÊNIOR. 
Avalie se o trabalho do talento está pronto para o mercado real.
Dê um score de 0 a 100 e feedback focado em viabilidade comercial.
Retorne apenas JSON: { score, feedback, aprovado, mentor }.`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: `Lição: ${body.lessonTitle}\nBriefing: ${body.clientBriefing}\nEntrega: ${body.content}` }
  ];

  if (body.imageBase64) {
    const base64Data = body.imageBase64.includes(',')
      ? body.imageBase64.split(',')[1]
      : body.imageBase64;
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
  }

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
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Resposta vazia da Gemini API');
  }

  return JSON.parse(text);
}
