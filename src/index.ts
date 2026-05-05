import CustomClient from "./base/classes/CustomClient";
import * as envConfig from "./configs/varsConfig";

envConfig.dotenvConfig;

console.log(`MODE : ${envConfig.ENV_MODE}`);

new CustomClient().Init();
