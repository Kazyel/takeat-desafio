import { Hono } from "hono";
import { validationResponseSchema } from "@/lib/schemas/validation.schema";
import { parseApiError } from "@/lib/utils/parse-api-error";
import { logger } from "@/middlewares/logger";
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
			logger.error({
				event: "validation_invalid",
				error: parsedValidation.error,
			});

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
		logger.error({
			event: "validation_failed",
			error: parseApiError(error),
		});

		return c.json(
			{
				error: "INTERNAL_SERVER_ERROR",
				message: "Erro ao validar exemplos",
			},
			500,
		);
	}
});
