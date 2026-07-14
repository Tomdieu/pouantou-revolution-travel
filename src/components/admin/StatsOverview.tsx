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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Total Réservations</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                        <span>Vols</span>
                        <span className="font-medium text-slate-700">{stats.flights}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Hôtels</span>
                        <span className="font-medium text-slate-700">{stats.hotels}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Voitures</span>
                        <span className="font-medium text-slate-700">{stats.carRentals}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">En attente</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                <p className="text-xs text-slate-500 mt-2">Nécessitent une action</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Confirmées</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.confirmed}</p>
                <p className="text-xs text-slate-500 mt-2">Réservations actives</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-500">Terminées</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                <p className="text-xs text-slate-500 mt-2">
                    {stats.cancelled} annulées
                </p>
            </div>
        </div>
    );
}
