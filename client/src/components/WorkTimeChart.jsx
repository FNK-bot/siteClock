import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const WorkTimeChart = ({ data = [] }) => {
    // Format data for chart
    const chartData = data.map(item => ({
        name: item.employee.name || 'Unknown',
        hours: item.totalHours,
        sessions: item.totalSessions,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                    <p className="font-bold text-gray-900 mb-2">{payload[0].payload.name}</p>
                    <div className="space-y-1 text-sm">
                        <p className="text-blue-600 font-semibold">
                            Total Hours: {payload[0].value.toFixed(2)}h
                        </p>
                        <p className="text-purple-600 font-semibold">
                            Sessions: {payload[0].payload.sessions}
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
                <p>No work time data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md text-sm">
                    Work Hours
                </span>
                Employee Work Time Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontWeight: 600 } }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Bar
                        dataKey="hours"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                        name="Total Hours"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WorkTimeChart;
