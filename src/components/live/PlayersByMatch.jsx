export default function PlayersByMatch() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-lg font-semibold mb-3">🎮 Partidas activas</h3>
      <p className="text-sm text-gray-600">
        No disponible: el backend no expone <code>GET /trivia/rooms/active</code>.
        Actualmente solo existen endpoints <strong>POST</strong> para rooms.
      </p>
    </div>
  );
}
