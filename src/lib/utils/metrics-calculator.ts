import {
  Categories,
  type CategoryMetrics,
  type MetricsResponse,
  type ValidationResult,
} from "@/lib/types";

type MetricsMap = Map<
  Categories,
  {
    truePositives: number;
    falsePositives: number;
    falseNegatives: number;
    samples: number;
  }
>;

const getUniqueCategories = () => {
  return [
    Categories.PedidoCardapio,
    Categories.StatusEntrega,
    Categories.Reclamacao,
    Categories.Elogio,
    Categories.Outros,
  ];
};

const getMetricsMap = (results: ValidationResult[]) => {
  const categories = getUniqueCategories();

  const metricsMap: MetricsMap = new Map();

  categories.forEach((cat) => {
    metricsMap.set(cat, {
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      samples: 0,
    });
  });

  results.forEach((result) => {
    const { expected, predicted } = result;

    const metrics = metricsMap.get(expected)!;
    metrics.samples++;

    if (predicted === expected) {
      metrics.truePositives++;
    } else {
      metrics.falseNegatives++;
      metricsMap.get(predicted)!.falsePositives++;
    }
  });

  return metricsMap;
};

const calculateCategoryMetrics = (results: ValidationResult[]): CategoryMetrics[] => {
  const metricsMap = getMetricsMap(results);
  const categories = getUniqueCategories();

  const metrics = categories.map((category) => {
    const { truePositives, falsePositives, falseNegatives, samples } =
      metricsMap.get(category)!;

    const precision =
      truePositives + falsePositives > 0
        ? Number(((truePositives / (truePositives + falsePositives)) * 100).toFixed(2))
        : 0;

    const recall =
      truePositives + falseNegatives > 0
        ? Number(((truePositives / (truePositives + falseNegatives)) * 100).toFixed(2))
        : 0;

    const f1Score =
      precision + recall > 0
        ? Math.round(((2 * precision * recall) / (precision + recall)) * 100) / 100
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
  const totalCorrect = results.filter((r) => r.correct).length;
  const accuracy = Math.round((totalCorrect / totalResults) * 100 * 100) / 100;

  const categoryMetrics = calculateCategoryMetrics(results);

  return {
    accuracy,
    totalResults,
    totalCorrect,
    categoryMetrics,
  };
}
