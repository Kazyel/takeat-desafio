import { delay, logProgress } from "@/lib/helpers/validation-helpers";
import { Categories, type Conversation } from "@/lib/types/generic";
import type {
	ValidationResponse,
	ValidationResult,
} from "@/lib/types/validation";
import { loadConversations } from "@/lib/utils/load-conversations";
import { classifyMessage } from "@/services/classify-service";
import { calculateMetrics } from "./metrics-service";

const VALIDATION_DELAY_MS = 3000;

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
	const allExamples = await loadConversations();
	const validationResults: ValidationResult[] = [];

	console.log(`🔍 Validando ${allExamples.length} exemplos...`);

	for (let i = 0; i < allExamples.length; i++) {
		const singleExample = allExamples[i];

		logProgress(i, allExamples.length, singleExample.id);

		try {
			const validatedResult = await validateExample(singleExample);
			validationResults.push(validatedResult);
		} catch (err) {
			console.error(`Erro ao validar exemplo ${singleExample.id}:`, err);
		}

		if (i < allExamples.length - 1) {
			delay(VALIDATION_DELAY_MS);
		}
	}

	const calculatedMetrics = calculateMetrics(validationResults);

	console.log(
		`✅ Validação concluída: ${calculatedMetrics.totalCorrect}/${allExamples.length} corretos (${calculatedMetrics.accuracy}%)`,
	);

	return {
		total: allExamples.length,
		correct: calculatedMetrics.totalCorrect,
		results: validationResults,
	};
}
