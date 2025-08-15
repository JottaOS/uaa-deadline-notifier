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

const EVERY_SIX_HOURS = "0 */6 * * *";
const EVERY_FIVE_MINUTES = "*/5 * * * *";

// const testEvery10Seconds = "*/10 * * * * *";

console.log("[SYSTEM] Scheduler initialized");

const scrapingTask = cron.schedule(EVERY_SIX_HOURS, async () => {
  console.log("[SYSTEM] Running scraping process", new Date().toISOString());
  try {
    const upcomingActivities = await getUpcomingActivities();

    for (const activity of upcomingActivities) {
      await insertActivityWithNotifications(activity);
    }

    console.log(
      "[SYSTEM] Scraping process finished successfully",
      new Date().toISOString()
    );
  } catch (error) {
    console.error("[SYSTEM] Error during automatic scraping process: ", error);
    throw error;
  }
});

const notificationTask = cron.schedule(EVERY_FIVE_MINUTES, async () => {
  console.log("[SYSTEM] Running notification check", new Date().toISOString());

  try {
    const pendingNotifications = await getPendingNotificationsWithActivity();

    if (!pendingNotifications.length) {
      console.log("[SYSTEM] No pending notifications found.");
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

    console.log("[SYSTEM] Notifications processed", new Date().toISOString());
  } catch (error) {
    console.error("[SYSTEM] Error during notification check: ", error);
  }
});

scrapingTask.on("execution:missed", async () => {
  console.log("[SYSTEM] Reattempting missed scrapingTask execution...");
  await scrapingTask.execute();
  console.log("[SYSTEM] Reattempt successful");
});

notificationTask.on("execution:missed", async () => {
  console.log("[SYSTEM] Reattempting missed notificationTask execution...");
  await notificationTask.execute();
  console.log("[SYSTEM] Reattempt successful");
});
