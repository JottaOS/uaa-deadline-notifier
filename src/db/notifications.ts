import type {
  Notification,
  NotificationStatus,
  NotificationWithActivity,
} from "../types";
import pool from "./config";

export async function createNotification(
  notification: Omit<Notification, "id" | "created_at" | "status">
) {
  const query = `
    INSERT INTO notification (activity_id, send_at)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [notification.activity_id, notification.send_at];
  try {
    const result = await pool.query(query, values);
    return result.rows[0] as Notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function getPendingNotificationsWithActivity() {
  const query = `
   SELECT 
      n.id AS notification_id,
      n.activity_id,
      n.send_at,
      a.course_id,
      a.course_title,
      a.closing_timestamp,
      a.title,
      a.url
    FROM notification n
    JOIN activity a ON a.id = n.activity_id
    WHERE n.status = 'PENDING'
      AND n.send_at <= NOW()
    ORDER BY a.closing_timestamp ASC
  `;
  const result = await pool.query(query);
  return result.rows as NotificationWithActivity[];
}

export async function updateNotificationStatus(
  ids: number[],
  status: NotificationStatus
) {
  const query = `
    UPDATE notification
    SET status = $2
    WHERE id = ANY($1::int[]);
  `;
  try {
    const result = await pool.query(query, [ids, status]);
    return result.rows[0] as Notification;
  } catch (error) {
    console.error("Error updating notification status:", error);
    throw error;
  }
}
