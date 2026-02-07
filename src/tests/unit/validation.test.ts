import { describe, expect, it, vi } from "vitest";
import { getUniqueCategories } from "@/lib/helpers/metrics-helpers";
import { Categories } from "@/lib/types";
import { loadConversations } from "@/lib/utils/load-conversations";
import { validateExample } from "@/services/validation-service";

vi.mock("@/services/classify-service", () => {
	return {
		classifyMessage: vi.fn().mockRejectedValue(new Error("gemini error")),
	};
});

describe("Carregar exemplos de conversas", () => {
	it("Deve carregar os exemplos do arquivo JSON corretamente", async () => {
		const examples = await loadConversations();

		expect(examples).toBeDefined();
		expect(Array.isArray(examples)).toBe(true);
		expect(examples.length).toBeGreaterThan(0);
	});

	it("Deve ter a estrutura correta em cada exemplo", async () => {
		const examples = await loadConversations();
		const firstExample = examples[0];

		expect(firstExample).toHaveProperty("id");
		expect(firstExample).toHaveProperty("message");
		expect(firstExample).toHaveProperty("expected_category");
		expect(typeof firstExample.id).toBe("number");
		expect(typeof firstExample.message).toBe("string");
	});

	it("Deve ter categorias válidas em todos os exemplos", async () => {
		const examples = await loadConversations();
		const validCategories = Object.values(Categories);

		examples.forEach((example) => {
			expect(validCategories).toContain(example.expected_category);
		});
	});

	it("Deve retornar erro para categoria sem exemplos", async () => {
		const examples = await loadConversations();
		const categories = getUniqueCategories();

		categories.forEach((category) => {
			const hasExamples = examples.some(
				(example) => example.expected_category === category,
			);

			expect(hasExamples).toBe(true);
		});

		const invalidCategory = "CATEGORIA_INVALIDA";
		const hasExamples = examples.some(
			(example) =>
				example.expected_category === (invalidCategory as Categories),
		);

		expect(hasExamples).toBe(false);
	});

	it("Retorna fallback result quando classifyMessage falha", async () => {
		const example = {
			id: 999,
			message: "Mensagem de teste",
			expected_category: Categories.PedidoCardapio,
		} as {
			id: number;
			message: string;
			expected_category: Categories;
		};

		const result = await validateExample(example);

		expect(result).toBeDefined();
		expect(result.id).toBe(example.id);
		expect(result.predicted).toBe(Categories.Outros);
		expect(result.confidence).toBe(0);
		expect(result.correct).toBe(false);
	});
});
