import {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  WHATSAPP_GROUP_ID,
} from "../libs/constants";
import { WhatsAppProvider } from "./whatsapp.provider";
import { TelegramProvider } from "./telegram.provider";
import { NotificationProvider, ProviderName } from "../types";

export function createNotificationProvider(
  name: ProviderName,
): NotificationProvider {
  switch (name) {
    case "whatsapp":
      return new WhatsAppProvider(WHATSAPP_GROUP_ID);
    case "telegram":
      return new TelegramProvider(TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN);
    default: {
      throw new Error(`Unknown notification provider: ${name}`);
    }
  }
}
