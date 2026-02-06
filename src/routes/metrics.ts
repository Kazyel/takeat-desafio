import { Hono } from "hono";
import type { APIErrorResponse } from "@/lib/types/api";
import type { MetricsResult } from "@/lib/types/metrics";
import { parseApiError } from "@/lib/utils/parse-api-error";
import { calculateDetailedMetrics } from "@/services/metrics-service";

export const metricsRoute = new Hono();

/**
 * GET /metrics
 * Calcular métricas de classificação
 */

metricsRoute.get("/", async (c) => {
	try {
		const metrics = await calculateDetailedMetrics();

		return c.json<MetricsResult>(metrics);
	} catch (error) {
		console.error("Erro no endpoint /metrics:", parseApiError(error));

		return c.json<APIErrorResponse>(
			{
				error: "Internal Server Error",
				message: "Erro ao calcular métricas",
			},
			500,
		);
	}
});
