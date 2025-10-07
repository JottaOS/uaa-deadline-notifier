import { REMINDER_TIMES } from "../libs/constants";
import { Activity, Module } from "../types";
import baseLogger from "../libs/logger";
import { createNotification } from "../db/notifications";

const logger = baseLogger.child({ module: Module.NOTIFICATION_SERVICE });

export const insertNotificationsFromActivity = async (activity: Activity) => {
  const closingDate = new Date(activity.closing_timestamp);

  REMINDER_TIMES.forEach(async (reminder) => {
    const notificationTime = new Date(closingDate.valueOf() - reminder);

    if (new Date().valueOf() >= notificationTime.valueOf()) {
      logger.info(
        `Notification time (${notificationTime.toISOString()}) for activity ${
          activity.id
        } is in the past, skipping insertion...`
      );
      return;
    }

    logger.info(
      `Creating notification for activity ${activity.id} at ${notificationTime}`
    );

    await createNotification({
      activity_id: activity.id,
      send_at: notificationTime.toISOString(),
    });
  });
};
