import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import baseLogger from "../libs/logger";
import { Module } from "../types";

const logger = baseLogger.child({ module: Module.NOTIFIER });

const client = new Client({
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
  // Save session locally to avoid re-scanning the QR
  authStrategy: new LocalAuth({
    dataPath: "auth",
  }),
});

client.on("qr", (qr) => {
  logger.info("Whatsapp QR Code received");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  logger.info("WhatsApp client is ready!");
});

client.on("auth_failure", (message) => {
  logger.error(message);
});

/**
 * Send a WhatsApp message to a chatId.
 */
export async function sendMessage(
  message: string,
  chatId: string
): Promise<{ success: boolean }> {
  try {
    logger.info("Getting whatsapp chat by id");
    const chat = await client.getChatById(chatId);

    if (!chat) {
      logger.error(`Chat not found. Id: `, chatId);
      return { success: false };
    }

    logger.info(`Sending message to chat\n${message}`);
    await client.sendMessage(chat.id._serialized, message);
    logger.info(`Whatsapp message sent successfully`);
    return { success: true };
  } catch (error) {
    logger.error("Error sending whatsapp message to group:", error);
    return { success: false };
  }
}

client.initialize();
