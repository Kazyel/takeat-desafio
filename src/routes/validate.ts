import { Hono } from "hono";
import type { APIErrorResponse } from "@/lib/types/api";
import type { ValidationResponse } from "@/lib/types/validation";
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

		return c.json<APIErrorResponse>(
			{
				error: "Internal Server Error",
				message: "Erro ao validar exemplos",
			},
			500,
		);
	}
});
