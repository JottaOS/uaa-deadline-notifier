import "./modules/scheduler";
import "./modules/notifier";
import logger from "./libs/logger";
import { Module } from "./types";

logger.info("Cron worker started (scheduled tasks only)", {
  module: Module.SCHEDULER,
});