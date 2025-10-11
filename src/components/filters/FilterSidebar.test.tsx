import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { FilterSidebar } from '../layout/FilterSidebar';
import theme from '../../styles/theme';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('FilterSidebar', () => {
  it('renders filter sidebar with basic elements', () => {
    renderWithProviders(
      <FilterSidebar
        open={true}
        mobileOpen={false}
        onClose={() => {}}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Medical Condition')).toBeInTheDocument();
    expect(screen.getByText('Trial Phase')).toBeInTheDocument();
    expect(screen.getByText('Recruitment Status')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Age Range')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
  });
});