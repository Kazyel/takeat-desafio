import { CLASSIFICATION_PROMPT } from "@/lib/config/prompt";
import type { APIClassificationResponse } from "@/lib/types/api";
import { Categories } from "@/lib/types/generic";

function extractCleanJson(text: string): string {
	const match = text.match(/\{[\s\S]*\}/);
	if (!match) throw new Error("Nenhum JSON encontrado na resposta");

	return match[0].replace(/,(\s*})/g, "$1");
}

export function generatePrompt(message: string): string {
	return `${CLASSIFICATION_PROMPT}

      **MENSAGEM DO CLIENTE:**
      "${message}"

      Classifique esta mensagem.`;
}

export function parseGeminiResponse(
	response: string,
): APIClassificationResponse {
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
