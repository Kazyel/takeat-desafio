type ErrorLogMessage = {
	message: string;
	stack: string | undefined;
};

export function parseApiError(error: unknown): ErrorLogMessage {
	const message = error instanceof Error ? error.message : String(error);
	const stackFirstLine =
		error instanceof Error && error.stack
			? error.stack.split("\n")[0]
			: undefined;

	return {
		message,
		stack: stackFirstLine,
	};
}
