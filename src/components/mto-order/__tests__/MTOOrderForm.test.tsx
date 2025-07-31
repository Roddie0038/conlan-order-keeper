/**
 * Component Tests: MTOOrderForm.tsx
 * Tests MTO-specific form functionality and real-time features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MTOOrderForm } from '../MTOOrderForm';
import { PlantProvider } from '@/contexts/PlantContext';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@conlantire.com' }
  })
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/services/orderService/MTOOrderService', () => ({
  mtoOrderService: {
    createMTOOrder: vi.fn(() => Promise.resolve({ success: true, orderId: 'mto-123' })),
    validateMTOData: vi.fn(() => ({ isValid: true, errors: [] })),
    getAvailableTreads: vi.fn(() => Promise.resolve(['11L', '12L', '13L'])),
    checkCasingAvailability: vi.fn(() => Promise.resolve({ available: true, eta: null }))
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PlantProvider>
        {children}
      </PlantProvider>
    </QueryClientProvider>
  );
};

describe('MTOOrderForm Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders MTO-specific fields', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/tire size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tread pattern/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/casing grade/i)).toBeInTheDocument();
      expect(screen.getByText(/do you have casings/i)).toBeInTheDocument();
    });

    it('displays all form sections correctly', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      expect(screen.getByText(/order details/i)).toBeInTheDocument();
      expect(screen.getByText(/tire specifications/i)).toBeInTheDocument();
      expect(screen.getByText(/casing information/i)).toBeInTheDocument();
      expect(screen.getByText(/delivery schedule/i)).toBeInTheDocument();
    });

    it('shows progress indicator correctly', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Check for step indicators
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
      expect(screen.getByText(/step 3/i)).toBeInTheDocument();
      expect(screen.getByText(/step 4/i)).toBeInTheDocument();
    });
  });

  describe('MTO-Specific Validation', () => {
    it('validates tire size format', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      const tireSizeInput = screen.getByLabelText(/tire size/i);
      fireEvent.change(tireSizeInput, { target: { value: 'invalid-size' } });
      fireEvent.blur(tireSizeInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid tire size format/i)).toBeInTheDocument();
      });
    });

    it('validates tread pattern selection', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      const nextButton = screen.getByText(/continue to tire specifications/i);
      fireEvent.click(nextButton);

      // Go to next step without selecting tread
      const continueButton = screen.getByText(/continue to casing information/i);
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/tread pattern is required/i)).toBeInTheDocument();
      });
    });

    it('validates casing information', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Navigate to casing section
      const steps = screen.getAllByText(/continue/i);
      fireEvent.click(steps[0]); // Continue to tire specs
      fireEvent.click(steps[1]); // Continue to casing info

      const submitButton = screen.getByText(/submit mto order/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/casing grade is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Inventory Checks', () => {
    it('checks casing availability when tire size changes', async () => {
      const mockCheckCasings = vi.fn(() => Promise.resolve({ 
        available: true, 
        eta: null 
      }));

      vi.mocked(require('@/services/orderService/MTOOrderService').mtoOrderService.checkCasingAvailability)
        .mockImplementation(mockCheckCasings);

      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      const tireSizeInput = screen.getByLabelText(/tire size/i);
      fireEvent.change(tireSizeInput, { target: { value: '11R22.5' } });

      await waitFor(() => {
        expect(mockCheckCasings).toHaveBeenCalledWith('11R22.5');
      });
    });

    it('displays casing availability status', async () => {
      vi.mocked(require('@/services/orderService/MTOOrderService').mtoOrderService.checkCasingAvailability)
        .mockResolvedValue({ available: false, eta: '2024-02-15' });

      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      const tireSizeInput = screen.getByLabelText(/tire size/i);
      fireEvent.change(tireSizeInput, { target: { value: '11R22.5' } });

      await waitFor(() => {
        expect(screen.getByText(/casings not currently in stock/i)).toBeInTheDocument();
        expect(screen.getByText(/estimated arrival.*feb.*15/i)).toBeInTheDocument();
      });
    });

    it('loads available treads dynamically', async () => {
      const mockGetTreads = vi.fn(() => Promise.resolve(['11L', '12L', '13L']));

      vi.mocked(require('@/services/orderService/MTOOrderService').mtoOrderService.getAvailableTreads)
        .mockImplementation(mockGetTreads);

      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockGetTreads).toHaveBeenCalled();
      });

      // Navigate to tread section
      const continueButton = screen.getByText(/continue to tire specifications/i);
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/11L/)).toBeInTheDocument();
        expect(screen.getByText(/12L/)).toBeInTheDocument();
        expect(screen.getByText(/13L/)).toBeInTheDocument();
      });
    });
  });

  describe('Conditional Fields', () => {
    it('shows projected delivery when casings not available', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Navigate to casing section
      const steps = screen.getAllByText(/continue/i);
      fireEvent.click(steps[0]);
      fireEvent.click(steps[1]);

      // Select "No" for having casings
      const noCasingsRadio = screen.getByLabelText(/no.*don't.*have.*casings/i);
      fireEvent.click(noCasingsRadio);

      await waitFor(() => {
        expect(screen.getByLabelText(/projected delivery date/i)).toBeInTheDocument();
      });
    });

    it('hides projected delivery when casings available', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Navigate to casing section
      const steps = screen.getAllByText(/continue/i);
      fireEvent.click(steps[0]);
      fireEvent.click(steps[1]);

      // Select "Yes" for having casings
      const yesCasingsRadio = screen.getByLabelText(/yes.*have.*casings/i);
      fireEvent.click(yesCasingsRadio);

      await waitFor(() => {
        expect(screen.queryByLabelText(/projected delivery date/i)).not.toBeInTheDocument();
      });
    });

    it('shows tread inventory status when available', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Navigate to tread section
      const continueButton = screen.getByText(/continue to tire specifications/i);
      fireEvent.click(continueButton);

      // Select a tread pattern
      const treadSelect = screen.getByLabelText(/tread pattern/i);
      fireEvent.click(treadSelect);
      
      const treadOption = screen.getByText(/11L/);
      fireEvent.click(treadOption);

      await waitFor(() => {
        expect(screen.getByText(/tread in inventory/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits complete MTO order successfully', async () => {
      const mockCreateOrder = vi.fn(() => Promise.resolve({ 
        success: true, 
        orderId: 'mto-123' 
      }));

      vi.mocked(require('@/services/orderService/MTOOrderService').mtoOrderService.createMTOOrder)
        .mockImplementation(mockCreateOrder);

      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Fill out form (simplified)
      fireEvent.change(screen.getByLabelText(/quantity/i), { 
        target: { value: '10' } 
      });

      // Navigate through steps and fill required fields
      const continueButtons = screen.getAllByText(/continue/i);
      fireEvent.click(continueButtons[0]);

      // Submit form
      const submitButton = screen.getByText(/submit mto order/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateOrder).toHaveBeenCalled();
      });
    });

    it('shows success confirmation with order ID', async () => {
      vi.mocked(require('@/services/orderService/MTOOrderService').mtoOrderService.createMTOOrder)
        .mockResolvedValue({ success: true, orderId: 'MTO-12345' });

      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Complete and submit form (abbreviated)
      const submitButton = screen.getByText(/submit mto order/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/mto order created successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/MTO-12345/)).toBeInTheDocument();
      });
    });

    it('handles submission errors appropriately', async () => {
      const mockCreateOrder = vi.fn(() => Promise.reject(new Error('Network error')));

      vi.mocked(require('@/services/orderService/MTOOrderService').mtoOrderService.createMTOOrder)
        .mockImplementation(mockCreateOrder);

      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      const submitButton = screen.getByText(/submit mto order/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error creating mto order/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Navigation', () => {
    it('allows navigation between form steps', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Navigate forward
      const continueButton = screen.getByText(/continue to tire specifications/i);
      fireEvent.click(continueButton);

      expect(screen.getByText(/step 2.*tire specifications/i)).toBeInTheDocument();

      // Navigate backward
      const backButton = screen.getByText(/back to order details/i);
      fireEvent.click(backButton);

      expect(screen.getByText(/step 1.*order details/i)).toBeInTheDocument();
    });

    it('prevents progression with invalid data', async () => {
      render(
        <TestWrapper>
          <MTOOrderForm />
        </TestWrapper>
      );

      // Try to continue without filling required fields
      const continueButton = screen.getByText(/continue to tire specifications/i);
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/please complete all required fields/i)).toBeInTheDocument();
      });

      // Should still be on step 1
      expect(screen.getByText(/step 1.*order details/i)).toBeInTheDocument();
    });
  });
});