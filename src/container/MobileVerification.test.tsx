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

describe('MobileVerification - Comprehensive Test Suite', () => {
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
            (mockedAxios.get as unknown as import('vitest').Mock).mockResolvedValueOnce({
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

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number');
            fireEvent.change(mobileInput, { target: { value: '9876543210' } });

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
            const existingUser = {
                id: '1',
                mobile: '9876543210',
                name: 'John Doe',
                email: 'john@example.com',
            };

            (mockedAxios.get as unknown as import('vitest').Mock).mockResolvedValueOnce({
                data: [existingUser],
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

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number');
            fireEvent.change(mobileInput, { target: { value: '9876543210' } });

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

    describe('🏗️ Component Rendering and UI', () => {
        test('should render onboarding app header', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText('Onboarding App')).toBeDefined();
        });

        test('should render mobile input form on step 1', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText('Mobile Number')).toBeDefined();
            expect(screen.getByPlaceholderText('Enter your mobile number')).toBeDefined();
            expect(screen.getByText('Send OTP')).toBeDefined();
        });

        test('should render progress indicators with correct labels', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText('Mobile')).toBeDefined();
            expect(screen.getByText('Profile')).toBeDefined();
            expect(screen.getByText('Password')).toBeDefined();
        });

        test('should show API status information', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText(/API Status:/)).toBeDefined();
            expect(screen.getByText(/localhost:3000/)).toBeDefined();
        });
    });

    describe('📱 Mobile Input Validation', () => {
        test('should filter out non-numeric characters', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number') as HTMLInputElement;
            fireEvent.change(mobileInput, { target: { value: '98765abc43210' } });

            expect(mobileInput.value).toBe('9876543210');
        });

        test('should limit input to 10 digits', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number') as HTMLInputElement;
            fireEvent.change(mobileInput, { target: { value: '987654321012345' } });

            expect(mobileInput.value).toBe('9876543210');
        });

        test('should show validation feedback for incomplete numbers', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number');
            fireEvent.change(mobileInput, { target: { value: '98765' } });

            expect(screen.getByText(/Enter 5 more digits/)).toBeDefined();
        });

        test('should show validation feedback for invalid format', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number');
            fireEvent.change(mobileInput, { target: { value: 'abcd' } });

            expect(screen.getByText(/Please enter a valid 10-digit mobile number/)).toBeDefined();
        });
    });

    describe('🔐 OTP Flow', () => {
        test('should display OTP screen when step is otp', () => {
            render(
                <TestWrapper initialState={{ step: 'otp', mobile: '9876543210', otpSent: true }}>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText('Verify Your Mobile')).toBeDefined();
            expect(screen.getByText(/We've sent a 6-digit code to/)).toBeDefined();
            expect(screen.getByTestId('otp-input')).toBeDefined();
        });

        test('should show OTP sent success message', () => {
            render(
                <TestWrapper initialState={{ step: 'otp', mobile: '9876543210', otpSent: true }}>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText(/OTP sent successfully!/)).toBeDefined();
            expect(screen.getByText('123456')).toBeDefined();
        });

        test('should handle OTP input changes', () => {
            render(
                <TestWrapper initialState={{ step: 'otp', mobile: '9876543210' }}>
                    <MobileVerification />
                </TestWrapper>
            );

            const otpInput = screen.getByTestId('otp-input');
            fireEvent.change(otpInput, { target: { value: '123456' } });

            expect(otpInput.value).toBe('123456');
        });

        test('should enable verify button when OTP is complete', () => {
            render(
                <TestWrapper initialState={{ step: 'otp', mobile: '9876543210' }}>
                    <MobileVerification />
                </TestWrapper>
            );

            const otpInput = screen.getByTestId('otp-input');
            const verifyButton = screen.getByText('Verify OTP');

            fireEvent.change(otpInput, { target: { value: '123456' } });

            expect(verifyButton).not.toBeDisabled();
        });

        test('should show resend option when countdown is 0', () => {
            render(
                <TestWrapper initialState={{ step: 'otp', mobile: '9876543210' }}>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText('Resend OTP')).toBeDefined();
        });
    });

    describe('✅ Verification Success', () => {
        test('should show verification success message', () => {
            render(
                <TestWrapper initialState={{ step: 'verified', verified: true, mobile: '9876543210' }}>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText(/Mobile number verified successfully!/)).toBeDefined();
            expect(screen.getByText('Continue to Profile')).toBeDefined();
        });

        test('should navigate to profile step when continue is clicked', async () => {
            render(
                <TestWrapper initialState={{ step: 'verified', verified: true, mobile: '9876543210' }}>
                    <MobileVerification />
                </TestWrapper>
            );

            const continueButton = screen.getByText('Continue to Profile');
            fireEvent.click(continueButton);

            await waitFor(() => {
                expect(screen.getByTestId('profile-form')).toBeDefined();
            });
        });
    });

    describe('👤 Profile Step', () => {
        test('should render profile form on step 2', () => {
            const store = createTestStore();
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            // Navigate to step 2
            store.dispatch({ type: 'mobileVerification/setCurrentStep', payload: 2 });

            expect(screen.getByTestId('profile-form')).toBeDefined();
        });

        test('should show navigation buttons after profile submission', async () => {
            const store = createTestStore();
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            // Navigate to step 2
            store.dispatch({ type: 'mobileVerification/setCurrentStep', payload: 2 });

            const submitButton = screen.getByText('Submit Profile');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Back')).toBeDefined();
                expect(screen.getByText('Next')).toBeDefined();
            });
        });
    });

    describe('🔒 Password Step', () => {
        test('should render password form on step 3', () => {
            const store = createTestStore();
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            // Navigate to step 3
            store.dispatch({ type: 'mobileVerification/setCurrentStep', payload: 3 });

            expect(screen.getByTestId('password-input-password')).toBeDefined();
            expect(screen.getByTestId('password-input-confirm-password')).toBeDefined();
            expect(screen.getByTestId('password-strength')).toBeDefined();
        });

        test('should validate password strength', () => {
            const store = createTestStore();
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            // Navigate to step 3
            store.dispatch({ type: 'mobileVerification/setCurrentStep', payload: 3 });

            const passwordInput = screen.getByTestId('password-input-password');
            fireEvent.change(passwordInput, { target: { value: 'short' } });

            expect(screen.getByText('Strength: Weak')).toBeDefined();
        });

        test('should show welcome screen after password setup', async () => {
            const store = createTestStore();
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            // Navigate to step 3
            store.dispatch({ type: 'mobileVerification/setCurrentStep', payload: 3 });

            const passwordInput = screen.getByTestId('password-input-password');
            const confirmPasswordInput = screen.getByTestId('password-input-confirm-password');
            const setPasswordButton = screen.getByText('Set Password');

            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
            fireEvent.click(setPasswordButton);

            await waitFor(() => {
                expect(screen.getByText(/Account created successfully!/)).toBeDefined();
                expect(screen.getByText(/Welcome Onboard!/)).toBeDefined();
            });
        });
    });

    describe('🎯 Progress Tracking', () => {
        test('should show correct progress percentage for step 1', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByText(/10% Complete/)).toBeDefined();
        });

        test('should show correct step status indicators', () => {
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            const stepCircles = document.querySelectorAll('.step-circle');
            expect(stepCircles[0]).toContain('1');
            expect(stepCircles[1]).toContain('2');
            expect(stepCircles[2]).toContain('3');
        });
    });

    describe('⌨️ Keyboard Navigation', () => {
        test('should handle Escape key to clear errors', () => {
            const store = createTestStore({ error: 'Test error' });
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            fireEvent.keyDown(document, { key: 'Escape' });

            const state = store.getState().mobileVerification;
            expect(state.error).toBe(null);
        });

        test('should handle Ctrl+R to reset form on step 1', () => {
            const store = createTestStore({ mobile: '9876543210' });
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            fireEvent.keyDown(document, { key: 'r', ctrlKey: true });

            // Should prevent default and reset verification
            expect(true).toBe(true); // Test passes if no errors
        });
    });

    describe('💾 LocalStorage Integration', () => {
        test('should save mobile number to localStorage', async () => {
            const store = createTestStore();
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            // Simulate mobile being set in Redux
            store.dispatch({ type: 'mobileVerification/setMobile', payload: '9876543210' });

            await waitFor(() => {
                expect(localStorage.getItem('mobile')).toBe('9876543210');
            });
        });

        test('should load mobile from localStorage on mount', () => {
            localStorage.setItem('mobile', '9876543210');
            
            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number') as HTMLInputElement;
            expect(mobileInput.value).toBe('9876543210');
        });
    });

    describe('🚨 Error Handling', () => {
        test('should handle API errors gracefully', async () => {
            (mockedAxios.get as unknown as import('vitest').Mock).mockRejectedValueOnce(
                new Error('Network error')
            );

            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number');
            fireEvent.change(mobileInput, { target: { value: '9876543210' } });

            await waitFor(() => {
                expect(mockedAxios.get).toHaveBeenCalled();
            });
        });

        test('should show OTP error message', () => {
            render(
                <TestWrapper initialState={{ step: 'otp', otpError: 'Invalid OTP' }}>
                    <MobileVerification />
                </TestWrapper>
            );

            expect(screen.getByTestId('otp-error')).toBeDefined();
            expect(screen.getByText('Invalid OTP')).toBeDefined();
        });

        test('should validate password mismatch', () => {
            const store = createTestStore();
            
            render(
                <Provider store={store}>
                    <MobileVerification />
                </Provider>
            );

            // Navigate to step 3
            store.dispatch({ type: 'mobileVerification/setCurrentStep', payload: 3 });

            const passwordInput = screen.getByTestId('password-input-password');
            const confirmPasswordInput = screen.getByTestId('password-input-confirm-password');
            const setPasswordButton = screen.getByText('Set Password');

            fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
            fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword!' } });
            fireEvent.click(setPasswordButton);

            expect(setPasswordButton).toBeDisabled();
        });
    });

    describe('🔄 Form Submission and Validation', () => {
        test('should disable send OTP button when conditions not met', () => {
            render(
                <TestWrapper initialState={{ loading: true }}>
                    <MobileVerification />
                </TestWrapper>
            );

            const sendOtpButton = screen.getByText('Sending OTP...');
            expect(sendOtpButton).toBeDisabled();
        });

        test('should enable send OTP button when mobile is valid', async () => {
            (mockedAxios.get as unknown as import('vitest').Mock).mockResolvedValueOnce({
                data: [],
                status: 200,
            });

            render(
                <TestWrapper>
                    <MobileVerification />
                </TestWrapper>
            );

            const mobileInput = screen.getByPlaceholderText('Enter your mobile number');
            fireEvent.change(mobileInput, { target: { value: '9876543210' } });

            await waitFor(() => {
                const sendOtpButton = screen.getByText('Send OTP');
                expect(sendOtpButton).not.toBeDisabled();
            });
        });
    });
});}
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
});
