import cron from "node-cron";

import {
  getPendingNotificationsWithActivity,
  updateNotificationStatus,
} from "../db/notifications";
import { formatNotifications } from "../libs/utils";
import {
  getUpcomingActivities,
  insertActivityWithNotifications,
} from "../services/activities";
import { sendMessage } from "./notifier";
import { WHATSAPP_GROUP_ID } from "../libs/constants";
import baseLogger from "../libs/logger";
import { Module } from "../types";

const EVERY_SIX_HOURS = "0 */6 * * *";
const EVERY_FIVE_MINUTES = "*/5 * * * *";
const logger = baseLogger.child({ module: Module.SCHEDULER });

// const testEvery10Seconds = "*/10 * * * * *";

logger.info("Scheduler initialized");

const scrapingTask = cron.schedule(EVERY_SIX_HOURS, async () => {
  logger.info("Running scraping process");
  try {
    const upcomingActivities = await getUpcomingActivities();

    for (const activity of upcomingActivities) {
      await insertActivityWithNotifications(activity);
    }

    logger.info("Scraping process finished successfully");
  } catch (error) {
    logger.error("Error during automatic scraping process: ", error);
    throw error;
  }
});

const notificationTask = cron.schedule(EVERY_FIVE_MINUTES, async () => {
  logger.info("Running notification check");

  try {
    const pendingNotifications = await getPendingNotificationsWithActivity();

    if (!pendingNotifications.length) {
      logger.info("No pending notifications found.");
      return;
    }

    const message = formatNotifications(pendingNotifications);
    const result = await sendMessage(message, WHATSAPP_GROUP_ID);

    const pendingNotificationIds = pendingNotifications.map(
      (item) => item.notification_id
    );

    await updateNotificationStatus(
      pendingNotificationIds,
      result.success ? "SENT" : "FAILED"
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
