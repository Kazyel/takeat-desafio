import { Categories, type ClassificationResponse } from "@/lib/types";

import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig } from "@/lib/config/gemini";
import { CLASSIFICATION_PROMPT } from "@/lib/config/prompt";

function parseGeminiResponse(response: string): ClassificationResponse {
  try {
    let cleanedResponse = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsedResponse = JSON.parse(cleanedResponse);

    if (!Object.values(Categories).includes(parsedResponse.category)) {
      throw new Error(`Categoria inválida: ${parsedResponse.category}`);
    }

    let confidence = parseFloat(parsedResponse.confidence);

    if (isNaN(confidence) || confidence < 0 || confidence > 1) {
      confidence = 0.5;
    }

    return {
      category: parsedResponse.category as Categories,
      confidence: Math.round(confidence * 100) / 100,
    };
  } catch (error) {
    console.error("Erro ao parsear resposta do Gemini:", error);
    console.error("Resposta original:", response);

    return {
      category: Categories.Outros,
      confidence: 0.3,
    };
  }
}

export async function classifyMessage(message: string): Promise<ClassificationResponse> {
  try {
    const gemini = new GoogleGenAI({});
    const configs = getGeminiConfig();

    const prompt = `${CLASSIFICATION_PROMPT}

        **MENSAGEM DO CLIENTE:**
        "${message}"

        Classifique esta mensagem.`;

    const result = await gemini.models.generateContent({
      model: configs.model,
      contents: prompt,
      config: {
        maxOutputTokens: configs.maxOutputTokens,
        temperature: configs.temperature,
      },
    });

    if (!result || !result.text) {
      throw new Error("Resposta vazia");
    }

    return parseGeminiResponse(result.text);
  } catch (error) {
    console.error("Erro na classificação:", error);
    throw new Error(`Falha ao classificar mensagem: ${error}`);
  }
}

// export async function classifyWithContext(
//   messages: Message[]
// ): Promise<ClassificationResponse> {
//   try {
//     if (!messages || messages.length === 0) {
//       throw new Error("Array de mensagens vazio");
//     }

//     const genAI = initializeGemini();
//     const model = getModel(genAI);

//     const prompt = createContextPrompt(messages);

//     const result = await model.generateContent(prompt);
//     const response = result.response;
//     const text = response.text();

//     return parseGeminiResponse(text);
//   } catch (error) {
//     console.error("Erro na classificação com contexto:", error);
//     throw new Error(`Falha ao classificar com contexto: ${error}`);
//   }
// }

export async function testGeminiConnection(): Promise<boolean> {
  try {
    const gemini = new GoogleGenAI({});
    const configs = getGeminiConfig();

    const result = await gemini.models.generateContent({
      model: configs.model,
      contents: "Responda apenas: OK",
      config: {
        maxOutputTokens: configs.maxOutputTokens,
        temperature: configs.temperature,
      },
    });

    if (!result || !result.text) {
      throw new Error("Resposta vazia");
    }

    return result.text.includes("OK");
  } catch (error) {
    console.error("Erro ao testar conexão com Gemini:", error);
    return false;
  }
}
