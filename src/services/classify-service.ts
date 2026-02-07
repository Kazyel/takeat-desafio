import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig } from "@/lib/config/gemini";
import {
	generatePrompt,
	parseGeminiResponse,
} from "@/lib/helpers/gemini-helpers";
import type {
	ClassifyResult,
	MessageWithContext,
} from "@/lib/schemas/classify.schema";
import { BasicCache } from "@/lib/utils/basic-cache";
import { logger } from "@/middlewares/logger";

type ClassifyOptions = {
	gemini?: GoogleGenAI;
	configs?: ReturnType<typeof getGeminiConfig>;
};

const MAX_CACHE = 500;
const cache = new BasicCache();

export async function classifyMessage(
	message: string,
	context: MessageWithContext[] = [],
	opts: ClassifyOptions = {},
): Promise<ClassifyResult> {
	const key = cache.generateKey(message);

	if (cache.has(key)) {
		logger.info({
			event: "cache_hit",
			messageKey: key,
		});
		const cachedValue = cache.get(key);

		if (!cachedValue) {
			logger.error({
				event: "cache_error",
				reason: "value_was_null",
				key,
			});
			throw new Error("O valor do cache está nulo");
		}

		return {
			...cachedValue,
			fromCache: true,
		};
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

		return {
			...parsedResponse,
			fromCache: false,
		};
	} catch (error) {
		logger.error({
			event: "classify_failed",
			error: error instanceof Error ? error.message : String(error),
			messagePreview: message.slice(0, 100),
		});

		throw new Error(
			`Classificação falhou: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
