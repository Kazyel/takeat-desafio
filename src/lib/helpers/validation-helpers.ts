import { logger } from "@/middlewares/logger";

export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function logProgress(index: number, total: number, id: number): void {
	logger.info(`   Validando ${index + 1}/${total}: ${id}...`);
}
