import { Hono } from "hono";
import { validationResponseSchema } from "@/lib/schemas/validation.schema";
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
		const parsedValidation = validationResponseSchema.safeParse(validation);

		if (!parsedValidation.success) {
			console.error(
				"Erro ao validar estrutura da resposta:",
				parsedValidation.error,
			);

			return c.json(
				{
					error: "INTERNAL_SERVER_ERROR",
					message: "Resposta inválida gerada pelo serviço de validação",
				},
				500,
			);
		}

		return c.json(parsedValidation.data);
	} catch (error) {
		console.error("Erro no endpoint /validate:", parseApiError(error));

		return c.json(
			{
				error: "INTERNAL_SERVER_ERROR",
				message: "Erro ao validar exemplos",
			},
			500,
		);
	}
});
