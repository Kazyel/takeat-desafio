import { delay, logProgress } from "@/lib/helpers/validation-helpers";
import type {
	ValidationResponse,
	ValidationResult,
} from "@/lib/schemas/validation.schema";
import { Categories, type Conversation } from "@/lib/types";

import { loadConversations } from "@/lib/utils/load-conversations";
import { parseApiError } from "@/lib/utils/parse-api-error";
import { logger } from "@/middlewares/logger";
import { classifyMessage } from "@/services/classify-service";
import { calculateMetrics } from "@/services/metrics-service";

const VALIDATION_DELAY_MS = 8000;

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
		logger.error({
			event: "validate_example_failed",
			error: parseApiError(error),
		});

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

	logger.info(`🔍 Validando ${allExamples.length} exemplos...`);

	for (let i = 0; i < allExamples.length; i++) {
		const singleExample = allExamples[i];

		logProgress(i, allExamples.length, singleExample.id);

		try {
			const validatedResult = await validateExample(singleExample);
			validationResults.push(validatedResult);
		} catch (err) {
			logger.error({
				event: "validate_example_failed",
				exampleId: singleExample.id,
				error: parseApiError(err),
			});
		}

		if (i < allExamples.length - 1) {
			delay(VALIDATION_DELAY_MS);
		}
	}

	const calculatedMetrics = calculateMetrics(validationResults);

	logger.info(
		`✅ Validação concluída: ${calculatedMetrics.correctPredictions}/${allExamples.length} corretos (${calculatedMetrics.accuracy}%)`,
	);

	return {
		total: allExamples.length,
		correct: calculatedMetrics.correctPredictions,
		results: validationResults,
	};
}
