import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Categories, type Conversation } from "@/lib/types/generic";

const EXAMPLES_PATH = join(
	process.cwd(),
	"src",
	"lib",
	"data",
	"conversations.json",
);

export async function loadConversations(): Promise<Conversation[]> {
	try {
		const fileContent = await readFile(EXAMPLES_PATH, "utf-8");
		const data = JSON.parse(fileContent);
		const allExamples = data.conversations || data;

		if (!Array.isArray(allExamples)) {
			throw new Error(
				'O arquivo de exemplos deve conter um array "conversations"',
			);
		}

		for (const example of allExamples) {
			if (!example.id || !example.message || !example.expected_category) {
				throw new Error(
					`Exemplo ${example.id} inválido: deve ter id, message e expected_category`,
				);
			}

			if (!Object.values(Categories).includes(example.expected_category)) {
				throw new Error(
					`Categoria inválida no exemplo ${example.id}: ${example.expected_category}`,
				);
			}
		}

		return allExamples;
	} catch (error) {
		console.error("Erro ao carregar exemplos:", error);
		throw new Error(`Falha ao carregar arquivo de exemplos: ${error}`);
	}
}
