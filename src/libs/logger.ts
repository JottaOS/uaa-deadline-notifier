import winston from "winston";
import { IS_PRODUCTION } from "./constants";

const { createLogger, format, transports } = winston;

const { combine, timestamp, errors, colorize, printf, json } = format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, module, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
    return `${timestamp} ${level}:  [${module}] ${message} ${
      stack || ""
    } ${metaString}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = createLogger({
  level: IS_PRODUCTION ? process.env.LOG_LEVEL || "info" : "debug",
  format: IS_PRODUCTION ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

export default logger;
