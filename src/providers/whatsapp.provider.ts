import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import baseLogger from "../libs/logger";
import { Module, NotificationProvider, SendMessageResult } from "../types";

const logger = baseLogger.child({ module: Module.NOTIFIER });

export class WhatsAppProvider implements NotificationProvider {
  readonly name = "whatsapp" as const;

  private readonly client: Client;

  constructor(private readonly recipientId: string) {
    this.client = new Client({
      puppeteer: {
        headless: true,
        args: ["--no-sandbox"],
      },
      // Save session locally to avoid re-scanning the QR
      authStrategy: new LocalAuth({
        dataPath: "auth",
      }),
    });

    this.client.on("qr", (qr) => {
      logger.info("Whatsapp QR Code received");
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      logger.info("WhatsApp client is ready!");
    });

    this.client.on("auth_failure", (message) => {
      logger.error(message);
    });

    this.client.initialize();
  }

  async send(message: string): Promise<SendMessageResult> {
    try {
      logger.info("Getting whatsapp chat by id");
      const chat = await this.client.getChatById(this.recipientId);

      if (!chat) {
        logger.error(`Chat not found. Id: `, this.recipientId);
        return { success: false };
      }

      logger.info(`Sending message to chat\n${message}`);
      await this.client.sendMessage(chat.id._serialized, message);
      logger.info(`Whatsapp message sent successfully`);
      return { success: true };
    } catch (error) {
      logger.error("Error sending whatsapp message to group:", error);
      return { success: false };
    }
  }
}
