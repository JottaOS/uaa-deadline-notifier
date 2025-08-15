import cron from "node-cron";

import { getPendingNotificationsWithActivity } from "../db/notifications";
import { formatNotifications } from "../libs/utils";
import {
  getUpcomingActivities,
  insertActivityWithNotifications,
} from "../services/activities";

const EVERY_SIX_HOURS = "0 */6 * * *";
const EVERY_FIVE_MINUTES = "*/5 * * * *";

const testEvery10Seconds = "*/10 * * * * *";

console.log("[SYSTEM] Scheduler initialized");

cron.schedule(EVERY_SIX_HOURS, async () => {
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

cron.schedule(testEvery10Seconds, async () => {
  console.log("[SYSTEM] Running notification check", new Date().toISOString());

  try {
    const pendingNotifications = await getPendingNotificationsWithActivity();

    if (!pendingNotifications.length) {
      console.log("[SYSTEM] No pending notifications found.");
      return;
    }

    const message = formatNotifications(pendingNotifications);
    console.log(message);

    console.log("[SYSTEM] Notifications processed", new Date().toISOString());
  } catch (error) {
    console.error("[SYSTEM] Error during notification check: ", error);
  }
});
