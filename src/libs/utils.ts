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
    const [courseId, courseTitle] = item.course
      .split("-")
      .map((item) => item.trim());
    const type = item.url.split("/")[4] as Activity["type"];
    const openingTimestamp = textDateToTimestamp(item.openingDate);
    const closingTimestamp = textDateToTimestamp(item.closingDate);

    if (!id) throw new Error("Could not get activity id from URL: " + item.url);

    return {
      id: Number(id),
      courseId: Number(courseId),
      courseTitle,
      title: item.title,
      url: item.url,
      type,
      openingTimestamp,
      closingTimestamp,
    };
  });
};

/**
 * Transforms a formatted string date to its corresponding timestamp in -3 UTC
 * @param textDate Example format: "Cierre: lunes, 11 de agosto de 2025, 23:25"
 */
const textDateToTimestamp = (textDate: string): number => {
  if (!textDate) return 0;

  try {
    const [_, date, time] = textDate.split(",").map((item) => item.trim());

    if (!date || !time) {
      console.error(`Could not extract date or time from textDate: `, textDate);
      return 0;
    }

    const [dayOfMonth, monthTitle, year] = date
      .split("de")
      .map((item) => item.trim());

    if (!dayOfMonth || !monthTitle || !year) {
      console.error(
        `Could not extract dayOfMonth, monthTitle or year from date: `,
        date
      );
      return 0;
    }

    const month = monthsMap.get(monthTitle);
    if (!month) {
      console.error(`Invalid month title: ${monthTitle}`);
      return 0;
    }

    const formattedDate = `${year}-${padLeft(
      month.toString(),
      2,
      "0"
    )}-${padLeft(dayOfMonth, 2, "0")}T${time}:00.00-03:00`;

    const timestamp = new Date(formattedDate).valueOf();
    if (isNaN(timestamp)) {
      console.error(`Invalid date format: ${formattedDate}`);
      return 0;
    }

    return timestamp;
  } catch (error) {
    console.error("Error parsing date:", error);
    return 0;
  }
};

export const padLeft = (text: string, maxLength: number, padString: string) => {
  if (text.length >= maxLength) return text;

  return padString.repeat(maxLength - text.length) + text;
};
