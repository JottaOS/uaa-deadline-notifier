export interface ScrapedActivity {
  url: string;
  course: string;
  title: string;
  openingDate: string;
  closingDate: string;
}

export interface Activity {
  id: number;
  courseId: number;
  title: string;
  type: "quiz" | "assign";
  url: string;
  openingTimestamp: number;
  closingTimestamp: number;
}
