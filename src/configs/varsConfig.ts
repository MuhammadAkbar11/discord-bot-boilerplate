import dotenv from "dotenv";
import path from "path";

type ModeTypes = "development" | "production" | "testing";

const appDirname = path.resolve();

const mode: ModeTypes = Boolean(process.env.TS_NODE_DEV)
  ? "development"
  : "production";

export const dotenvConfig = dotenv.config({
  path: path.join(appDirname, ".env"),
});

export const ENV_MODE = mode;
export const ROOT_FOLDER = appDirname;
export const MONGO_URL = process.env.MONGO_URL as string;
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID as string;
