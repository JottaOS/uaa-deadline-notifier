import express from "express";
import cors from "cors";
import { router as scraperRouter } from "./api/scraper.route";
import "./scheduler";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/scraper", scraperRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
