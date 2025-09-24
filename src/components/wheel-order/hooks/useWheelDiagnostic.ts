import { useState, useCallback } from 'react';

export interface DiagnosticStep {
  step: string;
  timestamp: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
}

export interface DiagnosticData {
  preInsertPayload?: any;
  insertResponse?: any;
  steps: DiagnosticStep[];
  serverTimestamp?: string;
  orderId?: string;
  isEnabled: boolean;
}

export function useWheelDiagnostic() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData>({
    steps: [],
    isEnabled: import.meta.env.VITE_WHEEL_DIAG === 'true'
  });

  const addStep = useCallback((step: string, status: DiagnosticStep['status'] = 'pending', data?: any, error?: string) => {
    if (!diagnosticData.isEnabled) return;

    const timestamp = Date.now();
    setDiagnosticData(prev => {
      const newSteps = [...prev.steps];
      const lastStep = newSteps[newSteps.length - 1];
      
      // Calculate duration for the previous step
      if (lastStep && !lastStep.duration) {
        lastStep.duration = timestamp - lastStep.timestamp;
      }

      newSteps.push({
        step,
        timestamp,
        status,
        data,
        error
      });

      return {
        ...prev,
        steps: newSteps
      };
    });
  }, [diagnosticData.isEnabled]);

  const updateLastStep = useCallback((status: DiagnosticStep['status'], data?: any, error?: string) => {
    if (!diagnosticData.isEnabled) return;

    setDiagnosticData(prev => {
      const newSteps = [...prev.steps];
      const lastStep = newSteps[newSteps.length - 1];
      
      if (lastStep) {
        lastStep.status = status;
        lastStep.duration = Date.now() - lastStep.timestamp;
        if (data) lastStep.data = data;
        if (error) lastStep.error = error;
      }

      return {
        ...prev,
        steps: newSteps
      };
    });
  }, [diagnosticData.isEnabled]);

  const setPreInsertPayload = useCallback((payload: any) => {
    if (!diagnosticData.isEnabled) return;

    setDiagnosticData(prev => ({
      ...prev,
      preInsertPayload: payload
    }));
  }, [diagnosticData.isEnabled]);

  const setInsertResponse = useCallback((response: any) => {
    if (!diagnosticData.isEnabled) return;

    setDiagnosticData(prev => ({
      ...prev,
      insertResponse: response,
      orderId: response?.id,
      serverTimestamp: response?.timestamp
    }));
  }, [diagnosticData.isEnabled]);

  const reset = useCallback(() => {
    setDiagnosticData({
      steps: [],
      isEnabled: import.meta.env.VITE_WHEEL_DIAG === 'true'
    });
  }, []);

  return {
    diagnosticData,
    addStep,
    updateLastStep,
    setPreInsertPayload,
    setInsertResponse,
    reset,
    isEnabled: diagnosticData.isEnabled
  };
}