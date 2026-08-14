import { useState, useCallback, useMemo } from 'react';
import type {
  WorkflowStepId,
  WorkflowFormData,
  FinancialWorkflowDefinition,
  FinancialWorkflowState,
} from '../types/workflow.types';

const DEFAULT_DATA: WorkflowFormData = {
  categoryId: '',
  categoryName: '',
  paymentSourceId: '',
  paymentSourceName: '',
  currency: '',
  paymentMethod: '',
  amount: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  description: '',
  notes: '',
  attachments: [],
  extra: {},
};

export interface UseFinancialWizardReturn {
  // state
  currentStepId: WorkflowStepId;
  data: WorkflowFormData;
  createdTransactionId: string;
  isSubmitting: boolean;
  // derived
  currentStepIndex: number;
  totalSteps: number;
  progressPercent: number;
  isFirstStep: boolean;
  isLastDataStep: boolean;
  isConfirmation: boolean;
  indicatorSteps: FinancialWorkflowDefinition['steps'];
  // navigation
  next: () => void;
  prev: () => void;
  jumpTo: (id: WorkflowStepId) => void;
  // data
  patch: (partial: Partial<WorkflowFormData>) => void;
  patchExtra: (key: string, value: string | number | boolean) => void;
  // lifecycle
  setSubmitting: (v: boolean) => void;
  setCreatedId: (id: string) => void;
  reset: () => void;
}

export function useFinancialWizard(
  definition: FinancialWorkflowDefinition,
): UseFinancialWizardReturn {
  const steps = definition.steps;
  const indicatorSteps = useMemo(() => steps.filter((s) => s.showInIndicator), [steps]);

  const initialData: WorkflowFormData = {
    ...DEFAULT_DATA,
    extra: { ...definition.extraDefaults },
  };

  const [state, setState] = useState<FinancialWorkflowState>({
    currentStepId: steps[0].id,
    data: initialData,
    createdTransactionId: '',
    isSubmitting: false,
  });

  const currentStepIndex = useMemo(
    () => steps.findIndex((s) => s.id === state.currentStepId),
    [steps, state.currentStepId],
  );

  const indicatorIndex = useMemo(
    () => indicatorSteps.findIndex((s) => s.id === state.currentStepId),
    [indicatorSteps, state.currentStepId],
  );

  const progressPercent = indicatorSteps.length > 1
    ? Math.round((indicatorIndex / (indicatorSteps.length - 1)) * 100)
    : 0;

  const next = useCallback(() => {
    setState((s) => {
      const idx = steps.findIndex((step) => step.id === s.currentStepId);
      const next = steps[idx + 1];
      return next ? { ...s, currentStepId: next.id } : s;
    });
  }, [steps]);

  const prev = useCallback(() => {
    setState((s) => {
      const idx = steps.findIndex((step) => step.id === s.currentStepId);
      const prev = steps[idx - 1];
      return prev ? { ...s, currentStepId: prev.id } : s;
    });
  }, [steps]);

  const jumpTo = useCallback((id: WorkflowStepId) => {
    setState((s) => ({ ...s, currentStepId: id }));
  }, []);

  const patch = useCallback((partial: Partial<WorkflowFormData>) => {
    setState((s) => ({ ...s, data: { ...s.data, ...partial } }));
  }, []);

  const patchExtra = useCallback((key: string, value: string | number | boolean) => {
    setState((s) => ({
      ...s,
      data: { ...s.data, extra: { ...s.data.extra, [key]: value } },
    }));
  }, []);

  const setSubmitting = useCallback((v: boolean) => {
    setState((s) => ({ ...s, isSubmitting: v }));
  }, []);

  const setCreatedId = useCallback((id: string) => {
    setState((s) => ({ ...s, createdTransactionId: id }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentStepId: steps[0].id,
      data: { ...DEFAULT_DATA, extra: { ...definition.extraDefaults } },
      createdTransactionId: '',
      isSubmitting: false,
    });
  }, [steps, definition.extraDefaults]);

  const lastDataStep = useMemo(() => {
    const dataSteps = steps.filter((s) => s.id !== 'confirmation');
    return dataSteps[dataSteps.length - 1];
  }, [steps]);

  return {
    currentStepId: state.currentStepId,
    data: state.data,
    createdTransactionId: state.createdTransactionId,
    isSubmitting: state.isSubmitting,
    currentStepIndex,
    totalSteps: indicatorSteps.length,
    progressPercent,
    isFirstStep: currentStepIndex === 0,
    isLastDataStep: state.currentStepId === lastDataStep?.id,
    isConfirmation: state.currentStepId === 'confirmation',
    indicatorSteps,
    next,
    prev,
    jumpTo,
    patch,
    patchExtra,
    setSubmitting,
    setCreatedId,
    reset,
  };
}
