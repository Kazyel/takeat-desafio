import { Hono } from "hono";
import { metricsResponseSchema } from "@/lib/schemas/metrics.schema";
import { parseApiError } from "@/lib/utils/parse-api-error";
import { logger } from "@/middlewares/logger";
import { calculateDetailedMetrics } from "@/services/metrics-service";

export const metricsRoute = new Hono();

metricsRoute.get("/", async (c) => {
	try {
		const calculatedMetrics = await calculateDetailedMetrics();
		const parsedMetrics = metricsResponseSchema.safeParse(calculatedMetrics);

		if (!parsedMetrics.success) {
			logger.error({
				event: "metrics_invalid",
				error: parsedMetrics.error,
			});

			return c.json(
				{
					error: "INVALID_METRICS",
					message: "Falha interna ao gerar métricas válidas",
				},
				500,
			);
		}

		return c.json(parsedMetrics.data);
	} catch (error) {
		logger.error({
			event: "metrics_failed",
			error: parseApiError(error),
		});

		return c.json(
			{
				error: "INTERNAL_SERVER_ERROR",
				message: "Erro ao calcular métricas",
			},
			500,
		);
	}
});
