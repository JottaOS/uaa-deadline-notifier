import cron from "node-cron";
import { insertActivityWithNotifications } from "../services/activities";
import { formatScrapedActivities } from "../libs/utils";
import { scrapedMock } from "../libs/constants";

const EVERY_SIX_HOURS = "* * */6 * * *";
const EVERY_FIVE_MINUTES = "* */5 * * * *";

const testEvery10Seconds = "*/10 * * * * *";

console.log("[SYSTEM] Scheduler initialized");

cron.schedule(testEvery10Seconds, async () => {
  console.log(
    "[SYSTEM] Running automating scraping process",
    new Date().toISOString()
  );
  try {
    // const upcomingActivities = await getUpcomingActivities();

    const activities = formatScrapedActivities(scrapedMock);

    const upcomingActivities = activities.filter(
      (activity) => new Date(activity.closing_timestamp) >= new Date()
    );

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
