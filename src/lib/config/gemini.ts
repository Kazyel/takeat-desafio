type GeminiConfig = {
	apiKey: string;
	model: string;
	temperature: number;
	maxOutputTokens: number;
};

export function getGeminiConfig(): GeminiConfig {
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error(
			"GEMINI_API_KEY não encontrada. Configure a variável de ambiente no arquivo .env",
		);
	}

	return {
		apiKey,
		model: process.env.GEMINI_MODEL || "gemma-3-27b-it",
		temperature: 0.1,
		maxOutputTokens: 500,
	};
}
