import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig } from "@/lib/config/gemini";
import {
	generatePrompt,
	parseGeminiResponse,
} from "@/lib/helpers/gemini-helpers";
import type { APIClassificationResponse } from "@/lib/types/api";
import type { MessageContext } from "@/lib/types/generic";

type ClassifyOptions = {
	gemini?: GoogleGenAI;
	configs?: ReturnType<typeof getGeminiConfig>;
};

export async function classifyMessage(
	message: string,
	context: MessageContext[] = [],
	opts: ClassifyOptions = {},
): Promise<APIClassificationResponse> {
	if (typeof message !== "string" || message.trim().length === 0) {
		throw new Error("Input inválido: mensagem deve ser uma string não vazia");
	}

	try {
		const gemini = opts.gemini ?? new GoogleGenAI({});
		const configs = opts.configs ?? getGeminiConfig();

		const result = await gemini.models.generateContent({
			model: configs.model,
			config: {
				maxOutputTokens: configs.maxOutputTokens,
				temperature: configs.temperature,
			},
			contents: generatePrompt(message, context),
		});

		if (!result || !result.text) {
			throw new Error("Gemini retornou uma resposta vazia");
		}

		return parseGeminiResponse(result.text);
	} catch (error) {
		console.error("Erro durante a classificação:", error);
		throw new Error(`Falha ao classificar mensagem: ${error}`);
	}
}
