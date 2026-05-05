import CustomClient from "./base/classes/CustomClient";
import { ENV_MODE } from "./configs/varsConfig";
import logger from "./lib/logger";

logger.info({ event: "startup", mode: ENV_MODE }, `Application starting in ${ENV_MODE} mode`);

const client = new CustomClient();
client.Init();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => client.Shutdown());
});
