import type { Categories } from "@/lib/types/generic";

export type CategoryMetrics = {
	category: Categories;
	precision: number;
	recall: number;
	f1Score: number;
	samples: number;
};

export type MetricsResponse = {
	accuracy: number;
	totalResults: number;
	totalCorrect: number;
	categoryMetrics: CategoryMetrics[];
};

export type MetricsData = {
	truePositives: number;
	falsePositives: number;
	falseNegatives: number;
	samples: number;
};

export type MetricsMap = Map<Categories, MetricsData>;
