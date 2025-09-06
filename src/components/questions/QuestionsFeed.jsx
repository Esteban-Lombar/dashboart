import { useEffect, useState } from "react";
import { getQuestionsStream } from "../../api/dashboard"; // o "../../api/dashboart"

const Skeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
    <div className="h-5 w-56 bg-gray-200 rounded mb-4 animate-pulse" />
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

export default function QuestionsFeed() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError(null);
        const data = await getQuestionsStream(50);
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error getQuestionsStream:", e);
        if (mounted) setError("No se pudo cargar el feed de preguntas.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (loading) return <Skeleton />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-lg font-semibold mb-3">❓ Preguntas enviadas</h3>

      {error && (
        <div className="mb-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {!items || items.length === 0 ? (
        <p className="text-sm text-gray-600">Sin preguntas recientes.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((q, i) => (
            <li key={q.id || q._id || i} className="p-3 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="font-medium truncate">{q.question || q.text || "—"}</div>
                {typeof q.correct !== "undefined" && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.correct ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {q.correct ? "Correcta" : "Incorrecta"}
                  </span>
                )}
              </div>
              {q.category && (
                <div className="mt-1 text-xs text-gray-500">Categoría: {q.category}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
