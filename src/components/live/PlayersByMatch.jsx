import { useEffect, useState, useCallback, useMemo } from "react";
import { getActiveMatches } from "../../api/dashboard";

// Utilidades pequeñas
const timeAgo = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
};

const Skeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
    <div className="h-5 w-56 bg-gray-200 rounded mb-4 animate-pulse" />
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

// Si el backend no manda id, generamos uno estable a partir de jugadores+hora
const buildSyntheticId = (m) => {
  const names = (m.players || []).map(p => p.alias || p.name || p.id || "").sort().join("|");
  const started = m.startedAt ? new Date(m.startedAt).toISOString() : "";
  return names ? `room:${names}:${started}` : started || Math.random().toString(36).slice(2);
};

export default function PlayersByMatch() {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tab, setTab] = useState("active"); // "active" | "recent"

  const load = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);
      const data = await getActiveMatches(); // ya normaliza bastante
      setRaw(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("getActiveMatches:", e);
      setError("No se pudo cargar partidas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    load();

    // polling cada 5s + refresco al volver
    const id = setInterval(() => mounted && load(), 5000);
    const onVis = () => document.visibilityState === "visible" && load();
    const onFocus = () => load();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  // Dedupe + enriquecer + clasificar
  const { active, recent } = useMemo(() => {
    const map = new Map();

    for (const m of raw || []) {
      const id = m.matchId || m.id || buildSyntheticId(m);
      const startedAt = m.startedAt || m.createdAt || null;
      const status = (m.status || m.state || "").toString().toLowerCase();
      // heurística de activo: flag isActive, o status típico
      const isActive = "isActive" in m
        ? Boolean(m.isActive)
        : ("active" in m ? Boolean(m.active) : ["active","open","running","playing"].includes(status));

      const norm = {
        id,
        matchId: id,
        players: Array.isArray(m.players) ? m.players : [],
        startedAt,
        isActive,
        status
      };

      // dedupe por id conservando el más reciente
      const prev = map.get(id);
      if (!prev || (startedAt && (!prev.startedAt || new Date(startedAt) > new Date(prev.startedAt)))) {
        map.set(id, norm);
      }
    }

    const all = Array.from(map.values());
    const byDateDesc = (a, b) => (new Date(b.startedAt || 0) - new Date(a.startedAt || 0));

    const active = all.filter(x => x.isActive).sort(byDateDesc);
    // recientes = finalizadas en últimas 24h
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const recent = all.filter(x => !x.isActive && x.startedAt && new Date(x.startedAt).getTime() >= cutoff)
                      .sort(byDateDesc);

    return { active, recent };
  }, [raw]);

  const visible = tab === "active" ? active : recent;
  const totalLabel = tab === "active" ? `${active.length} ${active.length === 1 ? "sala" : "salas"} en juego`
                                      : `${recent.length} ${recent.length === 1 ? "sala" : "salas"} recientes`;
  if (loading) return <Skeleton />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">🎮 Partidas {tab === "active" ? "activas" : "recientes"}</h3>
          <div className="text-xs text-gray-500">
            {totalLabel}
            {lastUpdated && <> · Actualizado {lastUpdated.toLocaleTimeString("es-CO")}</>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("active")}
            className={`text-xs h-8 px-3 rounded-md border ${tab === "active" ? "bg-gray-100" : "hover:bg-gray-50"} border-gray-200`}
            title="En juego"
          >
            En juego
          </button>
          <button
            onClick={() => setTab("recent")}
            className={`text-xs h-8 px-3 rounded-md border ${tab === "recent" ? "bg-gray-100" : "hover:bg-gray-50"} border-gray-200`}
            title="Recientes (24h)"
          >
            Recientes
          </button>
          <button
            onClick={load}
            className="text-xs h-8 px-3 rounded-md border border-gray-200 hover:bg-gray-50"
            disabled={refreshing}
            title="Actualizar"
          >
            {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {!visible || visible.length === 0 ? (
        <p className="text-sm text-gray-600">
          {tab === "active" ? "No hay partidas en juego ahora mismo." : "No hay partidas recientes en las últimas 24 horas."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.slice(0, 50).map((m) => {
            const players = Array.isArray(m.players) ? m.players : [];
            const title =
              m.matchId && m.matchId !== "—"
                ? m.matchId
                : (players.map(p => p.alias || p.name || p.id).filter(Boolean).slice(0, 3).join(" vs ")) || "—";

            return (
              <li
                key={m.id}
                className="p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">Sala: {title || "—"}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                    {m.isActive ? `${players.length} conectados` : "finalizada"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {players.map((p, j) => (
                    <span key={p.id || p.alias || j} className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {p.alias || p.name || p.id}
                    </span>
                  ))}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  {m.startedAt ? `Inició: ${new Date(m.startedAt).toLocaleTimeString("es-CO")} · ${timeAgo(m.startedAt)}` : "—"}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
