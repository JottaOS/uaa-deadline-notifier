import { Router } from "express";
import { getActivities, test } from "./scraper.controller";

export const router = Router();

router.get("/activities", getActivities);
router.get("/test", test);
