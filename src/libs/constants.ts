import * as dotenv from "dotenv";
dotenv.config();

export const USERNAME = process.env.UAA_USERNAME || "";
export const PASSWORD = process.env.UAA_PASSWORD || "";
export const LOGIN_URL = "https://e.uaa.edu.py/principal.html";
export const CALENDAR_URL = "https://e.uaa.edu.py/my/";

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
    url: "https://e.uaa.edu.py/mod/quiz/view.php?id=119041",
    course: "371 - PROGRAMACION SQL",
    title: "Cuestionario 01",
    openingDate: "Abrió: martes, 5 de agosto de 2025, 22:00",
    closingDate: "Cierra: martes, 12 de agosto de 2025, 23:59",
  },
  {
    url: "https://e.uaa.edu.py/mod/quiz/view.php?id=114248",
    course: "373 - MATEMATICA FINANCIERA",
    title: "Cuestionario de la Clase 1",
    openingDate: "Abrió: jueves, 7 de agosto de 2025, 20:00",
    closingDate: "Cierra: jueves, 14 de agosto de 2025, 23:59",
  },
  {
    url: "https://e.uaa.edu.py/mod/assign/view.php?id=116079",
    course: "374 - COMPILADORES",
    title: "Tarea 1",
    openingDate: "Apertura: lunes, 4 de agosto de 2025, 00:00",
    closingDate: "Cierre: lunes, 11 de agosto de 2025, 23:25",
  },
  {
    url: "https://e.uaa.edu.py/mod/assign/view.php?id=107406",
    course: "375 - GUARANI PARA INFORMATICOS",
    title: "Tarea",
    openingDate: "Apertura: viernes, 8 de agosto de 2025, 18:45",
    closingDate: "Cierre: jueves, 14 de agosto de 2025, 23:59",
  },
];
