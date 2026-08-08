import { Module, type Activity } from "../types";
import pool from "./config";
import baseLogger from "../libs/logger";

const logger = baseLogger.child({ module: Module.DB });

export async function getAllPendingActivities() {
  const query = "SELECT * FROM activity a WHERE a.closing_timestamp > NOW();";
  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    logger.error("Error getting all pending activities", error);
    throw error;
  }
}

// Create a new activity
export async function createActivity(activity: Activity) {
  const query = `
        INSERT INTO activity 
            (id, title, course_id, course_title, type, url, opening_timestamp, closing_timestamp, is_smowl_monitored)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;
  const values = [
    activity.id,
    activity.title,
    activity.course_id,
    activity.course_title,
    activity.type,
    activity.url,
    activity.opening_timestamp,
    activity.closing_timestamp,
    activity.is_smowl_monitored,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function updateActivity(activity: Activity) {
  const query = `
        UPDATE activity
        SET title = $2,
            course_id = $3,
            course_title = $4,
            type = $5,
            url = $6,
            opening_timestamp = $7,
            closing_timestamp = $8,
            is_smowl_monitored = $9
        WHERE id = $1
        RETURNING *; 
    `;
  const values = [
    activity.id,
    activity.title,
    activity.course_id,
    activity.course_title,
    activity.type,
    activity.url,
    activity.opening_timestamp,
    activity.closing_timestamp,
    activity.is_smowl_monitored,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getActivityById(id: number): Promise<Activity> {
  const query = "SELECT * FROM activity WHERE id = $1";
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    logger.error("Error fetching activity by ID:", error);
    throw error;
  }
}

export async function deleteActivity(id: number) {
  const query = "DELETE FROM activity WHERE id = $1 RETURNING *";
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    logger.error("Error deleting activity:", error);
    throw error;
  }
}
