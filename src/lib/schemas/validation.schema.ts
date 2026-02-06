import z from "zod";
import { Categories } from "../types";

export const validationResultSchema = z.object({
	id: z.number().int().nonnegative(),
	message: z.string(),
	expected: z.enum(Categories),
	predicted: z.enum(Categories),
	confidence: z.number().min(0).max(1),
	correct: z.boolean(),
});

export const validationResponseSchema = z.object({
	total: z.number().int().nonnegative(),
	correct: z.number().int().nonnegative(),
	results: z.array(validationResultSchema),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;
export type ValidationResponse = z.infer<typeof validationResponseSchema>;
