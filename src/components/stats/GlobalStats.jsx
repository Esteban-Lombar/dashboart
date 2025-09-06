// src/components/stats/GlobalStats.jsx
import { useEffect, useState, useMemo } from "react";
import { getOverview } from "../../api/dashboard"; // <-- o "../../api/dashboart" si elegiste Opción B
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";

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

export default function GlobalStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getOverview();
        if (mounted) setData(res || {});
      } catch (e) {
        console.error("Error cargando overview:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const catData = useMemo(
    () => (data?.topCategories || []).map(c => ({
      name: c.category,
      value: Math.round((c.accuracy || 0) * 100),
    })),
    [data]
  );

  if (loading) return <Skeleton />;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Partidas jugadas" value={data?.playedMatches ?? 0} />
        <StatCard label="Ganadores distintos" value={(data?.winnersRanking || []).length} />
        <StatCard label="Top categoría" value={catData[0]?.value ? `${catData[0].value}%` : "—"} />
        <StatCard label="Actualizado" value={new Date().toLocaleDateString("es-CO")} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold mb-3">🏆 Ranking de ganadores</h3>
        {(data?.winnersRanking || []).length === 0 ? (
          <p className="text-sm text-gray-600">Sin datos</p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.winnersRanking} margin={{ top: 10, right: 20, left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="alias" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="wins" name="Victorias" fill="#8884d8" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold mb-3">📚 Categorías más acertadas</h3>
        {catData.length === 0 ? (
          <p className="text-sm text-gray-600">Sin datos</p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" outerRadius={100}>
                  {catData.map((_, i) => <Cell key={i} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, "Acierto"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
