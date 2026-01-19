import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';

const WorkTimeTrendChart = ({ data = [] }) => {
    // Format data for chart
    const chartData = data.map(item => ({
        date: format(parseISO(item.date), 'MMM dd'),
        fullDate: item.date,
        totalHours: item.totalHours,
        avgHours: item.avgHours,
        employees: item.employeeCount,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                    <p className="font-bold text-gray-900 mb-2">{payload[0].payload.date}</p>
                    <div className="space-y-1 text-sm">
                        <p className="text-blue-600 font-semibold">
                            Total Hours: {payload[0].value.toFixed(2)}h
                        </p>
                        <p className="text-green-600 font-semibold">
                            Avg Hours: {payload[0].payload.avgHours.toFixed(2)}h
                        </p>
                        <p className="text-purple-600 font-semibold">
                            Employees: {payload[0].payload.employees}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <p>No trend data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-md text-sm">
                    Trends
                </span>
                Work Time Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontWeight: 600 } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Area
                        type="monotone"
                        dataKey="totalHours"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#colorHours)"
                        name="Total Hours"
                    />
                    <Line
                        type="monotone"
                        dataKey="avgHours"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                        name="Avg Hours per Employee"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WorkTimeTrendChart;
