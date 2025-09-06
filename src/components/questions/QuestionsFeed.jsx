import { useEffect, useState } from "react";
import { getQuestionsList } from "../../api/dashboard";

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
        const data = await getQuestionsList();
        // adapta según tu shape real:
        const arr = Array.isArray(data) ? data :
                    Array.isArray(data?.items) ? data.items : [];
        if (mounted) setItems(arr);
      } catch (e) {
        console.error("getQuestionsList:", e);
        if (mounted) setError("No se pudo cargar preguntas.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15000); // refresh opcional
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (loading) return <Skeleton />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-lg font-semibold mb-3">❓ Preguntas</h3>

      {error && (
        <div className="mb-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {!items || items.length === 0 ? (
        <p className="text-sm text-gray-600">Sin preguntas disponibles.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((q, i) => (
            <li key={q._id || q.id || i} className="p-3 rounded-xl border border-gray-100">
              <div className="font-medium">{q.question || q.text || "—"}</div>
              {q.category && (
                <div className="mt-1 text-xs text-gray-500">Categoría: {q.category}</div>
              )}
              {Array.isArray(q.options) && q.options.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.options.map((opt, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        typeof q.correctIndex === "number" && idx === q.correctIndex
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
