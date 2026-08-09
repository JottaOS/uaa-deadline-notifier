# UAA Deadline Notifier 📅

A Node.js application that automatically scrapes activity deadlines from the UAA platform, stores them in a PostgreSQL database, and sends notifications to keep students informed about upcoming deadlines. Notifications can be delivered via **WhatsApp** or **Telegram**, selected at startup with the `NOTIFICATION_PROVIDER` environment variable.

## ⚠️ Disclaimer

This project uses `whatsapp-web.js`, which is an **unofficial** library for WhatsApp Web. Due to this:

- I strongly recommend using a secondary phone number for the WhatsApp notifications
- There is no guarantee against potential account bans
- WhatsApp may block your account if they detect automated behavior

## 📋 Prerequisites

- Node.js
- PostgreSQL
- A WhatsApp account **or** a Telegram bot

## 🔧 Installation

1. Clone the repository

```bash
git clone https://github.com/JottaOS/uaa-deadline-notifier.git
cd uaa-deadline-notifier
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```env
UAA_USERNAME="your_username"
UAA_PASSWORD="your_password"

DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uaa_deadline_notifier

NODE_ENV=development

# Notification provider: "whatsapp" or "telegram"
NOTIFICATION_PROVIDER=whatsapp

WHATSAPP_GROUP_ID="your_group_id"

# Required when NOTIFICATION_PROVIDER=telegram
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"
```

4. Set up the PostgreSQL database

```bash
psql -U postgres
CREATE DATABASE uaa_deadline_notifier;
\c uaa_deadline_notifier
\i schema.sql
```

## 🚀 Running the Application

1. Set `NOTIFICATION_PROVIDER` in your `.env` file (`whatsapp` or `telegram`)
2. Start the application:

```bash
npm start
```

### Using WhatsApp

On first run, scan the QR code with WhatsApp to authenticate. The WhatsApp client is only initialized when `NOTIFICATION_PROVIDER=whatsapp`.

### Using Telegram

1. Create a bot with [@BotFather](https://t.me/BotFather) and grab its token
2. Get your chat ID (e.g. `@userinfobot` for personal chats, or add the bot to a group)
3. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in your `.env`

3. The application will automatically:
   - Scrape activities every 6 hours
   - Send notifications based on configured reminder times
   - Store new activities in the database

## 👥 Acknowledgment

- Special thanks to [Mathias Lovera](https://github.com/lovera00) for his invaluable help in developing and hosting this project.

## 📄 License

This project is licensed under Apache 2.0, see [LICENSE](LICENSE)
