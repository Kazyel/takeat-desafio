import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig } from "@/lib/config/gemini";
import { CLASSIFICATION_PROMPT } from "@/lib/config/prompt";
import type { APIClassificationResponse } from "@/lib/types/api";
import { Categories } from "@/lib/types/generic";

function extractCleanJson(text: string): string {
	const match = text.match(/\{[\s\S]*\}/);
	if (!match) throw new Error("Nenhum JSON encontrado na resposta");

	return match[0].replace(/,(\s*})/g, "$1");
}

function parseGeminiResponse(response: string): APIClassificationResponse {
	try {
		const parsedResponse = JSON.parse(extractCleanJson(response));

		if (!Object.values(Categories).includes(parsedResponse.category)) {
			throw new Error(`Categoria inválida: ${parsedResponse.category}`);
		}

		let confidence = parseFloat(parsedResponse.confidence);

		if (Number.isNaN(confidence) || confidence < 0 || confidence > 1) {
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

export async function classifyMessage(
	message: string,
): Promise<APIClassificationResponse> {
	try {
		const gemini = new GoogleGenAI({});
		const configs = getGeminiConfig();

		const prompt = `${CLASSIFICATION_PROMPT}

        **MENSAGEM DO CLIENTE:**
        "${message}"

        Classifique esta mensagem.`;

		const result = await gemini.models.generateContent({
			model: configs.model,
			config: {
				maxOutputTokens: configs.maxOutputTokens,
				temperature: configs.temperature,
			},
			contents: prompt,
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
