import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { configServer } from "./config/serverConfig.js";
import mainRouter from "./routes/main.route.ts";
import { appErrorHandler } from "./middlewares/error.middleware.ts";
import {
  consoleLogs,
  defaultLogs,
} from "./config/morgan.logger.config.ts";
import { logger } from "./config/winston.logger.config.ts";
import { attactCorelationId } from "./middlewares/corelation.middleware.ts";

const app = express();

app.disable("x-powered-by");
app.use(helmet());

const frontendOrigin = process.env.FRONTEND_ORIGIN;

if (!frontendOrigin) {
  throw new Error("FRONTEND_ORIGIN must be configured");
}

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(defaultLogs);
app.use(consoleLogs);
app.use(attactCorelationId);

app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

app.use("/api/v1", mainRouter);
app.use(appErrorHandler);

app.listen(configServer.PORT, () => {
  console.log(`Server Running on Port: ${configServer.PORT}`);
  logger.info("Server started");
});