export interface ScrapedActivity {
  url: string;
  course: string;
  title: string;
  openingDate: string;
  closingDate: string;
}

export interface Activity {
  id: number;
  title: string;
  course_id: number;
  course_title: string;
  type: "QUIZ" | "ASSIGN";
  url: string;
  opening_timestamp: string; // ISO string
  closing_timestamp: string; // ISO string
}

export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

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
