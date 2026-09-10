import cron from "node-cron";

import {
  getPendingNotificationsWithActivity,
  updateNotificationStatus,
} from "../db/notifications";
import {
  formatNotifications,
  formatUpdatedActivitiesMessage,
} from "../libs/utils";
import {
  getUpcomingActivities,
  processActivityAndNotifications,
} from "../services/activities";
import { notifier } from "./notifier";
import baseLogger from "../libs/logger";
import { Module } from "../types";

const EVERY_SIX_HOURS = "0 */6 * * *";
const EVERY_FIVE_MINUTES = "*/5 * * * *";
const logger = baseLogger.child({ module: Module.SCHEDULER });

// const testEvery10Seconds = "*/10 * * * * *";

logger.info("Scheduler initialized");

let isScraping = false;

const scrapingTask = cron.schedule(EVERY_SIX_HOURS, async () => {
  if (isScraping) {
    logger.info("Scraping process already running, skipping this execution");
    return;
  }

  isScraping = true;
  logger.info("Running scraping process");
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

    logger.info("Scraping process finished successfully");
  } catch (error) {
    logger.error("Error during automatic scraping process: ", error);
  } finally {
    isScraping = false;
  }
});

const notificationTask = cron.schedule(EVERY_FIVE_MINUTES, async () => {
  logger.info("Running notification check");

  try {
    logger.info("Querying pending notifications with activities");
    const pendingNotifications = await getPendingNotificationsWithActivity();

    if (!pendingNotifications.length) {
      logger.info("No pending notifications found.");
      return;
    }

    logger.info("Notifications found", pendingNotifications);
    const message = formatNotifications(pendingNotifications);
    const result = await notifier.send(message);

    const pendingNotificationIds = pendingNotifications.map(
      (item) => item.notification_id,
    );

    await updateNotificationStatus(
      pendingNotificationIds,
      result.success ? "SENT" : "FAILED",
    );

    logger.info("Notifications processed");
  } catch (error) {
    logger.error("Error during notification check: ", error);
  }
});

scrapingTask.on("execution:missed", async () => {
  logger.info("Reattempting missed scrapingTask execution...");
  await scrapingTask.execute();
  logger.info("scrapingTask reattempt successful");
});

notificationTask.on("execution:missed", async () => {
  logger.info("Reattempting missed notificationTask execution...");
  await notificationTask.execute();
  logger.info("notificationTask reattempt successful");
});
