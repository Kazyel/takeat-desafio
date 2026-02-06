import type { Categories } from "@/lib/types/generic";

export type ValidationResult = {
	id: number;
	message: string;
	expected: Categories;
	predicted: Categories;
	confidence: number;
	correct: boolean;
};

export type ValidationResponse = {
	total: number;
	correct: number;
	results: ValidationResult[];
};
