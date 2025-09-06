// src/components/live/PlayersByMatch.jsx
import { useEffect, useState } from "react";
import { getActiveMatches } from "../../api/dashboard"; // ← usa "../../api/dashboart" si tu archivo se llama así

// UI: esqueleto de carga
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
  const [items, setItems] = useState(null);     // lista de partidas activas
  const [loading, setLoading] = useState(true); // estado de carga
  const [error, setError] = useState(null);     // error de red

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError(null);
        const data = await getActiveMatches();
        // Esperado del back (ejemplo):
        // [
        //   { matchId:"abc123", startedAt:"2025-09-06T19:22:00Z",
        //     players:[{id:"u1", alias:"@ana"}, {id:"u2", alias:"@leo"}] }
        // ]
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error getActiveMatches:", e);
        if (mounted) setError("No se pudo cargar partidas activas.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // Refresh simple cada 15s (si luego usas WebSocket, puedes quitarlo)
    const id = setInterval(load, 15000);
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
          {items.map((m) => (
            <li
              key={m.matchId || m.id}
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

              {/* chips de jugadores */}
              <div className="mt-2 flex flex-wrap gap-2">
                {(m.players || []).map((p) => (
                  <span
                    key={p.id || p.alias}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100"
                  >
                    {p.alias || p.name || p.id}
                  </span>
                ))}
              </div>

              {/* metadata opcional */}
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
