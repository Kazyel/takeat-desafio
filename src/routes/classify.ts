import { Hono } from "hono";
import {
	classifyRequestSchema,
	classifyResponseSchema,
} from "@/lib/schemas/classify.schema";
import { logger } from "@/middlewares/logger";
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
	} catch {
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
		logger.error({
			event: "gemini_parse_failed",
			error: parsedGeminiResult.error,
			originalMessage: geminiResult,
		});

		return c.json(
			{
				error: "INVALID_GEMINI_RESPONSE",
				message: parsedGeminiResult.error.issues,
			},
			500,
		);
	}

	return c.json(parsedGeminiResult.data);
});
