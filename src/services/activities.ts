import { createActivity, getActivityById } from "../db/activities";
import { createNotification } from "../db/notifications";
import { REMINDER_TIMES } from "../libs/constants";
import type { Activity } from "../types";

export async function insertActivityWithNotifications(activity: Activity) {
  try {
    const existingActivity = await getActivityById(activity.id);
    if (existingActivity) {
      console.debug(
        `Activity with ID ${activity.id} already exists, skipping insertion...`
      );
      return;
    }

    const result = await createActivity(activity);
    console.debug("Activity created successfully: ", result);

    const closingDate = new Date(activity.closing_timestamp);

    REMINDER_TIMES.forEach(async (reminder) => {
      const notificationTime = new Date(
        closingDate.valueOf() - reminder
      ).toISOString();

      console.debug(
        `Creating notification for activity ${activity.id} at ${notificationTime}`
      );
      await createNotification({
        activity_id: activity.id,
        send_at: notificationTime,
      });
    });
  } catch (error) {
    console.error("Error inserting activity with notifications:", error);
    throw error;
  }
}
