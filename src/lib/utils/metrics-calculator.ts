import {
  Categories,
  type CategoryMetrics,
  type MetricsResponse,
  type ValidationResult,
} from "@/lib/types";

const getUniqueCategories = () => {
  return [
    Categories.PedidoCardapio,
    Categories.StatusEntrega,
    Categories.Reclamacao,
    Categories.Elogio,
    Categories.Outros,
  ];
};

const calculateCategoryMetrics = (results: ValidationResult[]): CategoryMetrics[] => {
  const categories = getUniqueCategories();

  return categories.map((category) => {
    const expectedThisCategory = results.filter((r) => r.expected === category);

    const truePositives = results.filter(
      (r) => r.expected === category && r.predicted === category
    ).length;

    const falsePositives = results.filter(
      (r) => r.expected !== category && r.predicted === category
    ).length;

    const falseNegatives = results.filter(
      (r) => r.expected === category && r.predicted !== category
    ).length;

    const precision =
      truePositives + falsePositives > 0
        ? Math.round((truePositives / (truePositives + falsePositives)) * 100 * 100) / 100
        : 0;

    const recall =
      truePositives + falseNegatives > 0
        ? Math.round((truePositives / (truePositives + falseNegatives)) * 100 * 100) / 100
        : 0;

    const f1Score =
      precision + recall > 0
        ? Math.round(((2 * precision * recall) / (precision + recall)) * 100) / 100
        : 0;

    const samples = expectedThisCategory.length;

    return {
      category,
      precision,
      recall,
      f1Score,
      samples,
    };
  });
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
