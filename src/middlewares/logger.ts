import type { Context, Next } from "hono";
import pino from "pino";

export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "SYS:standard",
			ignore: "pid,hostname",
		},
	},
});

export const pinoLogger = async (c: Context, next: Next) => {
	await next();

	logger.info({
		method: c.req.method,
		path: c.req.path,
		status: c.res.status,
	});
};
