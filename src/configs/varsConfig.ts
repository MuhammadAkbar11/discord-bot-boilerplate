import dotenv from "dotenv";
import path from "path";
import logger from "../lib/logger";

type ModeTypes = "development" | "production" | "testing";

const appDirname = path.resolve();

const mode: ModeTypes = Boolean(process.env.TS_NODE_DEV)
  ? "development"
  : "production";

dotenv.config({
  path: path.join(appDirname, ".env"),
});

/**
 * Validates that all required environment variables are present.
 * If any are missing, it logs a clear error message and exits the process.
 */
const validateEnv = () => {
  const missing: string[] = [];

  const check = (key: string) => {
    if (!process.env[key] || process.env[key]?.trim() === "") {
      missing.push(key);
    }
  };

  // Always required
  check("MONGO_URL");

  if (mode === "production") {
    check("DISCORD_TOKEN");
    check("DISCORD_CLIENT_ID");
  } else {
    // Development mode requirements
    if (!process.env.DEV_DISCORD_TOKEN && !process.env.DISCORD_TOKEN) {
      missing.push("DISCORD_TOKEN (or DEV_DISCORD_TOKEN)");
    }
    if (!process.env.DEV_DISCORD_CLIENT_ID && !process.env.DISCORD_CLIENT_ID) {
      missing.push("DISCORD_CLIENT_ID (or DEV_DISCORD_CLIENT_ID)");
    }
    // DEV_GUILD_ID is important for instant command registration in dev
    if (!process.env.DEV_GUILD_ID && !process.env.DISCORD_GUILD_ID) {
      missing.push("DEV_GUILD_ID (or DISCORD_GUILD_ID)");
    }
  }

  if (missing.length > 0) {
    logger.error(
      {
        event: "config_error",
        missing,
        help: "Check your .env file or .env.example",
      },
      "Missing required environment variables"
    );
    process.exit(1);
  }
};

validateEnv();

export const ENV_MODE = mode;
export const ROOT_FOLDER = appDirname;
export const MONGO_URL = process.env.MONGO_URL as string;

// Production
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;

// Development
export const DEV_DISCORD_TOKEN = process.env.DEV_DISCORD_TOKEN as string;
export const DEV_DISCORD_CLIENT_ID = process.env.DEV_DISCORD_CLIENT_ID as string;
export const DEV_GUILD_ID = (process.env.DEV_GUILD_ID || process.env.DISCORD_GUILD_ID) as string;
