import { Hono } from "hono";
import {
	classifyRequestSchema,
	classifyResponseSchema,
} from "@/lib/schemas/classify.schema";

import { classifyMessage } from "@/services/classify-service";

export const classifyRoute = new Hono();

/**
 * POST /classify
 * Classifica uma mensagem simples
 */

classifyRoute.post("/", async (c) => {
	let body: unknown;

	try {
		body = await c.req.json();
	} catch (error) {
		console.error("Erro ao parsear JSON:", error);
		return c.json(
			{
				error: "INVALID_JSON",
				message: "Corpo da requisição contém JSON malformado.",
			},
			400,
		);
	}

	const parsedBody = classifyRequestSchema.safeParse(body);

	if (!parsedBody.success) {
		console.error("Erro ao parsear requisição:", parsedBody.error);
		return c.json(
			{
				error: "INVALID_REQUEST",
				message: parsedBody.error.issues,
			},
			400,
		);
	}

	const { message, context } = parsedBody.data;
	const geminiResult = await classifyMessage(message, context);
	const parsedGeminiResult = classifyResponseSchema.safeParse(geminiResult);

	if (!parsedGeminiResult.success) {
		console.error(
			"Erro ao parsear resposta do Gemini:",
			parsedGeminiResult.error,
		);
		return c.json(
			{
				error: "INVALID_GEMINI_RESPONSE",
				message: parsedGeminiResult.error.issues,
			},
			400,
		);
	}

	return c.json(parsedGeminiResult.data);
});
