import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCard from '../../components/StatsCard';
import { Clock } from 'lucide-react';

describe('StatsCard Component', () => {
    it('should render title and value correctly', () => {
        render(
            <StatsCard
                title="Total Hours"
                value="120.5h"
                icon={Clock}
                color="blue"
            />
        );

        expect(screen.getByText('Total Hours')).toBeInTheDocument();
        expect(screen.getByText('120.5h')).toBeInTheDocument();
    });

    it('should render subtitle when provided', () => {
        render(
            <StatsCard
                title="Total Hours"
                value="120.5h"
                subtitle="This week"
                icon={Clock}
                color="blue"
            />
        );

        expect(screen.getByText('This week')).toBeInTheDocument();
    });

    it('should display trend indicator when trend is provided', () => {
        const { container } = render(
            <StatsCard
                title="Total Hours"
                value="120.5h"
                icon={Clock}
                trend="up"
                trendValue="+15%"
                color="green"
            />
        );

        expect(screen.getByText('+15%')).toBeInTheDocument();
        // Check if trend icon is rendered (TrendingUp has specific class)
        const trendIcon = container.querySelector('.lucide-trending-up');
        expect(trendIcon).toBeInTheDocument();
    });

    it('should apply correct color classes', () => {
        const { container } = render(
            <StatsCard
                title="Test"
                value="100"
                icon={Clock}
                color="purple"
            />
        );

        // Check if purple color class is applied
        const iconContainer = container.querySelector('.bg-purple-50');
        expect(iconContainer).toBeInTheDocument();
    });

    it('should render icon component', () => {
        const { container } = render(
            <StatsCard
                title="Test"
                value="100"
                icon={Clock}
                color="blue"
            />
        );

        // Check for Clock icon (lucide icons have specific class)
        const icon = container.querySelector('.lucide-clock');
        expect(icon).toBeInTheDocument();
    });

    it('should handle missing trend gracefully', () => {
        render(
            <StatsCard
                title="Total Hours"
                value="120.5h"
                icon={Clock}
                color="blue"
            />
        );

        // Should not have trend indicator
        expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    });
});
