import "dotenv/config";

import { OpenidAafAuthClient } from "./auth/aafClient.js";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const authClient = new OpenidAafAuthClient(config.aaf);
const app = createApp({ config, authClient });

const server = app.listen(config.server.port, config.server.host, () => {
  console.log(
    `AAF OIDC Express demo listening at http://${config.server.host}:${config.server.port}`,
  );
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`Received ${signal}; closing HTTP server.`);

    server.close((error) => {
      if (error) {
        console.error(error);
        process.exitCode = 1;
      }

      process.exit();
    });
  });
}
