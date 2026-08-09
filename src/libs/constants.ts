import * as dotenv from "dotenv";
import type { ProviderName } from "../types";

dotenv.config();

function parseNotificationProvider(raw?: string): ProviderName {
  if (raw === "whatsapp" || raw === "telegram") {
    return raw;
  }

  throw new Error(
    `Invalid NOTIFICATION_PROVIDER: "${raw}". Expected "whatsapp" or "telegram".`,
  );
}

export const USERNAME = process.env.UAA_USERNAME || "";
export const PASSWORD = process.env.UAA_PASSWORD || "";
export const WHATSAPP_GROUP_ID = process.env.WHATSAPP_GROUP_ID || "";
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
export const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const NOTIFICATION_PROVIDER = parseNotificationProvider(
  process.env.NOTIFICATION_PROVIDER,
);

export const LOGIN_URL = "https://e.uaa.edu.py/principal.html";
export const CALENDAR_URL = "https://e.uaa.edu.py/my/";
export const SMOWL_SCRIPT_PATH = "blocks/smowl/lib/access_control.js";
export const REMINDER_TIMES = [
  16 * 60 * 60 * 1000, // 16 horas
  6 * 60 * 60 * 1000, // 6 horas
  1 * 60 * 60 * 1000, // 1 hora
];

export const defaultSelectors = {
  course: "/html/body/div[3]/div[5]/header/div[1]/div[2]/div/div",
  title: "/html/body/div[3]/div[5]/header/div[2]/div[1]/div/div[2]/h1",
  openingDate:
    "/html/body/div[3]/div[5]/div[1]/div[2]/div/section/div[2]/div[1]/div/div[1]",
  closingDate:
    "/html/body/div[3]/div[5]/div[1]/div[2]/div/section/div[2]/div[1]/div/div[2]",
};

export const forumSelectors = {
  course: "/html/body/div[3]/div[5]/header/div[1]/div[2]/div/div",
  title: "/html/body/div[3]/div[5]/header/div[2]/div[1]/div/div[2]/h1",
  closingDate:
    "/html/body/div[3]/div[5]/div[1]/div[2]/div/section/div[2]/div/div/div",
};

export const monthsMap = new Map<string, string>([
  ["enero", "1"],
  ["febrero", "2"],
  ["marzo", "3"],
  ["abril", "4"],
  ["mayo", "5"],
  ["junio", "6"],
  ["julio", "7"],
  ["agosto", "8"],
  ["septiembre", "9"],
  ["octubre", "10"],
  ["noviembre", "11"],
  ["diciembre", "12"],
]);

export const scrapedMock = [
  {
    url: "https://e.uaa.edu.py/mod/quiz/view.php?id=320787",
    title: "Evaluación de Proceso -PS1 (5 ptos)",
    course: "335 - COMPUTACION Y SOCIEDAD",
    openingDate: "Abrió: jueves, 6 de agosto de 2026, 19:00",
    closingDate: "Cierra: jueves, 13 de agosto de 2026, 23:55",
    isSmowlMonitored: false,
  },
  {
    url: "https://e.uaa.edu.py/mod/quiz/view.php?id=332601",
    title: "Cuestionario de evaluación de aprendizaje de la clase 1",
    course: "337 - METODOLOGIA DE LA INVESTIGACION TECNOLOGICA",
    openingDate: "Abrió: viernes, 7 de agosto de 2026, 22:00",
    closingDate: "Cierra: viernes, 14 de agosto de 2026, 23:59",
    isSmowlMonitored: false,
  },
  {
    url: "https://e.uaa.edu.py/mod/quiz/view.php?id=332592",
    title: "Cuestionario 1 - Vectores",
    course: "353 - ALGEBRA LINEAL",
    openingDate: "Abre: martes, 11 de agosto de 2026, 06:00",
    closingDate: "Cierra: jueves, 10 de diciembre de 2026, 13:59",
    isSmowlMonitored: false,
  },
  {
    url: "https://e.uaa.edu.py/mod/forum/view.php?id=320786",
    title: "Foro - Clase 1 - PS1 (10 puntos)",
    course: "335 - COMPUTACION Y SOCIEDAD",
    openingDate: "",
    closingDate: "Vencimiento: jueves, 13 de agosto de 2026, 23:55",
    isSmowlMonitored: false,
  },
  {
    url: "https://e.uaa.edu.py/mod/assign/view.php?id=336713",
    title: "Actividad Práctica 1",
    course: "355 - PROGRAMACION ORIENTADA POR OBJETOS AVANZADA  - PYTHON",
    openingDate: "Apertura: viernes, 7 de agosto de 2026, 00:00",
    closingDate: "Cierre: viernes, 14 de agosto de 2026, 00:00",
    isSmowlMonitored: false,
  },
  {
    url: "https://e.uaa.edu.py/mod/forum/view.php?id=267413",
    title: "Consultas Varias",
    course: "255 - FUNDAMENTOS DE ORGANIZACION EMPRESARIAL",
    openingDate: "",
    closingDate: "Vencimiento: domingo, 30 de agosto de 2026, 02:15",
    isSmowlMonitored: false,
  },
];
