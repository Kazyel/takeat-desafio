import z from "zod";
import { Categories } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 200;

export const messageContextSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z
		.string()
		.min(1, "O campo 'content' é obrigatório e não pode ser vazio."),
});

export const messageSchema = z.object({
	message: z
		.string()
		.min(1, "O campo 'message' é obrigatório e não pode ser vazio.")
		.max(
			MAX_MESSAGE_LENGTH,
			"O campo 'message' não pode exceder 200 caracteres.",
		),
});

export const classifyRequestSchema = z.object({
	message: z
		.string()
		.min(1, "O campo 'message' é obrigatório e não pode ser vazio.")
		.max(
			MAX_MESSAGE_LENGTH,
			"O campo 'message' não pode exceder 200 caracteres.",
		)
		.transform((msg) => msg.trim()),

	context: z.array(messageContextSchema).optional().default([]),
});

export const classifyResponseSchema = z.object({
	category: z.enum(Categories),
	confidence: z.number().min(0).max(1),
	reasoning: z.string(),
});

export type MessageWithContext = z.infer<typeof messageContextSchema>;
export type Message = z.infer<typeof messageSchema>;
export type APIClassifyRequest = z.infer<typeof classifyRequestSchema>;
export type APIClassifyResponse = z.infer<typeof classifyResponseSchema>;

export type ClassifyResult = z.infer<typeof classifyResponseSchema> & {
	fromCache: boolean;
};
