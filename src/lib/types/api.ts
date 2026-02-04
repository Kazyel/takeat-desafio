import type { Categories } from "@/lib/types/generic";

export interface APIErrorResponse {
	error: string;
	message: string;
}

export interface APIClassificationRequest {
	message: string;
}

export interface APIClassificationResponse {
	category: Categories;
	confidence: number;
}
