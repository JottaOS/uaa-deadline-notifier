import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const client = new Client({
  authStrategy: new LocalAuth(), // Guarda la sesión localmente para evitar reescanear el QR
});

client.on("qr", (qr) => {
  console.log("QR Code received");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp client is ready!");
});

/**
 * Send a WhatsApp message to a chatId.
 */
export async function sendMessage(
  message: string,
  chatId: string
): Promise<{ success: boolean }> {
  try {
    const chat = await client.getChatById(chatId);

    if (!chat) {
      console.error(`Chat not found. Id: `, chatId);
      return { success: false };
    }

    await client.sendMessage(chat.id._serialized, message);
    console.log(`Whatsapp message sent successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error sending whatsapp message to group:", error);
    return { success: false };
  }
}

client.initialize();
