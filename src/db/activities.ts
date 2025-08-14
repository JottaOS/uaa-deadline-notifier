import type { Activity } from "../types";
import pool from "./config";

export async function getAllPendingActivities() {
  const query = "SELECT * FROM activity a WHERE a.closing_timestamp > NOW();";
  try {
    const result = await pool.query(query);
    return result.rows[0];
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

// Create a new activity
export async function createActivity(activity: Activity) {
  const query = `
        INSERT INTO activity 
            (id, title, course_id, course_title, type, url, opening_timestamp, closing_timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
  ];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

export async function getActivityById(id: number): Promise<Activity> {
  const query = "SELECT * FROM activity WHERE id = $1";
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching activity by ID:", error);
    throw error;
  }
}

export async function deleteActivity(id: number) {
  const query = "DELETE FROM activity WHERE id = $1 RETURNING *";
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}
