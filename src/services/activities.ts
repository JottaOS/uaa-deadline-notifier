import baseLogger from "../libs/logger";
import {
  createActivity,
  getActivityById,
  updateActivity,
} from "../db/activities";
import { cancelPendingNotificationsByActivityId } from "../db/notifications";
import { formatScrapedActivities } from "../libs/utils";
import { Scraper } from "../modules/scraper";
import { Module, UpdatedTimestampActivity, type Activity } from "../types";
import { insertNotificationsFromActivity } from "./notifications";

const logger = baseLogger.child({ module: Module.ACTIVITY_SERVICE });

export async function getUpcomingActivities(): Promise<Activity[]> {
  const scraper = new Scraper();

  await scraper.initialize();
  await scraper.login();
  const links = await scraper.getCalendarLinks();
  // const links = ["https://e.uaa.edu.py/mod/forum/view.php?id=320786"];

  const scrapedActivities = [];
  for (const url of links) {
    const activity = await scraper.scrapeActivity(url);
    scrapedActivities.push(activity);
  }

  await scraper.close();

  console.log(scrapedActivities)
  const activities = formatScrapedActivities(scrapedActivities);

  const upcomingActivities = activities.filter(
    (activity) => new Date(activity.closing_timestamp) >= new Date()
  );

  return upcomingActivities;
}

/**
 * Processes an activity by either creating it as new or updating it if it already exists.
 *
 * @param activity - The activity to be processed
 * @returns {Promise<UpdatedTimestampActivity | void>} Returns an object with activity and timestamp details if updated,
 *                                                     void if activity exists but wasn't updated or was newly created
 */
export async function processActivityAndNotifications(
  activity: Activity
): Promise<UpdatedTimestampActivity | void> {
  try {
    const existingActivity = await getActivityById(activity.id);
    if (existingActivity) {
      const previousClosingDate = new Date(existingActivity.closing_timestamp);
      const newClosingDate = new Date(activity.closing_timestamp);

      const hasUpdatedClosingTimestamp =
        previousClosingDate.valueOf() !== newClosingDate.valueOf();
      if (hasUpdatedClosingTimestamp) {
        logger.info(
          `Activity with ID ${activity.id} already exists but has updated closing timestamp. Updating...`,
          { previousClosingDate, newClosingDate }
        );

        await updateActivity(activity);
        logger.info("Activity updated successfully: ", activity);

        await cancelPendingNotificationsByActivityId(activity.id);
        logger.info(
          `Cancelled pending notifications for activity ID ${activity.id}`
        );
        await insertNotificationsFromActivity(activity);

        return { ...activity, previousClosingDate, newClosingDate };
      } else {
        logger.info(
          `Activity with ID ${activity.id} already exists, skipping insertion...`
        );
      }
      return;
    }

    const result = await createActivity(activity);
    logger.info("Activity created successfully: ", result);

    await insertNotificationsFromActivity(activity);
  } catch (error) {
    logger.error(
      "Error inserting activity with notifications",
      activity,
      error
    );
  }
}
