import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIAnalystPanel from '../components/AIAnalystPanel';

// Mock child components to isolate panel logic
vi.mock('../components/ProceduralRiteMap', () => ({ default: () => <div data-testid="rite-map" /> }));
vi.mock('../components/StatutoryLinker', () => ({ default: () => <div data-testid="statutory-linker" /> }));
vi.mock('../components/StrategyKanban', () => ({ default: () => <div data-testid="kanban" /> }));
vi.mock('../components/FilingControlHub', () => ({ default: () => <div data-testid="filing-hub" /> }));

describe('AIAnalystPanel Component Hardening', () => {
    const mockRecord = {
        procedural_phase: 'Postulatório',
        current_rite: 'Comum',
        ai_summary: 'Teste de sumário',
        ai_risk_score: 0.5,
        legal_basis: []
    };

    it('renders the insights tab by default', () => {
        render(<AIAnalystPanel isOpen={true} record={mockRecord} onClose={() => { }} />);
        expect(screen.getByText('Análise Técnica')).toBeDefined();
        expect(screen.getByTestId('rite-map')).toBeDefined();
    });

    it('switches to dialectic tab on click', () => {
        render(<AIAnalystPanel isOpen={true} record={mockRecord} onClose={() => { }} />);
        const dialecticBtn = screen.getByText('Dialética (IA)');
        fireEvent.click(dialecticBtn);
        expect(screen.getByTestId('kanban')).toBeDefined();
    });

    it('opens the Filing Control Hub overlay when initiated', () => {
        render(<AIAnalystPanel isOpen={true} record={mockRecord} onClose={() => { }} />);
        const filingBtn = screen.getByText('Iniciar Protocolo MNI 2.0');
        fireEvent.click(filingBtn);
        expect(screen.getByTestId('filing-hub')).toBeDefined();
    });
});
