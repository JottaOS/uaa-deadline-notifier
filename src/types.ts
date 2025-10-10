export interface ScrapedActivity {
  url: string;
  course: string;
  title: string;
  openingDate: string | null;
  closingDate: string;
}

export interface Activity {
  id: number;
  title: string;
  course_id: number;
  course_title: string;
  type: "QUIZ" | "ASSIGN" | "FORUM";
  url: string;
  opening_timestamp: string | null; // ISO string
  closing_timestamp: string; // ISO string
}

export interface UpdatedTimestampActivity
  extends Omit<Activity, "closing_timestamp"> {
  previousClosingDate: Date;
  newClosingDate: Date;
}

export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "CANCELLED";

export interface Notification {
  id: number;
  activity_id: number;
  send_at: string; // ISO string
  status: NotificationStatus;
  created_at: string;
}

export interface NotificationWithActivity {
  notification_id: number;
  activity_id: number;
  send_at: string; // ISO string
  course_id: number;
  course_title: string;
  closing_timestamp: string; // ISO string
  title: string;
  url: string;
}

export enum Module {
  SCRAPER = "SCRAPER",
  NOTIFIER = "NOTIFIER",
  SCHEDULER = "SCHEDULER",
  API = "API",
  DB = "DB",
  UTILS = "UTILS",
  ACTIVITY_SERVICE = "ACTIVITY_SERVICE",
  NOTIFICATION_SERVICE = "NOTIFICATION_SERVICE",
}
