import { Hono } from "hono";
import type { APIErrorResponse } from "@/lib/types/api";
import { calculateDetailedMetrics } from "@/services/validation-service";

export const metricsRoute = new Hono();

/**
 * GET /metrics
 * Calcular métricas de classificação
 */

metricsRoute.get("/", async (c) => {
	try {
		const metrics = await calculateDetailedMetrics();

		return c.json(metrics);
	} catch (error) {
		console.log("Erro no endpoint /metrics:", error);

		return c.json<APIErrorResponse>(
			{
				error: "Internal Server Error",
				message: "Erro ao calcular métricas",
			},
			500,
		);
	}
});
