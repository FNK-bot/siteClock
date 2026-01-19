import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkTimeChart from '../../components/WorkTimeChart';

describe('WorkTimeChart Component', () => {
    const mockData = [
        {
            employee: { name: 'John Doe', id: '1' },
            totalHours: 45.5,
            totalSessions: 10,
            avgSessionHours: 4.55
        },
        {
            employee: { name: 'Jane Smith', id: '2' },
            totalHours: 38.2,
            totalSessions: 8,
            avgSessionHours: 4.78
        }
    ];

    it('should render chart title', () => {
        render(<WorkTimeChart data={mockData} />);
        expect(screen.getByText('Employee Work Time Comparison')).toBeInTheDocument();
    });

    it('should render Work Hours badge', () => {
        render(<WorkTimeChart data={mockData} />);
        expect(screen.getByText('Work Hours')).toBeInTheDocument();
    });

    it('should display empty state when no data provided', () => {
        render(<WorkTimeChart data={[]} />);
        expect(screen.getByText('No work time data available')).toBeInTheDocument();
    });

    it('should handle undefined data gracefully', () => {
        render(<WorkTimeChart />);
        expect(screen.getByText('No work time data available')).toBeInTheDocument();
    });

    it('should render chart container when data is provided', () => {
        const { container } = render(<WorkTimeChart data={mockData} />);
        // Check that the chart wrapper div exists
        const chartWrapper = container.querySelector('.bg-white.rounded-2xl');
        expect(chartWrapper).toBeInTheDocument();
    });

    it('should not show empty state when data exists', () => {
        render(<WorkTimeChart data={mockData} />);
        expect(screen.queryByText('No work time data available')).not.toBeInTheDocument();
    });
});
