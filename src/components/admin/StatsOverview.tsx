interface StatsOverviewProps {
    stats: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        flights: number;
        hotels: number;
        carRentals: number;
    };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Bookings */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Total Réservations</h3>
                    <span className="text-3xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <div className="mt-4 text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                        <span>✈️ Vols:</span>
                        <span className="font-semibold">{stats.flights}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>🏨 Hôtels:</span>
                        <span className="font-semibold">{stats.hotels}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>🚗 Voitures:</span>
                        <span className="font-semibold">{stats.carRentals}</span>
                    </div>
                </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">En Attente</h3>
                    <span className="text-3xl">⏳</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-600 mt-2">Nécessitent une action</p>
            </div>

            {/* Confirmed */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Confirmées</h3>
                    <span className="text-3xl">✓</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                <p className="text-xs text-gray-600 mt-2">Réservations actives</p>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Terminées</h3>
                    <span className="text-3xl">🎉</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
                <p className="text-xs text-gray-600 mt-2">
                    {stats.cancelled} annulées
                </p>
            </div>
        </div>
    );
}
