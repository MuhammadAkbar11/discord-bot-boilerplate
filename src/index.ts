import CustomClient from "./base/classes/CustomClient";
import { ENV_MODE } from "./configs/varsConfig";
import logger from "./lib/logger";
import ErrorHandler from "./lib/errors/ErrorHandler";

logger.info(
  { event: "startup", mode: ENV_MODE },
  `Application starting in ${ENV_MODE} mode`,
);

const client = new CustomClient();
client.Init();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => client.Shutdown());
});

process.on("unhandledRejection", (reason: Error) => {
  ErrorHandler.handle(reason);
});

process.on("uncaughtException", (error: Error) => {
  ErrorHandler.handle(error);
});
