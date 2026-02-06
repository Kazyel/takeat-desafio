import {
	calculateF1Score,
	calculatePrecision,
	calculateRecall,
	getCategoryMetricsMap,
	getUniqueCategories,
} from "@/lib/helpers/metrics-helpers";
import type { CategoryMetrics, MetricsResult } from "@/lib/types/metrics";
import type { ValidationResult } from "@/lib/types/validation";
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

export function calculateMetrics(results: ValidationResult[]): MetricsResult {
	const totalResults = results.length;
	const totalCorrect = results.filter((result) => result.correct).length;
	const accuracy = Math.round((totalCorrect / totalResults) * 100 * 100) / 100;

	const categoryMetrics = calculateCategoryMetrics(results);

	return {
		accuracy,
		totalResults,
		totalCorrect,
		categoryMetrics,
	};
}

export async function calculateDetailedMetrics(): Promise<MetricsResult> {
	try {
		const validation = await validateAllExamples();
		const metrics = calculateMetrics(validation.results);

		return {
			totalResults: validation.total,
			totalCorrect: metrics.totalCorrect,
			accuracy: metrics.accuracy,
			categoryMetrics: metrics.categoryMetrics,
		};
	} catch (error) {
		console.error("Erro ao calcular métricas detalhadas:", error);
		return {
			accuracy: 0,
			totalResults: 0,
			totalCorrect: 0,
			categoryMetrics: [],
		};
	}
}
