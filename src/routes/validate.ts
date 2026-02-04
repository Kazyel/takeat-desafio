import { Hono } from "hono";
import type { APIErrorResponse } from "@/lib/types/api";
import { validateAllExamples } from "@/services/validation-service";

export const validateRoute = new Hono();

/**
 * GET /validate
 * Validar exemplos de conversas
 */

validateRoute.get("/", async (c) => {
	try {
		const validation = await validateAllExamples();

		return c.json(validation);
	} catch (error) {
		console.log("Erro no endpoint /validate:", error);

		return c.json<APIErrorResponse>(
			{
				error: "Internal Server Error",
				message: "Erro ao validar exemplos",
			},
			500,
		);
	}
});
