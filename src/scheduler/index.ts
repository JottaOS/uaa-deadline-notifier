import cron from "node-cron";
import {
  getUpcomingActivities,
  insertActivityWithNotifications,
} from "../services/activities";

const EVERY_SIX_HOURS = "0 */6 * * *";
const EVERY_FIVE_MINUTES = "*/5 * * * *";

const testEvery10Seconds = "*/10 * * * * *";

console.log("[SYSTEM] Scheduler initialized");

cron.schedule(EVERY_SIX_HOURS, async () => {
  console.log(
    "[SYSTEM] Running automating scraping process",
    new Date().toISOString()
  );
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
