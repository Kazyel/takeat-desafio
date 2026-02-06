import { Hono } from "hono";
import type { APIClassifyRequest, APIErrorResponse } from "@/lib/types/api";
import { parseApiError } from "@/lib/utils/parse-api-error";
import { classifyMessage } from "@/services/classify-service";

const MAX_MESSAGE_LENGTH = 200;

export const classifyRoute = new Hono();

/**
 * POST /classify
 * Classifica uma mensagem simples
 */

classifyRoute.post("/", async (c) => {
	try {
		const body: APIClassifyRequest = await c.req.json();

		if (!body || typeof body !== "object") {
			return c.json(
				{
					error: "Bad Request",
					message: "JSON inválido no corpo da requisição.",
				},
				400,
			);
		}

		const { message, context } = body;

		if (!message || message.trim() === "") {
			return c.json(
				{
					error: "Erro de validação: mensagem vazia",
					message: "O campo 'message' é obrigatório e não pode ser vazio.",
				},
				400,
			);
		}

		if (message.length > MAX_MESSAGE_LENGTH) {
			return c.json(
				{
					error: "Payload muito grande",
					message: `A mensagem não pode exceder ${MAX_MESSAGE_LENGTH} caracteres.`,
				},
				413,
			);
		}

		if (context && !Array.isArray(context)) {
			return c.json(
				{
					error: "Payload inválido",
					message: "O campo 'context' deve ser um array",
				},
				400,
			);
		}

		if (context && context.length > 10) {
			return c.json(
				{
					error: "Payload muito grande",
					message: "O campo 'context' não pode ter mais de 5 mensagens",
				},
				400,
			);
		}

		const result = await classifyMessage(message, context);

		return c.json(result);
	} catch (error) {
		console.error("Erro no endpoint /classify:", parseApiError(error));

		return c.json<APIErrorResponse>(
			{
				error: "Internal Server Error",
				message: "Erro ao classificar mensagem",
			},
			500,
		);
	}
});
