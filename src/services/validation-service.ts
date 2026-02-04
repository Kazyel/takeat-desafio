import { Categories, type Conversation } from "@/lib/types/generic";
import type { MetricsResponse } from "@/lib/types/metrics";
import type {
	ValidationResponse,
	ValidationResult,
} from "@/lib/types/validation";
import { loadConversations } from "@/lib/utils/load-conversations";
import { calculateMetrics } from "@/lib/utils/metrics-calculator";
import { classifyMessage } from "@/services/gemini-service";

export async function validateExample(
	example: Conversation,
): Promise<ValidationResult> {
	const { id, message, expected_category } = example;

	try {
		const { category, confidence } = await classifyMessage(example.message);

		return {
			id: id,
			message: message,
			expected: expected_category,
			predicted: category,
			confidence: confidence,
			correct: category === expected_category,
		};
	} catch (error) {
		console.error(`Erro ao validar exemplo ${id}:`, error);

		return {
			id,
			message,
			expected: expected_category,
			predicted: Categories.Outros,
			confidence: 0,
			correct: false,
		};
	}
}

export async function validateAllExamples(): Promise<ValidationResponse> {
	const examples = await loadConversations();
	const results: ValidationResult[] = [];

	console.log(`🔍 Validando ${examples.length} exemplos...`);

	for (let i = 0; i < examples.length; i++) {
		const example = examples[i];
		console.log(`   Validando ${i + 1}/${examples.length}: ${example.id}...`);

		const result = await validateExample(example);
		results.push(result);

		if (i < examples.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
	}

	const metrics = calculateMetrics(results);

	console.log(
		`✅ Validação concluída: ${metrics.totalCorrect}/${examples.length} corretos (${metrics.accuracy}%)`,
	);

	return {
		total: examples.length,
		correct: metrics.totalCorrect,
		accuracy: metrics.accuracy,
		results,
	};
}

export async function calculateDetailedMetrics(): Promise<MetricsResponse> {
	const validation = await validateAllExamples();
	const metrics = calculateMetrics(validation.results);

	return {
		accuracy: metrics.accuracy,
		totalResults: validation.total,
		totalCorrect: metrics.totalCorrect,
		categoryMetrics: metrics.categoryMetrics,
	};
}
