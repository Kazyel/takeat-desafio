import type { APIClassifyResponse } from "@/lib/schemas/classify.schema";

export class BasicCache {
	private cache: Map<string, APIClassifyResponse>;

	constructor() {
		this.cache = new Map<string, APIClassifyResponse>();
	}

	has(key: string): boolean {
		return this.cache.has(key);
	}

	get(key: string): APIClassifyResponse | null {
		const cachedValue = this.cache.get(key);
		if (cachedValue) {
			return cachedValue;
		}
		return null;
	}

	set(key: string, value: APIClassifyResponse): void {
		this.cache.set(key, value);
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	size(): number {
		return this.cache.size;
	}

	generateKey(message: string): string {
		return message.trim().toLowerCase();
	}
}
