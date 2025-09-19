// src/pages/Dashboard.jsx
import GlobalStats from "../components/stats/GlobalStats.jsx";
import PlayersByMatch from "../components/live/PlayersByMatch.jsx";
import QuestionsFeed from "../components/questions/QuestionsFeed.jsx";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            📊 Dashboard · Preguntados
          </h1>
          <span className="text-xs md:text-sm text-gray-500">
            Actualizado {new Date().toLocaleDateString("es-CO")}
          </span>
        </div>

        {/* KPIs + charts */}
        <GlobalStats />

        {/* Feed de preguntas + partidas activas */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuestionsFeed />
          </div>
          <div>
            <PlayersByMatch />
          </div>
        </div>
      </div>
    </div>
  );
}
