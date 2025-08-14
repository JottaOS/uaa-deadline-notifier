import type { Request, Response } from "express";
import { Scraper } from "../scraper";
import { scrapedMock } from "../libs/constants";
import { formatScrapedActivities } from "../libs/utils";
import { insertActivityWithNotifications } from "../services/activities";

export const getActivities = async (req: Request, res: Response) => {
  try {
    const scraper = new Scraper();

    await scraper.initialize();
    await scraper.login();
    const links = await scraper.getCalendarLinks();

    const scrapedActivities = [];
    for (const url of links) {
      const activity = await scraper.scrapeActivity(url);
      scrapedActivities.push(activity);
    }

    await scraper.close();

    const activities = formatScrapedActivities(scrapedActivities);

    const upcomingActivities = activities.filter(
      (activity) => new Date(activity.closing_timestamp) >= new Date()
    );

    for (const activity of upcomingActivities) {
      insertActivityWithNotifications(activity);
    }

    res.status(200).json({
      success: true,
      data: upcomingActivities,
    });
  } catch (error) {
    console.error("Error in controller:", error);
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
    insertActivityWithNotifications(activity);
  }

  res.status(200).json({
    success: true,
    data: upcomingActivities,
  });
};
