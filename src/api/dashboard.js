import { http } from "./http";

/** ÚNICO GET disponible hoy */
export const getQuestionsList = () =>
  http.get("/trivia/questions").then(r => r.data);

/** Placeholders para evitar 404 (no llames a estas funciones) */
export const getActiveMatches = async () => {
  throw new Error("Endpoint no disponible: GET /trivia/rooms/active");
};
export const getOverview = async () => {
  throw new Error("Endpoint no disponible: GET /trivia/questions/overview");
};
