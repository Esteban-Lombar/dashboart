// src/api/dashboard.js
import { http } from "./http";

/** Siempre agrega un timestamp para evitar cache 304 */
const noCache = () => ({ params: { _t: Date.now() } });

export const getActiveMatches = () =>
  http.get("/trivia/rooms/active", noCache()).then((r) => r.data);

export const getOverview = () =>
  http.get("/trivia/questions/overview", noCache()).then((r) => r.data);

export const getQuestionsList = () =>
  http.get("/trivia/questions", noCache()).then((r) => r.data);
