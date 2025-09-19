// src/components/stats/GlobalStats.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { getOverview } from "../../api/dashboard";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";

// 🎨 Paleta de colores para las categorías
const CATEGORY_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE"];

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
    <p className="text-sm text-gray-500 mb-2">{label}</p>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
  </div>
);

const Skeleton = () => (
  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div className="h-4 w-28 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

// 🔄 Normaliza la respuesta del backend
function normalizeOverview(raw) {
  if (Array.isArray(raw)) {
    const freq = new Map();
    for (const q of raw) {
      const cat = q.categoria ?? q.category ?? "—";
      freq.set(cat, (freq.get(cat) || 0) + 1);
    }
    const arr = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
    const total = arr.reduce((acc, [, c]) => acc + c, 0) || 1;
    const topCategories = arr.map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
    }));
    return {
      modoInferido: true,
      playedMatches: 0,
      winners: [],
      topCategories,
      totalCorrect: 0,
      totalWrong: 0,
    };
  }

  const totals = raw?.totals || {};
  const totalGames = Number(totals.totalGames ?? 0) || 0;
  const totalCorrect = Number(totals.totalCorrect ?? 0) || 0;
  const totalWrong = Number(totals.totalWrong ?? 0) || 0;

  const winners = Array.isArray(raw?.topWinners)
    ? raw.topWinners.map(w => ({
        alias: w.username ?? w.alias ?? "—",
        wins: Number(w.gamesWon ?? w.wins ?? 0) || 0,
      }))
    : [];

  const totalCorrectBase = totalCorrect > 0
    ? totalCorrect
    : (Array.isArray(raw?.topCategories)
        ? raw.topCategories.reduce((acc, c) => acc + (Number(c.correctAnswers || 0)), 0)
        : 0);

  const topCategories = Array.isArray(raw?.topCategories)
    ? raw.topCategories.map(c => {
        const name = c.category ?? c.nombre ?? c.name ?? "—";
        const correct = Number(c.correctAnswers ?? 0) || 0;
        const pct = totalCorrectBase > 0 ? Math.round((correct / totalCorrectBase) * 100) : 0;
        return { name, value: pct };
      })
    : [];

  topCategories.sort((a, b) => b.value - a.value);
  winners.sort((a, b) => b.wins - a.wins);

  return {
    modoInferido: false,
    playedMatches: totalGames,
    winners,
    topCategories,
    totalCorrect,
    totalWrong,
  };
}

export default function GlobalStats() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);
      const raw = await getOverview();
      const normalized = normalizeOverview(raw);
      setOverview(normalized);
    } catch (e) {
      console.error("getOverview:", e);
      setError("No se pudo cargar estadísticas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const onVis = () => document.visibilityState === "visible" && fetchData();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [fetchData]);

  if (loading) return <Skeleton />;

  const winners = overview?.winners ?? [];
  const topCategories = overview?.topCategories ?? [];
  const playedMatches = overview?.playedMatches ?? 0;
  const totalCorrect = overview?.totalCorrect ?? 0;
  const totalWrong = overview?.totalWrong ?? 0;
  const labelTop = overview?.modoInferido ? "Categorías más frecuentes" : "Categorías más acertadas";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📈 Estadísticas globales</h3>
        <button
          onClick={fetchData}
          className="ml-4 text-xs h-8 px-3 rounded-md border border-gray-200 hover:bg-gray-50"
          disabled={refreshing}
          title="Actualizar"
        >
          {refreshing ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Partidas jugadas" value={playedMatches} />
        <StatCard label="Ganadores distintos" value={winners.length} />
        <StatCard label="Aciertos totales" value={totalCorrect} />
        <StatCard label="Errores totales" value={totalWrong} />
      </div>

      {/* Ranking */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h4 className="text-base font-semibold mb-3">🏆 Ranking de ganadores</h4>
        {winners.length === 0 ? (
          <p className="text-sm text-gray-600">Sin datos</p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winners} margin={{ top: 10, right: 20, left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="alias" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="wins" name="Victorias" fill="#8884d8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Categorías */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h4 className="text-base font-semibold mb-3">📚 {labelTop}</h4>
        {topCategories.length === 0 ? (
          <p className="text-sm text-gray-600">Sin datos</p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topCategories} dataKey="value" nameKey="name" outerRadius={100} labelLine={false}>
                  {topCategories.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, overview?.modoInferido ? "Frecuencia" : "Acierto"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
}
