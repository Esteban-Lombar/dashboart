export default function GlobalStats() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold mb-3">📈 Estadísticas globales</h3>
        <p className="text-sm text-gray-600">
          No disponible: el backend no expone <code>GET /trivia/questions/overview</code>.
          Cuando lo agreguen (partidas jugadas, ranking, categorías), activamos este panel.
        </p>
      </div>
    </div>
  );
}
