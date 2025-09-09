/**
 * Form State Agent - Monitors form lifecycle and state changes
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { DIAG_ENABLED, logEvent } from './config';

interface FormStateAgentProps {
  form?: UseFormReturn<any>;
  formId: string;
}

export function FormStateAgent({ form, formId }: FormStateAgentProps) {
  const location = useLocation();
  const throttleRef = useRef<NodeJS.Timeout>();

  // Log component mount/unmount
  useEffect(() => {
    if (!DIAG_ENABLED) return;

    logEvent({
      kind: 'FORM_MOUNT',
      formId,
      route: location.pathname,
      ts: Date.now()
    });

    return () => {
      logEvent({
        kind: 'FORM_UNMOUNT',
        formId,
        route: location.pathname,
        ts: Date.now()
      });
    };
  }, [formId, location.pathname]);

  // Monitor form state changes (throttled)
  useEffect(() => {
    if (!DIAG_ENABLED || !form) return;

    const subscription = form.watch((values, { name }) => {
      // Clear existing throttle
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }

      // Throttle state logging to 500ms
      throttleRef.current = setTimeout(() => {
        const formState = form.formState;
        const allFields = Object.keys(values || {});
        const dirtyFields = Object.keys(formState.dirtyFields || {});
        const touchedFields = Object.keys(formState.touchedFields || {});

        logEvent({
          kind: 'FORM_STATE',
          formId,
          fieldCount: allFields.length,
          dirtyFieldsCount: dirtyFields.length,
          touchedFieldsCount: touchedFields.length,
          ts: Date.now()
        });
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [form, formId]);

  // Return null - this is a monitoring-only component
  return null;
}