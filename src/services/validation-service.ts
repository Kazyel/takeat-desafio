import {
  type Conversation,
  type ValidationResult,
  type ValidationResponse,
  type MetricsResponse,
  Categories,
} from "@/lib/types";

import { join } from "path";
import { readFile } from "fs/promises";

import { classifyMessage } from "@/services/gemini-service";
import { calculateMetrics } from "@/lib/utils/metrics-calculator";

const EXAMPLES_PATH = join(process.cwd(), "src", "lib", "data", "conversations.json");

export async function loadExamples(): Promise<Conversation[]> {
  try {
    const fileContent = await readFile(EXAMPLES_PATH, "utf-8");

    const data = JSON.parse(fileContent);
    const examples = data.conversations || data;

    if (!Array.isArray(examples)) {
      throw new Error('O arquivo de exemplos deve conter um array "conversations"');
    }

    examples.forEach((example, index) => {
      if (!example.id || !example.message || !example.expected_category) {
        throw new Error(
          `Exemplo ${index} inválido: deve ter id, message e expected_category`
        );
      }

      if (!Object.values(Categories).includes(example.expected_category)) {
        throw new Error(
          `Categoria inválida no exemplo ${example.id}: ${example.expected_category}`
        );
      }
    });

    return examples;
  } catch (error) {
    console.error("Erro ao carregar exemplos:", error);
    throw new Error(`Falha ao carregar arquivo de exemplos: ${error}`);
  }
}

async function validateExample(example: Conversation): Promise<ValidationResult> {
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
  const examples = await loadExamples();
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
    `✅ Validação concluída: ${metrics.totalCorrect}/${examples.length} corretos (${metrics.accuracy}%)`
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
