import puppeteer, { Page, Browser } from "puppeteer";
import {
  CALENDAR_URL,
  defaultSelectors,
  forumSelectors,
  LOGIN_URL,
  PASSWORD,
  SMOWL_SCRIPT_PATH,
  USERNAME,
} from "../libs/constants";
import {
  delay,
  getActivityIdFromUrl,
  getActivityTypeFromUrl,
  xpath,
} from "../libs/utils";
import { Module, type ScrapedActivity } from "../types";
import baseLogger from "../libs/logger";

export class Scraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private closing = false;
  private readonly logger = baseLogger.child({ module: Module.SCRAPER });

  async initialize(): Promise<void> {
    if (!USERNAME || !PASSWORD) {
      throw new Error("Missing credentials in environment variables");
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();
    this.logger.info("Puppeteer initialized");
  }

  async login(): Promise<void> {
    if (!this.page) throw new Error("Page not initialized");

    this.logger.info("Starting login process...");
    await this.page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await delay();

    this.logger.info("Filling credentials...");
    await this.page.type('input[name="username"]', USERNAME);
    await this.page.type('input[name="password"]', PASSWORD);

    this.logger.info("Submitting form...");
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "networkidle2" }),
      this.page.click('button[type="submit"]'),
    ]);
    await delay();
  }

  async getCalendarLinks(): Promise<Set<string>> {
    if (!this.page) throw new Error("Page not initialized");

    this.logger.info("Navigating to calendar...");
    await this.page.goto(CALENDAR_URL, { waitUntil: "networkidle2" });
    await delay();

    this.logger.info("Extracting activity links...");
    const hrefs = await this.page.$$eval(
      'a[data-action="view-event"]',
      (links) => links.map((a: HTMLAnchorElement) => a.href)
    );

    await delay();
    return new Set(hrefs);
  }

  async scrapeActivity(url: string): Promise<ScrapedActivity> {
    if (!this.page) throw new Error("Page not initialized");

    const scrapedActivity: ScrapedActivity = {
      url,
      title: "",
      course: "",
      openingDate: "",
      closingDate: "",
      isSmowlMonitored: false,
    };

    try {
      this.logger.info(`Scraping: ${url}`);
      await this.page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      const id = getActivityIdFromUrl(url);
      const activityType = getActivityTypeFromUrl(url);
      const selectors =
        activityType === "FORUM" ? forumSelectors : defaultSelectors;

      const html = await this.page.content();
      scrapedActivity.isSmowlMonitored = html.includes(SMOWL_SCRIPT_PATH);
      this.logger.info(
        `${activityType} - ${id}: isSmowlMonitored=${scrapedActivity.isSmowlMonitored}`
      );

      for (const [key, selector] of Object.entries(selectors)) {
        this.logger.info(`${activityType} - ${id}: Scraping ${key}...`);
        const element = await this.page
          .waitForSelector(xpath(selector), { timeout: 5000 })
          .catch((error) => {
            this.logger.error(`Error scraping ${url} on key ${key}`, error);

            return null;
          });

        scrapedActivity[key as keyof Pick<
          ScrapedActivity,
          "course" | "title" | "openingDate" | "closingDate"
        >] = element
          ? await this.page.evaluate((el) => el.textContent?.trim(), element)
          : "";

        await delay();
      }
    } catch (error) {
      this.logger.error(`Error scraping ${url}:`, error);
    }

    this.logger.info(`Scraped data from ${url}: `, scrapedActivity);
    return scrapedActivity;
  }

  async close(): Promise<void> {
    if (this.closing) return;
    this.closing = true;

    const browser = this.browser;
    this.browser = null;
    this.page = null;

    try {
      if (browser) {
        await browser.close();
      }
    } catch (error) {
      this.logger.error("Error closing puppeteer browser", error);
    } finally {
      this.closing = false;
    }
  }
}
