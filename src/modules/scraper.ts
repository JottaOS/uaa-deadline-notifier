import puppeteer, { Page, Browser } from "puppeteer";
import { CALENDAR_URL, LOGIN_URL, PASSWORD, USERNAME } from "../libs/constants";
import { delay, xpath } from "../libs/utils";
import type { ScrapedActivity } from "../types";

export class Scraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

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

    this.browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();
  }

  async login(): Promise<void> {
    if (!this.page) throw new Error("Page not initialized");

    console.log("Starting login process...");
    await this.page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    await delay();

    console.log("Filling credentials...");
    await this.page.type('input[name="username"]', USERNAME);
    await this.page.type('input[name="password"]', PASSWORD);

    console.log("Submitting form...");
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "networkidle2" }),
      this.page.click('button[type="submit"]'),
    ]);
    await delay();
  }

  async getCalendarLinks(): Promise<Set<string>> {
    if (!this.page) throw new Error("Page not initialized");

    console.log("Navigating to calendar...");
    await this.page.goto(CALENDAR_URL, { waitUntil: "networkidle2" });
    await delay();

    console.log("Extracting activity links...");
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
      console.log(`Scraping: ${url}`);
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
      console.error(`Error scraping ${url}:`, error);
    }

    return scrapedActivity;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
