import type { Categories, MessageContext } from "@/lib/types/generic";

export interface APIErrorResponse {
	error: string;
	message: string;
}

export interface APIClassifyResponse {
	category: Categories;
	confidence: number;
	reasoning: string;
}

export type APIClassifyRequest = {
	message: string;
	context?: MessageContext[];
};
