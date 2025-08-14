export interface ScrapedActivity {
  url: string;
  course: string;
  title: string;
  openingDate: string;
  closingDate: string;
}

export interface Activity {
  title: string;
  course_id: number;
  course_title: string;
  type: "QUIZ" | "ASSIGN";
  url: string;
  opening_timestamp: string; // ISO string
  closing_timestamp: string; // ISO string
}
