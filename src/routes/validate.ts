import { Hono } from "hono";
import type { ValidationResponse } from "@/lib/schemas/validation.schema";
import { parseApiError } from "@/lib/utils/parse-api-error";
import { validateAllExamples } from "@/services/validation-service";

export const validateRoute = new Hono();

/**
 * GET /validate
 * Validar exemplos de conversas
 */

validateRoute.get("/", async (c) => {
	try {
		const validation = await validateAllExamples();

		return c.json<ValidationResponse>(validation);
	} catch (error) {
		console.error("Erro no endpoint /validate:", parseApiError(error));

		return c.json(
			{
				error: "Internal Server Error",
				message: "Erro ao validar exemplos",
			},
			500,
		);
	}
});
