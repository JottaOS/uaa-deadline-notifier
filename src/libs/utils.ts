import { format } from "date-fns";
import type {
  Activity,
  NotificationWithActivity,
  ScrapedActivity,
} from "../types";
import { monthsMap } from "./constants";
import { formatInTimeZone } from "date-fns-tz";

export function xpath(xpath: string) {
  return `::-p-xpath(${xpath})`;
}

export async function delay(ms: number = 1000) {
  return await new Promise((res) => setTimeout(res, ms));
}

export function getActivityTypeFromUrl(url: string) {
  if (!url) throw new Error("URL not provided");

  return url.split("/")[4]?.toUpperCase() as Activity["type"];
}

export function getActivityIdFromUrl(url: string) {
  if (!url) throw new Error("URL not provided");

  return new URL(url).searchParams.get("id");
}

export const formatScrapedActivities = (
  scrapedActivities: ScrapedActivity[] = []
): Activity[] => {
  return scrapedActivities.map((item) => {
    const id = getActivityIdFromUrl(item.url);
    if (!id) throw new Error("Could not get activity id from URL: " + item.url);

    const closing_timestamp = textDateToIsoString(item.closingDate);

    if (!closing_timestamp)
      throw new Error(
        "Could not get closing timestamp from activity: " +
          JSON.stringify(item, null, 2)
      );

    const [course_id, course_title] = item.course
      .split("-")
      .map((item) => item.trim());
    const type = getActivityTypeFromUrl(item.url);
    const opening_timestamp = item.openingDate
      ? textDateToIsoString(item.openingDate)
      : null;

    return {
      id: Number(id),
      course_id: Number(course_id ?? 0),
      course_title: course_title || "",
      title: item.title,
      url: item.url,
      type,
      opening_timestamp,
      closing_timestamp,
    };
  });
};

/**
 * Transforms a formatted string date to its corresponding timestamp in -3 UTC
 *
 * Example output: 2025-08-14T15:00:00+02:00
 * @param textDate Example format: "Cierre: lunes, 11 de agosto de 2025, 23:25"
 */
const textDateToIsoString = (textDate: string): string | null => {
  if (!textDate) return null;

  try {
    const [_, date, time] = textDate.split(",").map((item) => item.trim());

    if (!date || !time) {
      console.error(`Could not extract date or time from textDate: `, textDate);
      return null;
    }

    const [dayOfMonth, monthTitle, year] = date
      .split("de")
      .map((item) => item.trim());

    if (!dayOfMonth || !monthTitle || !year) {
      console.error(
        `Could not extract dayOfMonth, monthTitle or year from date: `,
        date
      );
      return null;
    }

    const month = monthsMap.get(monthTitle);
    if (!month) {
      console.error(`Invalid month title: ${monthTitle}`);
      return null;
    }

    const isoDate = `${year}-${pad(month.toString())}-${pad(
      dayOfMonth
    )}T${time}:00.00-03:00`;

    return isoDate;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
};

export const pad = (text: string) => {
  return text.padStart(2, "0");
};

export const formatNotifications = (
  notifications: NotificationWithActivity[]
) => {
  const grouped = new Map<string, Map<string, NotificationWithActivity[]>>();

  for (const n of notifications) {
    const closingDate = new Date(n.closing_timestamp);

    const dateKey = formatInTimeZone(
      closingDate,
      "America/Argentina/Buenos_Aires",
      "dd/MM/yyyy"
    );

    const timeKey = formatInTimeZone(
      closingDate,
      "America/Argentina/Buenos_Aires",
      "HH:mm"
    );

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, new Map());
    }

    const timesMap = grouped.get(dateKey)!;

    if (!timesMap.has(timeKey)) {
      timesMap.set(timeKey, []);
    }

    timesMap.get(timeKey)!.push(n);
  }

  return formatGroupedNotifications(grouped);
};

function formatGroupedNotifications(
  grouped: Map<string, Map<string, NotificationWithActivity[]>>
): string {
  let output = "";

  for (const [date, timesMap] of grouped) {
    output += `📅 ${date}\n\n`;

    for (const [time, notifications] of timesMap) {
      output += `⏰ ${time}\n`;

      // Group by course
      const coursesMap = new Map<number, NotificationWithActivity[]>();

      for (const n of notifications) {
        if (!coursesMap.has(n.course_id)) {
          coursesMap.set(n.course_id, []);
        }
        coursesMap.get(n.course_id)!.push(n);
      }

      for (const [courseId, courseNotifications] of coursesMap) {
        const courseTitle = courseNotifications[0]?.course_title || "No title";
        output += `   • ${courseTitle} (${courseId})\n`;

        for (const notif of courseNotifications) {
          output += `     - ${notif.title}\n`;
          output += `       🔗 ${notif.url}\n\n`;
        }
      }
    }

    output += "\n";
  }

  return output.trim();
}
