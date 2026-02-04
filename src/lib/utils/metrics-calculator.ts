import { Categories } from "@/lib/types/generic";
import type {
	CategoryMetrics,
	MetricsMap,
	MetricsResponse,
} from "@/lib/types/metrics";
import type { ValidationResult } from "@/lib/types/validation";

export const getUniqueCategories = () => {
	return [
		Categories.PedidoCardapio,
		Categories.StatusEntrega,
		Categories.Reclamacao,
		Categories.Elogio,
		Categories.Outros,
	];
};

const getMetricsMap = (results: ValidationResult[]): MetricsMap => {
	const categories = getUniqueCategories();

	const metricsMap: MetricsMap = new Map(
		categories.map((category) => [
			category,
			{ truePositives: 0, falsePositives: 0, falseNegatives: 0, samples: 0 },
		]),
	);

	for (const result of results) {
		const { expected, predicted } = result;

		const expectedMetrics = metricsMap.get(expected);
		if (!expectedMetrics) {
			metricsMap.set(expected, {
				truePositives: 0,
				falsePositives: 0,
				falseNegatives: 0,
				samples: 0,
			});
			continue;
		}

		expectedMetrics.samples++;

		if (predicted === expected) {
			expectedMetrics.truePositives++;
			continue;
		}

		expectedMetrics.falseNegatives++;

		const predictedMetrics = metricsMap.get(predicted);
		if (!predictedMetrics) {
			metricsMap.set(predicted, {
				truePositives: 0,
				falsePositives: 0,
				falseNegatives: 0,
				samples: 0,
			});
			continue;
		}

		predictedMetrics.falsePositives++;
	}

	return metricsMap;
};

const calculateCategoryMetrics = (
	results: ValidationResult[],
): CategoryMetrics[] => {
	const metricsMap = getMetricsMap(results);
	const categories = getUniqueCategories();

	const metrics = categories.map((category) => {
		const categoryMetrics = metricsMap.get(category);

		if (!categoryMetrics) {
			throw new Error(
				`Categoria ${category} não encontrada no mapa de métricas`,
			);
		}

		const { truePositives, falsePositives, falseNegatives, samples } =
			categoryMetrics;

		const precision =
			truePositives + falsePositives > 0
				? Number(
						((truePositives / (truePositives + falsePositives)) * 100).toFixed(
							2,
						),
					)
				: 0;

		const recall =
			truePositives + falseNegatives > 0
				? Number(
						((truePositives / (truePositives + falseNegatives)) * 100).toFixed(
							2,
						),
					)
				: 0;

		const f1Score =
			precision + recall > 0
				? Math.round(((2 * precision * recall) / (precision + recall)) * 100) /
					100
				: 0;

		return {
			category,
			precision,
			recall,
			f1Score,
			samples,
		};
	});

	return metrics;
};

export function calculateMetrics(results: ValidationResult[]): MetricsResponse {
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
