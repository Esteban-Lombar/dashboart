// src/api/dashboard.js
import { http } from "./http";

/**
 * Rutas reales según tu back:
 *   /trivia/questions/*
 *   /trivia/rooms/*
 */

// Estadísticas globales (partidas jugadas, ranking, categorías)
export const getOverview = () =>
  http.get("/trivia/questions/overview").then(r => r.data);

// Partidas activas (jugadores conectados)
export const getActiveMatches = () =>
  http.get("/trivia/rooms/active").then(r => r.data);

// Preguntas enviadas y resultados (últimas N)
export const getQuestionsStream = (limit = 50) =>
  http.get(`/trivia/questions/stream?limit=${limit}`).then(r => r.data);
