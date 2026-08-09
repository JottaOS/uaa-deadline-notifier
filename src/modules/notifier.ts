import { NOTIFICATION_PROVIDER } from "../libs/constants";
import { createNotificationProvider } from "../providers/factory";
import { NotificationProvider } from "../types";

export const notifier: NotificationProvider = createNotificationProvider(
  NOTIFICATION_PROVIDER,
);
