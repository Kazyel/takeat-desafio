import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		exclude: ["node_modules/", "./src/tests/integration.test.ts"],
		environment: "node",
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
