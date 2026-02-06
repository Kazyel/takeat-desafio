import { z } from "zod";
import type { Categories } from "@/lib/types";

export const metricsDataSchema = z.object({
	truePositives: z.number().int().nonnegative(),
	falsePositives: z.number().int().nonnegative(),
	falseNegatives: z.number().int().nonnegative(),
	samples: z.number().int().nonnegative(),
});

export const categoryMetricsSchema = z.object({
	category: z.string(),
	precision: z.number().min(0).max(100),
	recall: z.number().min(0).max(100),
	f1Score: z.number().min(0).max(100),
	samples: z.number().int().nonnegative(),
});

export const metricsResponseSchema = z.object({
	accuracy: z.number().min(0).max(100),
	totalExamples: z.number().int().nonnegative(),
	correctPredictions: z.number().int().nonnegative(),
	categoryMetrics: z.array(categoryMetricsSchema),
});

export type CategoryMetrics = z.infer<typeof categoryMetricsSchema>;
export type MetricsResponse = z.infer<typeof metricsResponseSchema>;
export type MetricsData = z.infer<typeof metricsDataSchema>;
export type MetricsMap = Map<Categories, z.infer<typeof metricsDataSchema>>;
