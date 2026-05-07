import pino from "pino";

const isDev = Boolean(process.env.TS_NODE_DEV);

/**
 * Centralized logger instance using pino.
 * In development, it uses pino-pretty for human-readable logs.
 * In production, it outputs structured JSON for better observability.
 */
const logger = pino({
  level: isDev ? "debug" : "info",
  base: {
    pid: false,
    hostname: false,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
    : undefined,
});

export default logger;
