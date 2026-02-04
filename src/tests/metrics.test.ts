import { describe, expect, it } from "vitest";
import { Categories } from "@/lib/types/generic";

import type { ValidationResult } from "@/lib/types/validation";
import { calculateMetrics } from "@/lib/utils/metrics-calculator";

describe("Calcular métricas", () => {
	it("Deve calcular acurácia de 100% quando todas as previsões estão corretas", () => {
		const results: ValidationResult[] = [
			{
				id: 1,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.PedidoCardapio,
				confidence: 0.95,
				correct: true,
			},
			{
				id: 2,
				message: "test",
				expected: Categories.Elogio,
				predicted: Categories.Elogio,
				confidence: 0.98,
				correct: true,
			},
		];

		const metrics = calculateMetrics(results);

		expect(metrics.accuracy).toBe(100);
		expect(metrics.totalCorrect).toBe(2);
		expect(metrics.totalResults).toBe(2);
	});

	it("Deve calcular acurácia de 50% quando metade está errada", () => {
		const results: ValidationResult[] = [
			{
				id: 1,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.PedidoCardapio,
				confidence: 0.95,
				correct: true,
			},
			{
				id: 2,
				message: "test",
				expected: Categories.Elogio,
				predicted: Categories.Reclamacao,
				confidence: 0.6,
				correct: false,
			},
		];

		const metrics = calculateMetrics(results);

		expect(metrics.accuracy).toBe(50);
		expect(metrics.totalCorrect).toBe(1);
		expect(metrics.totalResults).toBe(2);
	});

	it("Deve calcular precisão, recall e f1-score corretamente", () => {
		const results: ValidationResult[] = [
			{
				id: 1,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.PedidoCardapio,
				confidence: 0.95,
				correct: true,
			},
			{
				id: 2,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.PedidoCardapio,
				confidence: 0.95,
				correct: true,
			},
			{
				id: 3,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.PedidoCardapio,
				confidence: 0.95,
				correct: true,
			},
			{
				id: 4,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.PedidoCardapio,
				confidence: 0.95,
				correct: true,
			},
			{
				id: 5,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.Outros,
				confidence: 0.6,
				correct: false,
			},
			{
				id: 6,
				message: "test",
				expected: Categories.Outros,
				predicted: Categories.PedidoCardapio,
				confidence: 0.65,
				correct: false,
			},
		];

		const metrics = calculateMetrics(results);
		const pedidoMetrics = metrics.categoryMetrics.find(
			(metric) => metric.category === Categories.PedidoCardapio,
		);

		expect(pedidoMetrics).toBeDefined();
		// Precisão: 4 VP / (4 VP + 1 FP) = 4/5 = 80%
		expect(pedidoMetrics?.precision).toBe(80);
		// Recall: 4 VP / (4 VP + 1 FN) = 4/5 = 80%
		expect(pedidoMetrics?.recall).toBe(80);
		// F1: 2 * (80 * 80) / (80 + 80) = 80
		expect(pedidoMetrics?.f1Score).toBe(80);
		expect(pedidoMetrics?.samples).toBe(5);
	});

	it("Deve retornar 0 para métricas quando não há exemplos da categoria", () => {
		const results: ValidationResult[] = [
			{
				id: 1,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.PedidoCardapio,
				confidence: 0.95,
				correct: true,
			},
		];

		const metrics = calculateMetrics(results);
		const ElogioMetrics = metrics.categoryMetrics.find(
			(metric) => metric.category === Categories.Elogio,
		);

		expect(ElogioMetrics).toBeDefined();
		expect(ElogioMetrics?.precision).toBe(0);
		expect(ElogioMetrics?.recall).toBe(0);
		expect(ElogioMetrics?.f1Score).toBe(0);
		expect(ElogioMetrics?.samples).toBe(0);
	});

	it("Deve ter métricas para todas as 5 categorias", () => {
		const results: ValidationResult[] = [
			{
				id: 1,
				message: "test",
				expected: Categories.PedidoCardapio,
				predicted: Categories.PedidoCardapio,
				confidence: 0.95,
				correct: true,
			},
		];

		const metrics = calculateMetrics(results);

		expect(metrics.categoryMetrics).toHaveLength(5);
		expect(metrics.categoryMetrics.map((metric) => metric.category)).toEqual([
			Categories.PedidoCardapio,
			Categories.StatusEntrega,
			Categories.Reclamacao,
			Categories.Elogio,
			Categories.Outros,
		]);
	});
});
