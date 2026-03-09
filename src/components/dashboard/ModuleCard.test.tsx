import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ModuleCard } from './ModuleCard';
import { Home } from 'lucide-react';
import { describe, it, expect } from 'vitest';

describe('ModuleCard Component', () => {
    const defaultProps = {
        title: 'Test Title',
        description: 'Test Description',
        linkText: 'Go to Test',
        linkTo: '/test-route',
        Icon: Home,
        colorTheme: 'blue' as const,
    };

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>);
    };

    it('renders the component with basic props correctly', () => {
        renderWithRouter(<ModuleCard {...defaultProps} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Go to Test')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/test-route');
    });

    it('renders the "¡Nuevo!" badge when isNew prop is true', () => {
        renderWithRouter(<ModuleCard {...defaultProps} isNew={true} />);

        expect(screen.getByText('¡Nuevo!')).toBeInTheDocument();
    });

    it('does not render the "¡Nuevo!" badge when isNew prop is false or missing', () => {
        renderWithRouter(<ModuleCard {...defaultProps} isNew={false} />);

        expect(screen.queryByText('¡Nuevo!')).not.toBeInTheDocument();
    });

    it('applies the correct gradient theme styles', () => {
        renderWithRouter(<ModuleCard {...defaultProps} colorTheme="gradient" />);

        const link = screen.getByRole('link');
        expect(link.parentElement).toHaveClass('mt-auto pt-4 border-t border-white/20');
        expect(link).toHaveClass('flex items-center text-sm font-semibold hover:text-white group transition-colors text-white');
    });

    it('applies the correct orange theme specific elements', () => {
        const { container } = renderWithRouter(<ModuleCard {...defaultProps} colorTheme="orange" />);

        const blurDiv = container.querySelector('.absolute.top-0.right-0.-mt-4.-mr-4.bg-orange-100');
        expect(blurDiv).toBeInTheDocument();
    });

    it('applies standard styles for non-gradient themes', () => {
        renderWithRouter(<ModuleCard {...defaultProps} colorTheme="blue" />);

        const link = screen.getByRole('link');
        expect(link.parentElement).toHaveClass('mt-8 flex gap-3 relative');
        expect(link).toHaveClass('flex-1 py-3 px-4 bg-coreops-primary hover:bg-coreops-secondary text-white text-center rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2');
    });
});
