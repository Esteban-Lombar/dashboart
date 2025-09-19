import React, { useEffect, useState } from "react";
import { http } from "../../api/http"; // usamos axios directo para evitar mismatch de imports

// Normaliza la forma de la pregunta venga como venga del back
const normalize = (q) => ({
  id: q._id ?? q.id ?? crypto.randomUUID(),
  pregunta: q.enunciado ?? q.pregunta ?? q.question ?? q.title ?? "—",
  categoria: q.categoria ?? q.category ?? "—",
  opciones: Array.isArray(q.opciones) ? q.opciones : Array.isArray(q.options) ? q.options : [],
  correcta: q.respuestaCorrecta ?? q.correcta ?? q.answer ?? null,
  img: q.img ?? q.image ?? null,
});

export default function QuestionsFeed() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      // cache-busting por si hay CDN de por medio
      const res = await http.get("/trivia/questions", { params: { _t: Date.now() } });
      const raw =
        (Array.isArray(res.data) && res.data) ||
        res.data?.items ||
        res.data?.data ||
        res.data?.result ||
        [];
      const list = (Array.isArray(raw) ? raw : []).map(normalize);
      setQuestions(list);
    } catch (e) {
      console.error("Error al cargar preguntas:", e);
      setError("No se pudieron cargar las preguntas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-gray-500">Cargando preguntas…</p>;
  if (error)   return <p className="text-rose-700">{error}</p>;
  if (!questions.length) return <p className="text-gray-500">No hay preguntas recientes.</p>;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">❓ Preguntas</h2>
      <ul className="space-y-4">
        {questions.map((q) => (
          <li key={q.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* Título / enunciado de la pregunta */}
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              {q.pregunta}
            </h4>

            <p className="text-sm text-gray-600 mb-2">
              Categoría: {q.categoria}
            </p>

            {/* Opciones */}
            <div className="flex flex-wrap gap-2">
              {q.opciones.map((op, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full"
                >
                  {op}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
