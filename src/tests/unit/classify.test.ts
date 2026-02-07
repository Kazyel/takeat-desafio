import type { GoogleGenAI } from "@google/genai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Categories } from "@/lib/types";
import { classifyMessage } from "@/services/classify-service";

const configs = {
	apiKey: "x",
	model: "test-model",
	temperature: 0.1,
	maxOutputTokens: 100,
} as const;

type GeminiGenerateContent = GoogleGenAI["models"]["generateContent"];
type GenerateContentMock = ReturnType<typeof vi.fn> & GeminiGenerateContent;

type MockModels = {
	generateContent: GenerateContentMock;
} & Partial<Omit<GoogleGenAI["models"], "generateContent">>;

type MockGemini = {
	models: MockModels;
};

function createMockGemini(): MockGemini {
	const generateContent = vi.fn() as unknown as GenerateContentMock;
	const models: MockModels = { generateContent };
	return { models };
}

describe("classify-service", () => {
	let mockGemini: MockGemini;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGemini = createMockGemini();
	});

	it("Deve parsear resposta do cliente do Gemini", async () => {
		mockGemini.models.generateContent.mockResolvedValueOnce({
			text: '{"category":"PEDIDO_CARDAPIO","confidence":"0.9234"}',
		});

		const res = await classifyMessage("Olá, quero uma pizza", [], {
			gemini: mockGemini as unknown as GoogleGenAI,
			configs,
		});

		expect(res.category).toBe(Categories.PedidoCardapio);
		expect(res.confidence).toBeCloseTo(0.92);
		expect(mockGemini.models.generateContent).toHaveBeenCalledTimes(1);
	});

	it("Deve parsear resposta do cliente do Gemini (context)", async () => {
		mockGemini.models.generateContent.mockResolvedValueOnce({
			text: `
                Beleza! Aqui vai:
                {"category":"STATUS_ENTREGA","confidence":"0.98"}
                Fim.
            `,
		});

		const res = await classifyMessage(
			"Quando chega meu pedido?",
			[
				{ role: "user", content: "Oi, boa noite" },
				{ role: "assistant", content: "Olá! Como posso ajudar?" },
			],
			{
				gemini: mockGemini as unknown as GoogleGenAI,
				configs,
			},
		);

		expect(res.category).toBe(Categories.StatusEntrega);
		expect(res.confidence).toBeCloseTo(0.98);
		expect(mockGemini.models.generateContent).toHaveBeenCalledTimes(1);
	});

	it("Fallback quando resposta inválida", async () => {
		mockGemini.models.generateContent.mockResolvedValueOnce({
			text: "resposta sem JSON válido",
		});

		const res = await classifyMessage("Olá, boa tarde", [], {
			gemini: mockGemini as unknown as GoogleGenAI,
			configs,
		});

		expect(res.category).toBe(Categories.Outros);
		expect(res.confidence).toBe(0);
		expect(mockGemini.models.generateContent).toHaveBeenCalledTimes(1);
	});

	it("Deve lançar erro quando Gemini falhar", async () => {
		mockGemini.models.generateContent.mockRejectedValueOnce(new Error("error"));

		await expect(
			classifyMessage("", [], {
				gemini: mockGemini as unknown as GoogleGenAI,
				configs,
			}),
		).rejects.toThrow();

		expect(mockGemini.models.generateContent).toHaveBeenCalledTimes(1);
	});
});
