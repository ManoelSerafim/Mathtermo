import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MathQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
  studyContent: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

export async function getDailyQuestion(dateStr: string): Promise<MathQuestion> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere uma questão de matemática desafiadora para o dia ${dateStr}. 
    A questão deve ser de múltipla escolha com 4 alternativas.
    Inclua também uma explicação detalhada e um conteúdo de estudo completo sobre o tópico da questão.
    O conteúdo de estudo deve ser educativo e explicar os conceitos fundamentais.
    IMPORTANTE: Use LaTeX para TODAS as fórmulas matemáticas (ex: $x^2$ para inline ou $$E=mc^2$$ para blocos).
    Responda APENAS em formato JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING, description: "O enunciado da questão em Markdown" },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "4 alternativas de resposta"
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Índice da resposta correta (0-3)" },
          explanation: { type: Type.STRING, description: "Explicação curta de por que a resposta está correta" },
          topic: { type: Type.STRING, description: "O tópico da matemática (ex: Álgebra, Geometria)" },
          studyContent: { type: Type.STRING, description: "Conteúdo de estudo aprofundado em Markdown" },
          difficulty: { type: Type.STRING, enum: ["Fácil", "Médio", "Difícil"] }
        },
        required: ["id", "question", "options", "correctAnswerIndex", "explanation", "topic", "studyContent", "difficulty"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return data as MathQuestion;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Erro ao gerar a questão do dia.");
  }
}
