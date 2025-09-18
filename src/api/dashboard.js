// src/api/dashboard.js
import { http } from "./http";

/**
 * Endpoints reales en tu back (Railway):
 *  - GET /trivia/rooms/active
 *  - GET /trivia/questions/overview
 *  - (ya existente) GET /trivia/questions  ← lo mantenemos para el feed
 */

export const getActiveMatches = () =>
  http.get("/trivia/rooms/active").then((r) => r.data);

export const getOverview = () =>
  http.get("/trivia/questions/overview").then((r) => r.data);

// Feed básico (catálogo) hasta que exista un stream:
export const getQuestionsList = () =>
  http.get("/trivia/questions").then((r) => r.data);
