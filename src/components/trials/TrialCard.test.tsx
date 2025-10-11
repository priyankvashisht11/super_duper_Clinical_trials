import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { vi } from 'vitest';
import { theme } from '../../styles/theme';
import { TrialCard } from './TrialCard';
import type { ClinicalTrial } from '../../types';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import test from 'node:test';
import test from 'node:test';
import test from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock trial data for testing
const mockTrial: ClinicalTrial = {
  id: 'trial-123',
  ctriNumber: 'CTRI/2024/01/012345',
  title: 'Efficacy of Novel Diabetes Treatment in Type 2 Diabetes Patients',
  briefSummary: 'This is a Phase III randomized controlled trial to evaluate the efficacy and safety of a novel diabetes treatment compared to standard care in patients with Type 2 diabetes.',
  detailedDescription: 'Detailed description of the trial...',
  phase: 'III',
  studyType: 'Interventional',
  recruitmentStatus: 'recruiting',
  condition: 'Type 2 Diabetes',
  intervention: 'Novel Diabetes Drug',
  inclusionCriteria: ['Age 18-65', 'Diagnosed Type 2 Diabetes'],
  exclusionCriteria: ['Pregnancy', 'Severe kidney disease'],
  primarySponsor: 'AIIMS Delhi',
  principalInvestigator: 'Dr. Rajesh Sharma',
  locations: [
    {
      hospital: 'AIIMS Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      coordinates: { lat: 28.5665, lng: 77.2090 }
    },
    {
      hospital: 'PGIMER Chandigarh',
      city: 'Chandigarh',
      state: 'Punjab',
      country: 'India'
    }
  ],
  contactInfo: {
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@aiims.edu',
    phone: '+91-11-26588500'
  },
  startDate: new Date('2024-01-15'),
  completionDate: new Date('2025-12-31'),
  lastUpdated: new Date('2024-01-10')
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('TrialCard Component', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('Basic Rendering', () => {
    test('renders trial information correctly', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} />
        </TestWrapper>
      );

      // Check CTRI number
      expect(screen.getByText('CTRI/2024/01/012345')).toBeInTheDocument();
      
      // Check title
      expect(screen.getByText('Efficacy of Novel Diabetes Treatment in Type 2 Diabetes Patients')).toBeInTheDocument();
      
      // Check brief summary
      expect(screen.getByText(/This is a Phase III randomized controlled trial/)).toBeInTheDocument();
      
      // Check phase
      expect(screen.getByText('Phase III')).toBeInTheDocument();
      
      // Check recruitment status
      expect(screen.getByText('Recruiting')).toBeInTheDocument();
      
      // Check sponsor
      expect(screen.getByText('AIIMS Delhi')).toBeInTheDocument();
      
      // Check principal investigator
      expect(screen.getByText('PI: Dr. Rajesh Sharma')).toBeInTheDocument();
    });

    test('displays location information correctly', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} />
        </TestWrapper>
      );

      expect(screen.getByText('New Delhi, Delhi +1 more')).toBeInTheDocument();
    });

    test('shows distance when provided', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} showDistance={true} distance={15.5} />
        </TestWrapper>
      );

      expect(screen.getByText('(15.5 km)')).toBeInTheDocument();
    });
  });

  describe('Status Chips', () => {
    test('displays recruiting status with correct styling', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} />
        </TestWrapper>
      );

      const statusChip = screen.getByText('Recruiting');
      expect(statusChip).toBeInTheDocument();
      expect(statusChip.closest('.MuiChip-root')).toHaveStyle({
        color: theme.palette.status.recruiting
      });
    });

    test('displays different recruitment statuses correctly', () => {
      const statuses: Array<{ status: any; label: string }> = [
        { status: 'not_yet_recruiting', label: 'Not Yet Recruiting' },
        { status: 'completed', label: 'Completed' },
        { status: 'suspended', label: 'Suspended' }
      ];

      statuses.forEach(({ status, label }) => {
        const { unmount } = render(
          <TestWrapper>
            <TrialCard trial={{ ...mockTrial, recruitmentStatus: status }} />
          </TestWrapper>
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });

    test('displays phase chips with correct colors', () => {
      const phases: Array<{ phase: any; label: string }> = [
        { phase: 'I', label: 'Phase I' },
        { phase: 'II', label: 'Phase II' },
        { phase: 'IV', label: 'Phase IV' }
      ];

      phases.forEach(({ phase, label }) => {
        const { unmount } = render(
          <TestWrapper>
            <TrialCard trial={{ ...mockTrial, phase }} />
          </TestWrapper>
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Bookmark Functionality', () => {
    test('handles bookmark toggle correctly', () => {
      const onBookmark = vi.fn();
      
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} onBookmark={onBookmark} />
        </TestWrapper>
      );

      const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
      fireEvent.click(bookmarkButton);

      expect(onBookmark).toHaveBeenCalledWith('trial-123', true);
    });

    test('updates local storage when bookmarking', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} />
        </TestWrapper>
      );

      const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
      fireEvent.click(bookmarkButton);

      const bookmarkedTrials = JSON.parse(mockLocalStorage.getItem('bookmarkedTrials') || '[]');
      expect(bookmarkedTrials).toContain('trial-123');
    });

    test('removes bookmark from local storage when unbookmarking', () => {
      // Pre-populate localStorage
      mockLocalStorage.setItem('bookmarkedTrials', JSON.stringify(['trial-123']));

      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} isBookmarked={true} />
        </TestWrapper>
      );

      const bookmarkButton = screen.getByRole('button', { name: /remove bookmark/i });
      fireEvent.click(bookmarkButton);

      const bookmarkedTrials = JSON.parse(mockLocalStorage.getItem('bookmarkedTrials') || '[]');
      expect(bookmarkedTrials).not.toContain('trial-123');
    });
  });

  describe('Selection Functionality', () => {
    test('shows selection checkbox when selectable', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} selectable={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId('select-trial-checkbox')).toBeInTheDocument();
    });

    test('hides selection checkbox when not selectable', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} selectable={false} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('select-trial-checkbox')).not.toBeInTheDocument();
    });

    test('handles selection toggle correctly', () => {
      const onSelect = vi.fn();
      
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} selectable={true} onSelect={onSelect} />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onSelect).toHaveBeenCalledWith('trial-123', true);
    });

    test('applies selected styling when selected', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} isSelected={true} />
        </TestWrapper>
      );

      const card = screen.getByTestId('trial-card');
      expect(card).toHaveClass('selected');
    });
  });

  describe('Action Buttons', () => {
    test('renders action buttons correctly', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate summary/i })).toBeInTheDocument();
    });

    test('calls onViewDetails when View Details button is clicked', () => {
      const onViewDetails = vi.fn();
      
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} onViewDetails={onViewDetails} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /view details/i }));
      expect(onViewDetails).toHaveBeenCalledWith('trial-123');
    });

    test('calls onGenerateSummary when Generate Summary button is clicked', () => {
      const onGenerateSummary = vi.fn();
      
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} onGenerateSummary={onGenerateSummary} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByRole('button', { name: /generate summary/i }));
      expect(onGenerateSummary).toHaveBeenCalledWith('trial-123');
    });

    test('disables Generate Summary button when no handler provided', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /generate summary/i });
      expect(generateButton).toBeDisabled();
    });
  });

  describe('Hover Effects and Interactions', () => {
    test('applies hover effects on card hover', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} />
        </TestWrapper>
      );

      const card = screen.getByTestId('trial-card');
      
      // Test that the card has the proper hover styles defined
      expect(card).toHaveStyle({
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out'
      });
    });

    test('calls onViewDetails when card is clicked and not selectable', () => {
      const onViewDetails = vi.fn();
      
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} onViewDetails={onViewDetails} selectable={false} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('trial-card'));
      expect(onViewDetails).toHaveBeenCalledWith('trial-123');
    });

    test('does not call onViewDetails when card is clicked and selectable', () => {
      const onViewDetails = vi.fn();
      
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} onViewDetails={onViewDetails} selectable={true} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('trial-card'));
      expect(onViewDetails).not.toHaveBeenCalled();
    });
  });

  describe('Text Highlighting', () => {
    test('highlights matching text when highlightMatching is provided', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} highlightMatching="diabetes" />
        </TestWrapper>
      );

      // Check if highlighted text exists (the highlighting creates spans with background color)
      // Since the text is split by highlighting, we need to check for the highlighted spans
      const highlightedElements = screen.getAllByText('Diabetes');
      expect(highlightedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    test('renders in compact mode correctly', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} compact={true} />
        </TestWrapper>
      );

      // In compact mode, PI information should not be visible
      expect(screen.queryByText('PI: Dr. Rajesh Sharma')).not.toBeInTheDocument();
      
      // Brief summary should not be visible in compact mode
      expect(screen.queryByText(/This is a Phase III randomized controlled trial/)).not.toBeInTheDocument();
    });

    test('shows full content in non-compact mode', () => {
      render(
        <TestWrapper>
          <TrialCard trial={mockTrial} compact={false} />
        </TestWrapper>
      );

      // In non-compact mode, all information should be visible
      expect(screen.getByText('PI: Dr. Rajesh Sharma')).toBeInTheDocument();
      expect(screen.getByText(/This is a Phase III randomized controlled trial/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles trial with no locations', () => {
      const trialWithoutLocations = { ...mockTrial, locations: [] };
      
      render(
        <TestWrapper>
          <TrialCard trial={trialWithoutLocations} />
        </TestWrapper>
      );

      expect(screen.getByText('Location not specified')).toBeInTheDocument();
    });

    test('handles trial with single location', () => {
      const trialWithSingleLocation = { 
        ...mockTrial, 
        locations: [mockTrial.locations[0]] 
      };
      
      render(
        <TestWrapper>
          <TrialCard trial={trialWithSingleLocation} />
        </TestWrapper>
      );

      expect(screen.getByText('New Delhi, Delhi')).toBeInTheDocument();
      expect(screen.queryByText('+1 more')).not.toBeInTheDocument();
    });

    test('prevents event propagation on button clicks', () => {
      const onViewDetails = vi.fn();
      const onGenerateSummary = vi.fn();
      
      render(
        <TestWrapper>
          <TrialCard 
            trial={mockTrial} 
            onViewDetails={onViewDetails}
            onGenerateSummary={onGenerateSummary}
          />
        </TestWrapper>
      );

      // Click on action buttons should not trigger card click
      fireEvent.click(screen.getByRole('button', { name: /view details/i }));
      fireEvent.click(screen.getByRole('button', { name: /generate summary/i }));

      // onViewDetails should only be called once (from the button click, not card click)
      expect(onViewDetails).toHaveBeenCalledTimes(1);
      expect(onGenerateSummary).toHaveBeenCalledTimes(1);
    });
  });
});