import type { Request, Response } from "express";
import {
  getUpcomingActivities,
  processActivityAndNotifications,
} from "../services/activities";
import baseLogger from "../libs/logger";
import { Module } from "../types";
import {
  formatScrapedActivities,
  formatUpdatedActivitiesMessage,
} from "../libs/utils";
import { scrapedMock } from "../libs/constants";
import { notifier } from "../modules/notifier";

const logger = baseLogger.child({ module: Module.API });

export const getActivities = async (req: Request, res: Response) => {
  // Could be a middleware but...
  logger.info("Received /api/activities request");
  try {
    const upcomingActivities = await getUpcomingActivities();

    const updatedActivities = [];
    for (const activity of upcomingActivities) {
      const updatedActivity = await processActivityAndNotifications(activity);
      if (updatedActivity) {
        updatedActivities.push(updatedActivity);
      }
    }

    if (updatedActivities.length > 0) {
      logger.info(`Updated activities found. Sending message...`);
      const message = formatUpdatedActivitiesMessage(updatedActivities);
      await notifier.send(message);
    }

    logger.info("/api/activities response", upcomingActivities);
    res.status(200).json({
      success: true,
      data: upcomingActivities,
    });
  } catch (error) {
    baseLogger.error("Error in getActivities", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activities",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const test = async (req: Request, res: Response) => {
  const activities = formatScrapedActivities(scrapedMock);

  const upcomingActivities = activities.filter(
    (activity) => new Date(activity.closing_timestamp) >= new Date()
  );

  for (const activity of upcomingActivities) {
    await processActivityAndNotifications(activity);
  }

  res.status(200).json({
    success: true,
    // data: upcomingActivities,
  });
};
