import type { Notification, NotificationStatus } from "../types";
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

export async function getNotificationById(id: number) {
  const query = `SELECT * FROM notification WHERE id = $1;`;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0] as Notification;
  } catch (error) {
    console.error("Error fetching notification by ID:", error);
    throw error;
  }
}

export async function getAllNotifications() {
  const query = `SELECT * FROM notification ORDER BY id DESC;`;
  try {
    const result = await pool.query(query);
    return result.rows as Notification[];
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    throw error;
  }
}

export async function updateNotificationStatus(
  id: number,
  status: NotificationStatus
) {
  const query = `
    UPDATE notification
    SET status = $2
    WHERE id = $1
    RETURNING *;
  `;
  try {
    const result = await pool.query(query, [id, status]);
    return result.rows[0] as Notification;
  } catch (error) {
    console.error("Error updating notification status:", error);
    throw error;
  }
}

export async function deleteNotification(id: number) {
  const query = `DELETE FROM notification WHERE id = $1 RETURNING *;`;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0] as Notification;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}
