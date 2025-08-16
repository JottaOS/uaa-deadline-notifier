import puppeteer, { Page, Browser } from "puppeteer";
import {
  CALENDAR_URL,
  IS_PRODUCTION,
  LOGIN_URL,
  PASSWORD,
  USERNAME,
} from "../libs/constants";
import { delay, xpath } from "../libs/utils";
import { Module, type ScrapedActivity } from "../types";
import baseLogger from "../libs/logger";

export class Scraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly logger = baseLogger.child({ module: Module.SCRAPER });
  private readonly selectors = {
    course: "/html/body/div[3]/div[5]/header/div[1]/div[2]/div/div",
    title: "/html/body/div[3]/div[5]/header/div[2]/div[1]/div/div[2]/h1",
    openingDate:
      "/html/body/div[3]/div[5]/div[1]/div[2]/div/section/div[2]/div[1]/div/div[1]",
    closingDate:
      "/html/body/div[3]/div[5]/div[1]/div[2]/div/section/div[2]/div[1]/div/div[2]",
  };

  async initialize(): Promise<void> {
    if (!USERNAME || !PASSWORD) {
      throw new Error("Missing credentials in environment variables");
    }

    try {
      this.browser = await puppeteer.launch({
        headless: IS_PRODUCTION,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      this.page = await this.browser.newPage();
      this.logger.info("Puppeteer initialized");
    } catch (error) {
      this.logger.error("Error initializing puppeteer");
    }
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
      // TODO: check bun lib.dom.ts imports
      // @ts-ignore
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
    };

    try {
      this.logger.info(`Scraping: ${url}`);
      await this.page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      for (const [key, selector] of Object.entries(this.selectors)) {
        const element = await this.page
          .waitForSelector(xpath(selector), { timeout: 10000 })
          .catch(() => null);

        scrapedActivity[key as keyof ScrapedActivity] = element
          ? await this.page.evaluate((el) => el.textContent?.trim(), element)
          : "";

        await delay();
      }
    } catch (error) {
      this.logger.error(`Error scraping ${url}:`, error);
    }

    return scrapedActivity;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
