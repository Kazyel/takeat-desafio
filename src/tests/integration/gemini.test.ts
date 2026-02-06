import { describe, expect, it } from "vitest";
import { getUniqueCategories } from "@/lib/helpers/metrics-helpers";
import { loadConversations } from "@/lib/utils/load-conversations";
import { validateExample } from "@/services/validation-service";

/**
 *  Testes de integração - GEMINI API
 *
 *  Testes que validam os exemplos de conversas
 *  fazendo chamadas à API do Gemini.
 *
 *  São demorados, já que estou usando um modelo de conversa que demora.
 *
 *  Para rodar esse teste, rode o comando `bun run test:integration`
 */

describe("Testes de integração - GEMINI API", () => {
	describe("Validar exemplos de conversas", () => {
		it("Deve validar um único exemplo corretamente", async () => {
			const allExamples = await loadConversations();
			const singleExample = allExamples[0];

			const result = await validateExample(singleExample);

			expect(result).toBeDefined();
			expect(result.id).toBe(singleExample.id);
			expect(result.message).toBe(singleExample.message);
			expect(result.expected).toBe(singleExample.expected_category);
			expect(result.predicted).toBe(singleExample.expected_category);
			expect(result.correct).toBe(true);
		}, 15000);

		it(
			"Deve validar um exemplo de cada categoria corretamente",
			async () => {
				const allExamples = await loadConversations();
				const validCategories = getUniqueCategories();

				for (const category of validCategories) {
					const example = allExamples.find(
						(example) => example.expected_category === category,
					);

					if (!example) {
						throw new Error(
							`Nenhum exemplo encontrado para a categoria ${category}`,
						);
					}

					const result = await validateExample(example);

					expect(result).toBeDefined();
					expect(result.id).toBe(example.id);
					expect(result.message).toBe(example.message);
					expect(result.expected).toBe(example.expected_category);
					expect(result.predicted).toBe(example.expected_category);
					expect(result.correct).toBe(true);
				}
			},
			1000 * 60 * 5,
		);
	});
});
