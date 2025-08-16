import express from "express";
import cors from "cors";
import { router as scraperRouter } from "./api/scraper.route";
import "./modules/scheduler";
import "./modules/notifier";
import logger from "./libs/logger";
import { Module } from "./types";

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/scraper", scraperRouter);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { module: Module.API });
});

export default app;
