import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopPerformersLeaderboard from '../../components/TopPerformersLeaderboard';

describe('TopPerformersLeaderboard Component', () => {
    const mockPerformers = [
        {
            rank: 1,
            employee: { id: '1', name: 'Alice Johnson', userId: 'EMP001', email: 'alice@example.com' },
            completedTasks: 25,
            totalHours: 120.5,
            avgSessionHours: 4.8,
            performanceScore: 491
        },
        {
            rank: 2,
            employee: { id: '2', name: 'Bob Smith', userId: 'EMP002', email: 'bob@example.com' },
            completedTasks: 22,
            totalHours: 105.2,
            avgSessionHours: 4.5,
            performanceScore: 430.4
        },
        {
            rank: 3,
            employee: { id: '3', name: 'Carol White', userId: 'EMP003', email: 'carol@example.com' },
            completedTasks: 20,
            totalHours: 98.3,
            avgSessionHours: 4.9,
            performanceScore: 396.6
        },
        {
            rank: 4,
            employee: { id: '4', name: 'David Brown', userId: 'EMP004', email: 'david@example.com' },
            completedTasks: 18,
            totalHours: 85.0,
            avgSessionHours: 4.7,
            performanceScore: 350
        }
    ];

    it('should render component title', () => {
        render(<TopPerformersLeaderboard performers={mockPerformers} />);
        expect(screen.getByText('Top Performers')).toBeInTheDocument();
    });

    it('should render all performers', () => {
        render(<TopPerformersLeaderboard performers={mockPerformers} />);
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Carol White')).toBeInTheDocument();
        expect(screen.getByText('David Brown')).toBeInTheDocument();
    });

    it('should display employee user IDs', () => {
        render(<TopPerformersLeaderboard performers={mockPerformers} />);
        expect(screen.getByText('EMP001')).toBeInTheDocument();
        expect(screen.getByText('EMP002')).toBeInTheDocument();
    });

    it('should show completed tasks count', () => {
        render(<TopPerformersLeaderboard performers={mockPerformers} />);
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('22')).toBeInTheDocument();
    });

    it('should display total hours with one decimal', () => {
        render(<TopPerformersLeaderboard performers={mockPerformers} />);
        // Check for formatted hours (toFixed(1))
        expect(screen.getByText('120.5')).toBeInTheDocument();
        expect(screen.getByText('105.2')).toBeInTheDocument();
    });

    it('should show performance scores', () => {
        render(<TopPerformersLeaderboard performers={mockPerformers} />);
        expect(screen.getByText('491')).toBeInTheDocument();
        expect(screen.getByText('430')).toBeInTheDocument();
    });

    it('should render trophy icon for rank 1', () => {
        const { container } = render(<TopPerformersLeaderboard performers={mockPerformers} />);
        const trophyIcon = container.querySelector('.lucide-trophy');
        expect(trophyIcon).toBeInTheDocument();
    });

    it('should render medal icon for rank 2', () => {
        const { container } = render(<TopPerformersLeaderboard performers={mockPerformers} />);
        const medalIcon = container.querySelector('.lucide-medal');
        expect(medalIcon).toBeInTheDocument();
    });

    it('should render award icon for rank 3', () => {
        const { container } = render(<TopPerformersLeaderboard performers={mockPerformers} />);
        const awardIcon = container.querySelector('.lucide-award');
        expect(awardIcon).toBeInTheDocument();
    });

    it('should display rank number for positions 4+', () => {
        render(<TopPerformersLeaderboard performers={mockPerformers} />);
        expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should show empty state when no performers', () => {
        render(<TopPerformersLeaderboard performers={[]} />);
        expect(screen.getByText('No performance data available')).toBeInTheDocument();
    });

    it('should render labels for stats', () => {
        render(<TopPerformersLeaderboard performers={mockPerformers} />);
        // Check for stat labels (multiple instances)
        const tasksLabels = screen.getAllByText('Tasks');
        const hoursLabels = screen.getAllByText('Hours');
        const scoreLabels = screen.getAllByText('Score');

        expect(tasksLabels.length).toBeGreaterThan(0);
        expect(hoursLabels.length).toBeGreaterThan(0);
        expect(scoreLabels.length).toBeGreaterThan(0);
    });
});
