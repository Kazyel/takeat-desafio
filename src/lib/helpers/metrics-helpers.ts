import { Categories } from "@/lib/types/generic";
import type { MetricsMap } from "@/lib/types/metrics";
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

export const getCategoryMetricsMap = (
	results: ValidationResult[],
): MetricsMap => {
	const categories = getUniqueCategories();

	const metricsMap: MetricsMap = new Map(
		categories.map((category) => [
			category,
			{ truePositives: 0, falsePositives: 0, falseNegatives: 0, samples: 0 },
		]),
	);

	for (const result of results) {
		const { expected, predicted } = result;

		const expectedMetrics =
			metricsMap.get(expected) ??
			metricsMap
				.set(expected, {
					truePositives: 0,
					falsePositives: 0,
					falseNegatives: 0,
					samples: 0,
				})
				.get(expected);

		if (!expectedMetrics) {
			throw new Error(
				`Categoria ${expected} não encontrada no mapa de métricas.`,
			);
		}

		expectedMetrics.samples++;

		if (predicted === expected) {
			expectedMetrics.truePositives++;
		} else {
			expectedMetrics.falseNegatives++;

			const predictedMetrics =
				metricsMap.get(predicted) ??
				metricsMap
					.set(predicted, {
						truePositives: 0,
						falsePositives: 0,
						falseNegatives: 0,
						samples: 0,
					})
					.get(predicted);

			if (!predictedMetrics) {
				throw new Error(
					`Categoria ${predicted} não encontrada no mapa de métricas.`,
				);
			}

			predictedMetrics.falsePositives++;
		}
	}

	return metricsMap;
};

export function calculatePrecision(tp: number, fp: number): number {
	if (tp + fp === 0) return 0;

	return Number(((tp / (tp + fp)) * 100).toFixed(2));
}

export function calculateRecall(tp: number, fn: number): number {
	if (tp + fn === 0) return 0;

	return Number(((tp / (tp + fn)) * 100).toFixed(2));
}

export function calculateF1Score(tp: number, fp: number, fn: number): number {
	const denom = 2 * tp + fp + fn;
	if (denom === 0) return 0;

	return Number((((2 * tp) / denom) * 100).toFixed(2));
}
