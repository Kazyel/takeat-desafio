import {
	calculateF1Score,
	calculatePrecision,
	calculateRecall,
	getCategoryMetricsMap,
	getUniqueCategories,
} from "@/lib/helpers/metrics-helpers";

import type {
	CategoryMetrics,
	MetricsResponse,
} from "@/lib/schemas/metrics.schema";

import type { ValidationResult } from "@/lib/schemas/validation.schema";
import { parseApiError } from "@/lib/utils/parse-api-error";
import { logger } from "@/middlewares/logger";

import { validateAllExamples } from "@/services/validation-service";

export function calculateCategoryMetrics(
	results: ValidationResult[],
): CategoryMetrics[] {
	const metricsMap = getCategoryMetricsMap(results);
	const categories = getUniqueCategories();

	const categoryMetrics = categories.map((category) => {
		const currentCategory = metricsMap.get(category);

		if (!currentCategory) {
			throw new Error(
				`Categoria ${category} não encontrada no mapa de métricas`,
			);
		}

		const { truePositives, falsePositives, falseNegatives, samples } =
			currentCategory;

		return {
			category,
			precision: calculatePrecision(truePositives, falsePositives),
			recall: calculateRecall(truePositives, falseNegatives),
			f1Score: calculateF1Score(truePositives, falsePositives, falseNegatives),
			samples,
		};
	});

	return categoryMetrics;
}

export function calculateMetrics(results: ValidationResult[]): MetricsResponse {
	const totalExamples = results.length;
	const correctPredictions = results.filter((result) => result.correct).length;
	const accuracy =
		Math.round((correctPredictions / totalExamples) * 100 * 100) / 100;

	const categoryMetrics = calculateCategoryMetrics(results);

	return {
		accuracy,
		totalExamples,
		correctPredictions,
		categoryMetrics,
	};
}

export async function calculateDetailedMetrics(): Promise<MetricsResponse> {
	try {
		const validation = await validateAllExamples();
		const metrics = calculateMetrics(validation.results);

		return {
			totalExamples: validation.total,
			correctPredictions: metrics.correctPredictions,
			accuracy: metrics.accuracy,
			categoryMetrics: metrics.categoryMetrics,
		};
	} catch (error) {
		logger.error({
			event: "metrics_failed",
			error: parseApiError(error),
		});

		return {
			accuracy: 0,
			totalExamples: 0,
			correctPredictions: 0,
			categoryMetrics: [],
		};
	}
}
