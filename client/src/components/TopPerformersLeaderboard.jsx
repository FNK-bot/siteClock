import { Trophy, Medal, Award, Clock, CheckCircle } from 'lucide-react';

const TopPerformersLeaderboard = ({ performers = [] }) => {
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="text-yellow-500" size={24} />;
            case 2:
                return <Medal className="text-gray-400" size={24} />;
            case 3:
                return <Award className="text-amber-600" size={24} />;
            default:
                return <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{rank}</div>;
        }
    };

    const getRankBadgeColor = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg';
            case 2:
                return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md';
            case 3:
                return 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (performers.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top Performers</h3>
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Trophy size={48} className="mb-4 opacity-20" />
                    <p>No performance data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-md text-sm">
                    Leaderboard
                </span>
                Top Performers
            </h3>
            <div className="space-y-3">
                {performers.map((performer) => (
                    <div
                        key={performer.employee.id}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] ${performer.rank <= 3
                                ? 'bg-gradient-to-r from-gray-50 to-white border-2 border-primary/20 shadow-sm'
                                : 'bg-gray-50 border border-gray-100'
                            }`}
                    >
                        {/* Rank Badge */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(performer.rank)}`}>
                            {performer.rank <= 3 ? (
                                getRankIcon(performer.rank)
                            ) : (
                                <span className="text-lg font-black">{performer.rank}</span>
                            )}
                        </div>

                        {/* Employee Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">{performer.employee.name}</h4>
                            <p className="text-xs text-gray-500 font-medium">{performer.employee.userId || performer.employee.email}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 items-center">
                            {/* Completed Tasks */}
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-green-600 mb-1">
                                    <CheckCircle size={14} />
                                    <span className="text-lg font-black">{performer.completedTasks}</span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tasks</p>
                            </div>

                            {/* Total Hours */}
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-blue-600 mb-1">
                                    <Clock size={14} />
                                    <span className="text-lg font-black">{performer.totalHours.toFixed(1)}</span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hours</p>
                            </div>

                            {/* Performance Score */}
                            <div className="text-center bg-white px-3 py-2 rounded-lg border border-gray-200">
                                <p className="text-lg font-black text-purple-600">{performer.performanceScore.toFixed(0)}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopPerformersLeaderboard;
