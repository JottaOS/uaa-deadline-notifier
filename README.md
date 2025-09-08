# UAA Deadline Notifier 📅

A Node.js application that automatically scrapes activity deadlines from the UAA platform, stores them in a PostgreSQL database, and sends WhatsApp notifications to keep students informed about upcoming deadlines.

## ⚠️ Disclaimer

This project uses `whatsapp-web.js`, which is an **unofficial** library for WhatsApp Web. Due to this:

- I strongly recommend using a secondary phone number for the WhatsApp notifications
- There is no guarantee against potential account bans
- WhatsApp may block your account if they detect automated behavior

## 📋 Prerequisites

- Node.js
- PostgreSQL
- A WhatsApp account

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

WHATSAPP_GROUP_ID="your_group_id"
```

4. Set up the PostgreSQL database

```bash
psql -U postgres
CREATE DATABASE uaa_deadline_notifier;
\c uaa_deadline_notifier
\i schema.sql
```

## 🚀 Running the Application

1. Start the application:

```bash
npm start
```

2. On first run, scan the QR code with WhatsApp to authenticate

3. The application will automatically:
   - Scrape activities every 6 hours
   - Send notifications based on configured reminder times
   - Store new activities in the database

## 👥 Acknowledgment

- Special thanks to [Mathias Lovera](https://github.com/lovera00) for his invaluable help in developing and hosting this project.

## 📄 License

This project is licensed under Apache 2.0, see [LICENSE](LICENSE)
