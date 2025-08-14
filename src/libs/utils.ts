import type { Activity, ScrapedActivity } from "../types";
import { monthsMap } from "./constants";

export function xpath(xpath: string) {
  return `::-p-xpath(${xpath})`;
}

export async function delay(ms: number = 1000) {
  return await new Promise((res) => setTimeout(res, ms));
}

export const formatScrapedActivities = (
  scrapedActivities: ScrapedActivity[] = []
): Activity[] => {
  return scrapedActivities.map((item) => {
    const id = new URL(item.url).searchParams.get("id");
    const [course_id, course_title] = item.course
      .split("-")
      .map((item) => item.trim());
    const type = item.url.split("/")[4]?.toUpperCase() as Activity["type"];
    const opening_timestamp = textDateToIsoString(item.openingDate);
    const closing_timestamp = textDateToIsoString(item.closingDate);

    if (!id) throw new Error("Could not get activity id from URL: " + item.url);

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
const textDateToIsoString = (textDate: string): string => {
  if (!textDate) return "";

  try {
    const [_, date, time] = textDate.split(",").map((item) => item.trim());

    if (!date || !time) {
      console.error(`Could not extract date or time from textDate: `, textDate);
      return "";
    }

    const [dayOfMonth, monthTitle, year] = date
      .split("de")
      .map((item) => item.trim());

    if (!dayOfMonth || !monthTitle || !year) {
      console.error(
        `Could not extract dayOfMonth, monthTitle or year from date: `,
        date
      );
      return "";
    }

    const month = monthsMap.get(monthTitle);
    if (!month) {
      console.error(`Invalid month title: ${monthTitle}`);
      return "";
    }

    const isoDate = `${year}-${pad(month.toString())}-${pad(
      dayOfMonth
    )}T${time}:00.00-03:00`;

    return isoDate;
  } catch (error) {
    console.error("Error parsing date:", error);
    return "";
  }
};

export const pad = (text: string) => {
  return text.padStart(2, "0");
};
