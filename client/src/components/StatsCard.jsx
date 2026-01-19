import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary/10 text-black border-primary/20',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp size={14} className="text-green-500" />;
        if (trend === 'down') return <TrendingDown size={14} className="text-red-500" />;
        return <Minus size={14} className="text-gray-400" />;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                {trendValue && (
                    <div className="flex items-center gap-1 text-sm font-semibold">
                        {getTrendIcon()}
                        <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}>
                            {trendValue}
                        </span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );
};

export default StatsCard;
