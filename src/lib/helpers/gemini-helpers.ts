import { CLASSIFICATION_PROMPT } from "@/lib/config/prompt";
import type { APIClassifyResponse } from "@/lib/types/api";
import { Categories, type MessageContext } from "@/lib/types/generic";

function extractCleanJson(text: string): string {
	const match = text.match(/\{[\s\S]*\}/);
	if (!match) throw new Error("Nenhum JSON encontrado na resposta");

	return match[0].replace(/,(\s*})/g, "$1");
}

export function generatePrompt(
	message: string,
	context: MessageContext[] = [],
): string {
	const formattedContext = context
		.map(
			(msg, i) =>
				`${i + 1}) ${msg.role === "user" ? "Cliente" : "Atendente"}: ${
					msg.content
				}`,
		)
		.join("\n");

	return `${CLASSIFICATION_PROMPT}

      ${
				context.length > 0
					? `**HISTÓRICO DA CONVERSA:**\n${formattedContext}\n`
					: ""
			}

      **NOVA MENSAGEM DO CLIENTE:**
        "${message}"

      Se houver HISTÓRICO DA CONVERSA, use-o para entender a intenção da ÚLTIMA mensagem do cliente.
      A classificação deve SEMPRE se referir à ÚLTIMA mensagem.
  `;
}

export function parseGeminiResponse(response: string): APIClassifyResponse {
	try {
		const parsedResponse = JSON.parse(extractCleanJson(response));

		if (!Object.values(Categories).includes(parsedResponse.category)) {
			throw new Error(`Categoria inválida: $parsedResponse.category`);
		}

		let confidence = parseFloat(parsedResponse.confidence);

		if (Number.isNaN(confidence) || confidence < 0 || confidence > 1) {
			confidence = 0.5;
		}

		return {
			category: parsedResponse.category as Categories,
			confidence: Math.round(confidence * 100) / 100,
			reasoning: parsedResponse.reasoning,
		};
	} catch (error) {
		console.error("Erro ao parsear resposta do Gemini:", error);
		console.error("Resposta original:", response);

		return {
			category: Categories.Outros,
			confidence: 0,
			reasoning: "Resposta inválida",
		};
	}
}
