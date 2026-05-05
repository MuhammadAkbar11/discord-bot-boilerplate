import CustomClient from "./base/classes/CustomClient";
import { ENV_MODE } from "./configs/varsConfig";

console.log(`MODE : ${ENV_MODE}`);

const client = new CustomClient();
client.Init();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => client.Shutdown());
});
