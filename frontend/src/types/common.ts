/**
 * Common types and interfaces
 */

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormFieldError {
  message: string;
  type?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

