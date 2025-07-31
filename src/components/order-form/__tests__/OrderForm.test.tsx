/**
 * Component Tests: OrderForm.tsx
 * Tests order form UI, validation, and real-time email preview functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderForm } from '../OrderForm';
import { PlantProvider } from '@/contexts/PlantContext';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    update: vi.fn(() => Promise.resolve({ data: [], error: null }))
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({ subscribe: vi.fn() })),
    subscribe: vi.fn()
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@conlantire.com'
    }
  })
}));

// Mock the logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the order form service
vi.mock('@/services/orderService/OrderFormService', () => ({
  orderFormService: {
    validateOrderData: vi.fn(() => ({ isValid: true, errors: [] })),
    submitOrder: vi.fn(() => Promise.resolve({ success: true, orderId: 'test-123' })),
    getEmailRecipients: vi.fn(() => Promise.resolve([
      { email: 'manager@conlantire.com', role: 'store_manager', name: 'Test Manager' }
    ]))
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PlantProvider>
        {children}
      </PlantProvider>
    </QueryClientProvider>
  );
};

describe('OrderForm Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all required form fields', async () => {
      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      // Check for key form elements
      expect(screen.getByLabelText(/product number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    });

    it('displays plant selector correctly', async () => {
      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      // Check plant selector is present
      expect(screen.getByText(/destination plant/i)).toBeInTheDocument();
    });

    it('shows email recipient preview section', async () => {
      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      // Check for email preview elements
      await waitFor(() => {
        expect(screen.getByText(/this order will be sent to/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('validates required fields on submission', async () => {
      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/product number is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format in contact section', async () => {
      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/your email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('validates quantity as positive number', async () => {
      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      const quantityInput = screen.getByLabelText(/quantity/i);
      fireEvent.change(quantityInput, { target: { value: '-1' } });
      fireEvent.blur(quantityInput);

      await waitFor(() => {
        expect(screen.getByText(/quantity must be positive/i)).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Email Preview', () => {
    it('updates email recipients when plant selection changes', async () => {
      const mockGetRecipients = vi.fn(() => Promise.resolve([
        { email: 'plant1@conlantire.com', role: 'warehouse_manager', name: 'Plant Manager' }
      ]));

      vi.mocked(require('@/services/orderService/OrderFormService').orderFormService.getEmailRecipients)
        .mockImplementation(mockGetRecipients);

      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      // Change plant selection
      const plantSelect = screen.getByRole('combobox');
      fireEvent.click(plantSelect);
      
      const plantOption = screen.getByText(/grand prairie 097/i);
      fireEvent.click(plantOption);

      await waitFor(() => {
        expect(mockGetRecipients).toHaveBeenCalled();
      });
    });

    it('shows warning when no recipients found', async () => {
      const mockGetRecipients = vi.fn(() => Promise.resolve([]));

      vi.mocked(require('@/services/orderService/OrderFormService').orderFormService.getEmailRecipients)
        .mockImplementation(mockGetRecipients);

      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/no email recipients found/i)).toBeInTheDocument();
      });
    });

    it('displays recipient roles correctly', async () => {
      const mockGetRecipients = vi.fn(() => Promise.resolve([
        { email: 'manager@conlantire.com', role: 'store_manager', name: 'Store Manager' },
        { email: 'warehouse@conlantire.com', role: 'warehouse_coordinator', name: 'Warehouse Coordinator' }
      ]));

      vi.mocked(require('@/services/orderService/OrderFormService').orderFormService.getEmailRecipients)
        .mockImplementation(mockGetRecipients);

      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/store manager/i)).toBeInTheDocument();
        expect(screen.getByText(/warehouse coordinator/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits valid form data successfully', async () => {
      const mockSubmitOrder = vi.fn(() => Promise.resolve({ success: true, orderId: 'test-123' }));
      
      vi.mocked(require('@/services/orderService/OrderFormService').orderFormService.submitOrder)
        .mockImplementation(mockSubmitOrder);

      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/product number/i), { 
        target: { value: 'TEST-123' } 
      });
      fireEvent.change(screen.getByLabelText(/description/i), { 
        target: { value: 'Test Product' } 
      });
      fireEvent.change(screen.getByLabelText(/quantity/i), { 
        target: { value: '5' } 
      });
      fireEvent.change(screen.getByLabelText(/your name/i), { 
        target: { value: 'Test User' } 
      });
      fireEvent.change(screen.getByLabelText(/your email/i), { 
        target: { value: 'test@conlantire.com' } 
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmitOrder).toHaveBeenCalled();
      });
    });

    it('shows success message after successful submission', async () => {
      const mockSubmitOrder = vi.fn(() => Promise.resolve({ success: true, orderId: 'test-123' }));
      
      vi.mocked(require('@/services/orderService/OrderFormService').orderFormService.submitOrder)
        .mockImplementation(mockSubmitOrder);

      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      // Fill and submit form (abbreviated)
      fireEvent.change(screen.getByLabelText(/product number/i), { 
        target: { value: 'TEST-123' } 
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/order submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('handles submission errors gracefully', async () => {
      const mockSubmitOrder = vi.fn(() => Promise.reject(new Error('Submission failed')));
      
      vi.mocked(require('@/services/orderService/OrderFormService').orderFormService.submitOrder)
        .mockImplementation(mockSubmitOrder);

      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      // Fill and submit form (abbreviated)
      fireEvent.change(screen.getByLabelText(/product number/i), { 
        target: { value: 'TEST-123' } 
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error submitting order/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-dock Functionality', () => {
    it('shows cross-dock fields when enabled', async () => {
      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      const crossDockCheckbox = screen.getByLabelText(/cross.dock/i);
      fireEvent.click(crossDockCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText(/destination store/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/estimated delivery/i)).toBeInTheDocument();
      });
    });

    it('validates cross-dock fields when enabled', async () => {
      render(
        <TestWrapper>
          <OrderForm />
        </TestWrapper>
      );

      const crossDockCheckbox = screen.getByLabelText(/cross.dock/i);
      fireEvent.click(crossDockCheckbox);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/destination store is required/i)).toBeInTheDocument();
      });
    });
  });
});