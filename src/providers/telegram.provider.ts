import { Bot } from "grammy";
import baseLogger from "../libs/logger";
import { Module, NotificationProvider, SendMessageResult } from "../types";

const logger = baseLogger.child({ module: Module.NOTIFIER });

export class TelegramProvider implements NotificationProvider {
  readonly name = "telegram" as const;

  private readonly bot: Bot;

  constructor(
    private readonly recipientId: string,
    botToken: string,
  ) {
    this.bot = new Bot(botToken);

    void this.bot.init().catch((error) => {
      logger.error("Error initializing Telegram bot:", error);
    });
  }

  async send(message: string): Promise<SendMessageResult> {
    try {
      logger.info(`Sending message to chat\n${message}`);
      await this.bot.api.sendMessage(this.recipientId, message);
      logger.info(`Telegram message sent successfully`);
      return { success: true };
    } catch (error) {
      logger.error("Error sending telegram message to chat:", error);
      return { success: false };
    }
  }
}
