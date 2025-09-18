import { useEffect, useState } from "react";
import { getActiveMatches } from "../../api/dashboard";

const Skeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
    <div className="h-5 w-56 bg-gray-200 rounded mb-4 animate-pulse" />
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

export default function PlayersByMatch() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError(null);
        const data = await getActiveMatches();
        // Adaptador flexible por si varía el shape
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        if (mounted) setItems(arr);
      } catch (e) {
        console.error("getActiveMatches:", e);
        if (mounted) setError("No se pudo cargar partidas activas.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 15000); // refresh simple cada 15s
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (loading) return <Skeleton />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">🎮 Partidas activas</h3>
        <span className="text-xs text-gray-500">
          {items?.length ?? 0} {items?.length === 1 ? "sala" : "salas"}
        </span>
      </div>

      {error && (
        <div className="mb-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {!items || items.length === 0 ? (
        <p className="text-sm text-gray-600">No hay partidas activas ahora mismo.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((m, i) => (
            <li
              key={m.matchId || m.id || i}
              className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  Sala: {m.matchId || m.id || "—"}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {(m.players?.length ?? 0)} conectados
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {(m.players || []).map((p, j) => (
                  <span
                    key={p.id || p.alias || j}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100"
                  >
                    {p.alias || p.name || p.id}
                  </span>
                ))}
              </div>

              {m.startedAt && (
                <div className="mt-2 text-xs text-gray-500">
                  Inició: {new Date(m.startedAt).toLocaleTimeString("es-CO")}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
