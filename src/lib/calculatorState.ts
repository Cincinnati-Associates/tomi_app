import { Person, MortgageDetails, ProFormaScenario } from '@/components/calc/types';

export interface CalculatorState {
  people: Person[];
  mortgageDetails: MortgageDetails;
  scenarios: ProFormaScenario[];
}

/**
 * Serialize calculator state to URL-safe base64 string
 */
export const serializeCalculatorState = (state: CalculatorState): string => {
  try {
    const json = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(json));
    return encoded;
  } catch (error) {
    console.error('Failed to serialize calculator state:', error);
    return '';
  }
};

/**
 * Deserialize calculator state from URL-safe base64 string
 */
export const deserializeCalculatorState = (encoded: string): CalculatorState | null => {
  try {
    const json = decodeURIComponent(atob(encoded));
    const state = JSON.parse(json);

    // Validate the structure
    if (!state.people || !state.mortgageDetails || !state.scenarios) {
      console.error('Invalid calculator state structure');
      return null;
    }

    return state as CalculatorState;
  } catch (error) {
    console.error('Failed to deserialize calculator state:', error);
    return null;
  }
};

/**
 * Generate shareable URL with calculator state
 */
export const generateShareUrl = (state: CalculatorState): string => {
  const encoded = serializeCalculatorState(state);
  if (!encoded) return window.location.origin + window.location.pathname;

  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?calc=${encoded}`;
};

/**
 * Extract calculator state from current URL
 */
export const getStateFromUrl = (): CalculatorState | null => {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('calc');

  if (!encoded) return null;

  return deserializeCalculatorState(encoded);
};

/**
 * Update URL with current calculator state (without page reload)
 */
export const updateUrlWithState = (state: CalculatorState): void => {
  if (typeof window === 'undefined') return;

  const encoded = serializeCalculatorState(state);
  if (!encoded) return;

  const url = new URL(window.location.href);
  url.searchParams.set('calc', encoded);

  window.history.replaceState({}, '', url.toString());
};
