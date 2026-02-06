import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig } from "@/lib/config/gemini";
import {
	generatePrompt,
	parseGeminiResponse,
} from "@/lib/helpers/gemini-helpers";
import type { APIClassifyResponse } from "@/lib/types/api";
import type { MessageContext } from "@/lib/types/generic";
import { BasicCache } from "@/lib/utils/basic-cache";

type ClassifyOptions = {
	gemini?: GoogleGenAI;
	configs?: ReturnType<typeof getGeminiConfig>;
};

const MAX_CACHE = 500;
const cache = new BasicCache();

export async function classifyMessage(
	message: string,
	context: MessageContext[] = [],
	opts: ClassifyOptions = {},
): Promise<APIClassifyResponse> {
	if (typeof message !== "string" || message.trim().length === 0) {
		throw new Error("Input inválido: mensagem deve ser uma string não vazia");
	}

	const key = cache.generateKey(message);

	if (cache.has(key)) {
		console.log("CACHE HIT", key);

		const cachedValue = cache.get(key);
		if (!cachedValue) {
			throw new Error("Cached value is null");
		}

		return cachedValue;
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

		const parsedResponse = parseGeminiResponse(result.text);
		const hasContext = context.length > 0;

		if (!hasContext) {
			if (cache.size() >= MAX_CACHE) {
				cache.clear();
			}

			cache.set(key, parsedResponse);
		}

		return parsedResponse;
	} catch (error) {
		console.error("Erro durante a classificação:", error);
		throw new Error(`Falha ao classificar mensagem: ${error}`);
	}
}
