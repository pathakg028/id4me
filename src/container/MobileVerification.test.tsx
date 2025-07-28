import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import MobileVerification from './MobileVerification';
import mobileVerificationReducer from '../reducer/slices/MobileVerificationSlice';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock useDebounce hook
vi.mock('../hooks/useDebounce', () => ({
  useDebounce: (value: string, delay: number) => value, // Return value immediately for testing
}));

// Mock PasswordInput component
vi.mock('../components/PasswordInput', () => ({
  default: ({ label, value, onChange, error }: any) => (
    <div>
      <label>{label}</label>
      <input
        type="password"
        value={value}
        onChange={onChange}
        data-testid={`password-input-${label.toLowerCase().replace(' ', '-')}`}
      />
      {error && <span data-testid="password-error">{error}</span>}
    </div>
  ),
}));

// Mock PasswordStrengthIndicator component
vi.mock('../components/PasswordStrengthIndicator', () => ({
  default: ({ password }: any) => (
    <div data-testid="password-strength">
      Strength: {password.length > 8 ? 'Strong' : 'Weak'}
    </div>
  ),
}));

// Mock ProfileForm component
vi.mock('../components/ProfileForm', () => ({
  default: ({ onSubmit }: any) => (
    <div data-testid="profile-form">
      <button onClick={onSubmit}>Submit Profile</button>
    </div>
  ),
}));

// Mock validatePassword utility
vi.mock('../utils/passwordFieldValidation', () => ({
  validatePassword: (password: string) => {
    if (password.length < 8) return 'Password too short';
    return '';
  },
}));

// Mock Button component
vi.mock('../components/Button', () => ({
  default: ({ children, onClick, disabled, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Input component
vi.mock('../components/Input', () => ({
  default: React.forwardRef<HTMLInputElement, any>(
    function MockInput(props, ref) {
      return <input ref={ref} {...props} />;
    }
  ),
}));

// Mock OTPInput component
vi.mock('../components/OTPInput', () => ({
  default: ({ onChange, onComplete, value, error }: any) => (
    <div>
      <input
        data-testid="otp-input"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.length === 6) {
            onComplete(e.target.value);
          }
        }}
      />
      {error && <span data-testid="otp-error">{error}</span>}
    </div>
  ),
}));

// Mock CSS imports
vi.mock('./MobileVerification.css', () => ({}));

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      mobileVerification: mobileVerificationReducer,
    },
    preloadedState: {
      mobileVerification: {
        mobile: '',
        verified: false,
        loading: false,
        error: null,
        otpSent: false,
        otpLoading: false,
        otpError: null,
        user: null,
        step: 'input' as const,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const TestWrapper = ({ children, initialState = {} }: any) => {
  const store = createTestStore(initialState);
  return <Provider store={store}>{children}</Provider>;
};

describe('MobileVerification - Users API Call Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('🔍 API Call Success Scenarios', () => {
    test('should call users API when mobile number is entered', async () => {
      // Mock API response for mobile not found
      (
        mockedAxios.get as unknown as import('vitest').Mock
      ).mockResolvedValueOnce({
        data: [], // Empty array means mobile doesn't exist
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      render(
        <TestWrapper>
          <MobileVerification />
        </TestWrapper>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );

      // Enter a 10-digit mobile number
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });

      // Wait for debounced API call
      await waitFor(
        () => {
          expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://localhost:3000/users?mobile=9876543210',
            {
              timeout: 5000,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        },
        { timeout: 2000 }
      );
    });

    test('should call users API with existing mobile number', async () => {
      // Mock API response for existing mobile
      const existingUser = {
        id: '1',
        mobile: '9876543210',
        name: 'John Doe',
        email: 'john@example.com',
      };

      (
        mockedAxios.get as unknown as import('vitest').Mock
      ).mockResolvedValueOnce({
        data: [existingUser], // User exists
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      render(
        <TestWrapper>
          <MobileVerification />
        </TestWrapper>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );

      // Enter existing mobile number
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });

      // Wait for API call
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:3000/users?mobile=9876543210',
          expect.objectContaining({
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });
  });

  describe('🔄 API Call Validation and Edge Cases', () => {
    test('should not call API for incomplete mobile numbers', async () => {
      render(
        <TestWrapper>
          <MobileVerification />
        </TestWrapper>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );

      // Enter incomplete mobile number
      fireEvent.change(mobileInput, { target: { value: '98765' } });

      // Wait a bit to ensure no API call is made
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    test('should not call API for invalid mobile numbers with letters', async () => {
      render(
        <TestWrapper>
          <MobileVerification />
        </TestWrapper>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );

      // Enter invalid mobile number (input should filter out letters)
      fireEvent.change(mobileInput, { target: { value: '98765abc10' } });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    test('should handle API call timing', async () => {
      // Mock a delayed API response
      (
        mockedAxios.get as unknown as import('vitest').Mock
      ).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: [],
                  status: 200,
                  statusText: 'OK',
                  headers: {},
                  config: {} as any,
                }),
              200
            )
          )
      );

      render(
        <TestWrapper>
          <MobileVerification />
        </TestWrapper>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });

      // Wait for API call to complete
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
    });
  });

  describe('📊 Redux State Integration', () => {
    test('should update Redux state when mobile exists', async () => {
      const existingUser = {
        id: '1',
        mobile: '9876543210',
        name: 'John Doe',
        email: 'john@example.com',
      };

      (
        mockedAxios.get as unknown as import('vitest').Mock
      ).mockResolvedValueOnce({
        data: [existingUser],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const store = createTestStore();

      render(
        <Provider store={store}>
          <MobileVerification />
        </Provider>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });

      await waitFor(() => {
        const state = store.getState().mobileVerification;
        expect(state.user).toEqual(existingUser);
        expect(state.loading).toBe(false);
      });
    });

    test('should update Redux state when mobile is available', async () => {
      (
        mockedAxios.get as unknown as import('vitest').Mock
      ).mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const store = createTestStore();

      render(
        <Provider store={store}>
          <MobileVerification />
        </Provider>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });

      await waitFor(() => {
        const state = store.getState().mobileVerification;
        expect(state.user).toBe(null);
        expect(state.loading).toBe(false);
      });
    });

    test('should clear previous errors when new mobile number is entered', async () => {
      const store = createTestStore({
        error: 'Previous error message',
      });

      (
        mockedAxios.get as unknown as import('vitest').Mock
      ).mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      render(
        <Provider store={store}>
          <MobileVerification />
        </Provider>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });

      await waitFor(() => {
        const state = store.getState().mobileVerification;
        expect(state.error).toBe(null);
      });
    });
  });

  describe('🐛 Console Logging and Debug Information', () => {
    test('should log API calls for debugging', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      (
        mockedAxios.get as unknown as import('vitest').Mock
      ).mockResolvedValueOnce({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      render(
        <TestWrapper>
          <MobileVerification />
        </TestWrapper>
      );

      const mobileInput = screen.getByPlaceholderText(
        'Enter your mobile number'
      );
      fireEvent.change(mobileInput, { target: { value: '9876543210' } });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '🔍 Checking mobile: 9876543210'
        );
        expect(consoleSpy).toHaveBeenCalledWith('📱 API Response:', []);
      });
    });
  });
});
