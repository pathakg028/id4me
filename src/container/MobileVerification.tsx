import React, { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { validatePassword } from '../utils/passwordFieldValidation';
import './MobileVerification.css';
import Input from '../components/Input';
import OTPInput from '../components/OTPInput';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  checkMobileExists,
  sendOTP,
  verifyOTP,
  setMobile,
  resetVerification,
  clearError,
  resetOTP,
} from '../reducer/slices/MobileVerificationSlice';
import { useDebounce } from '../hooks/useDebounce';

// Lazy load ProfileForm component
const ProfileForm = lazy(() => import('../components/ProfileForm'));

// Loading fallback component for ProfileForm
const ProfileFormLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    <span className="ml-3 text-gray-600">Loading profile form...</span>
  </div>
);

interface MobileVerificationProps {
  className?: string;
}

type MobileFormValues = { mobile: string };

function MobileVerification({ className }: MobileVerificationProps) {
  // Redux state
  const dispatch = useAppDispatch();
  const {
    mobile,
    verified,
    loading,
    error,
    otpSent,
    otpLoading,
    otpError,
    step,
  } = useAppSelector((state) => state.mobileVerification);

  // Local component state
  const [currentStep, setCurrentStep] = useState(1);
  const [profileSubmitted, setProfileSubmitted] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Password states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile form
  const {
    register: registerMobile,
    handleSubmit: handleSubmitMobile,
    setValue: setMobileValue,
    watch: watchMobile,
    formState: { errors: mobileErrors },
  } = useForm<MobileFormValues>({
    defaultValues: { mobile: localStorage.getItem('mobile') || '' },
  });

  // Watch mobile input and debounce for API calls
  const currentMobile = watchMobile('mobile') || '';
  const debouncedMobile = useDebounce(currentMobile, 800);

  // ...existing useEffect hooks...

  // Auto-focus input on mount with cleanup
  useEffect(() => {
    if (inputRef.current) {
      timeoutRef.current = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }

    // 🧹 Cleanup timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Auto-check mobile existence when user stops typing
  useEffect(() => {
    if (
      debouncedMobile &&
      debouncedMobile.length === 10 &&
      /^\d{10}$/.test(debouncedMobile)
    ) {
      dispatch(checkMobileExists(debouncedMobile));
    }
    // No cleanup needed - dispatch doesn't create subscriptions
  }, [debouncedMobile, dispatch]);

  // Countdown timer for resend OTP with cleanup
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }

    // 🧹 Cleanup timer
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [countdown]);

  // Auto-save valid mobile to localStorage
  useEffect(() => {
    if (mobile && mobile.length === 10) {
      localStorage.setItem('mobile', mobile);
    }
    // No cleanup needed - localStorage is synchronous
  }, [mobile]);

  // Enhanced keyboard shortcuts with cleanup
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + R to reset form
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        if (currentStep === 1) {
          dispatch(resetVerification());
          setOtp('');
          setCountdown(0);
        }
      }

      // Escape to clear errors
      if (e.key === 'Escape') {
        dispatch(clearError());
        setPasswordError('');
        setConfirmPasswordError('');
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    // 🧹 Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [currentStep, dispatch]);

  // Auto-verify OTP when complete with debounce
  useEffect(() => {
    let verifyTimeout: NodeJS.Timeout;

    if (otp.length === 6 && mobile && step === 'otp') {
      verifyTimeout = setTimeout(() => {
        dispatch(verifyOTP({ mobile, otp }));
      }, 500); // Debounce to prevent rapid API calls
    }

    // 🧹 Cleanup timeout
    return () => {
      if (verifyTimeout) {
        clearTimeout(verifyTimeout);
      }
    };
  }, [otp, mobile, step, dispatch]);

  // ...rest of the existing functions remain the same...

  // Calculate progress percentage based on current step and verification status
  const getProgressPercentage = () => {
    if (currentStep === 1) {
      if (step === 'verified' && verified) {
        return 33.33;
      } else if (step === 'otp') {
        return 20;
      } else {
        return 10;
      }
    } else if (currentStep === 2) {
      if (profileSubmitted) {
        return 66.66;
      } else {
        return 50;
      }
    } else if (currentStep === 3) {
      if (showWelcome) {
        return 100;
      } else {
        return 80;
      }
    }
    return 0;
  };

  // Get step status for each step
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) {
      if (stepNumber === 1 && verified) return 'completed';
      if (stepNumber === 2 && profileSubmitted) return 'completed';
      if (stepNumber === 3 && showWelcome) return 'completed';
      return 'active';
    }
    return 'inactive';
  };

  // Handle mobile form submission
  const onMobileSubmit = async (data: MobileFormValues) => {
    if (!data.mobile || data.mobile.length !== 10) {
      return;
    }

    dispatch(setMobile(data.mobile));

    // Check if mobile exists first
    const checkResult = await dispatch(checkMobileExists(data.mobile));

    if (checkMobileExists.fulfilled.match(checkResult)) {
      if (!checkResult.payload.exists) {
        // Mobile doesn't exist, proceed with OTP
        const otpResult = await dispatch(sendOTP(data.mobile));

        if (sendOTP.fulfilled.match(otpResult)) {
          setCountdown(30);
        }
      }
    }
  };

  // Handle OTP changes
  const handleOtpChange = (value: string) => {
    setOtp(value);
    dispatch(clearError());
  };

  // Handle OTP completion (auto-verify)
  const handleOtpComplete = async (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      await dispatch(verifyOTP({ mobile, otp: value }));
    }
  };

  // Manual OTP verification
  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      await dispatch(verifyOTP({ mobile, otp }));
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setOtp('');
    dispatch(clearError());
    const result = await dispatch(sendOTP(mobile));

    if (sendOTP.fulfilled.match(result)) {
      setCountdown(30);
    }
  };

  // Change mobile number
  const handleChangeMobile = () => {
    dispatch(resetOTP());
    setOtp('');
    setCountdown(0);
  };

  // Password submission logic
  const onPasswordSubmit = () => {
    const pwError = validatePassword(password);
    const cpwError = !confirmPassword
      ? 'Please confirm your password'
      : password !== confirmPassword
        ? 'Passwords do not match'
        : '';

    setPasswordError(pwError);
    setConfirmPasswordError(cpwError);

    if (!pwError && !cpwError) {
      setShowWelcome(true);
    }
  };

  // Navigation
  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    if (currentStep === 1) {
      handleChangeMobile();
    }
  };

  // Get mobile validation status
  const getMobileValidationStatus = () => {
    if (!currentMobile) return null;
    if (currentMobile.length < 10) return 'incomplete';
    if (!/^\d{10}$/.test(currentMobile)) return 'invalid';
    if (loading) return 'checking';
    if (error) return 'error';
    return 'valid';
  };

  const validationStatus = getMobileValidationStatus();

  return (
    <div
      className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto p-4 md:p-8 border rounded-md shadow-md bg-white min-h-screen flex flex-col justify-center ${className}`}
    >
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        Onboarding App
      </h1>

      {/* Enhanced Progress Bar with Step Indicators */}
      <div className="mb-6">
        {/* Step Indicators */}
        <div className="step-indicators mb-4">
          <div
            className={`step-indicator ${getStepStatus(1) === 'completed' ? 'completed' : ''}`}
          >
            <div
              className={`step-circle ${getStepStatus(1) === 'active' ? 'active' : ''} ${getStepStatus(1) === 'completed' ? 'completed' : ''}`}
            >
              {getStepStatus(1) === 'completed' ? '✓' : '1'}
            </div>
            <div
              className={`step-label ${getStepStatus(1) === 'active' ? 'active' : ''} ${getStepStatus(1) === 'completed' ? 'completed' : ''}`}
            >
              Mobile
            </div>
          </div>

          <div
            className={`step-indicator ${getStepStatus(2) === 'completed' ? 'completed' : ''}`}
          >
            <div
              className={`step-circle ${getStepStatus(2) === 'active' ? 'active' : ''} ${getStepStatus(2) === 'completed' ? 'completed' : ''}`}
            >
              {getStepStatus(2) === 'completed' ? '✓' : '2'}
            </div>
            <div
              className={`step-label ${getStepStatus(2) === 'active' ? 'active' : ''} ${getStepStatus(2) === 'completed' ? 'completed' : ''}`}
            >
              Profile
            </div>
          </div>

          <div
            className={`step-indicator ${getStepStatus(3) === 'completed' ? 'completed' : ''}`}
          >
            <div
              className={`step-circle ${getStepStatus(3) === 'active' ? 'active' : ''} ${getStepStatus(3) === 'completed' ? 'completed' : ''}`}
            >
              {getStepStatus(3) === 'completed' ? '✓' : '3'}
            </div>
            <div
              className={`step-label ${getStepStatus(3) === 'active' ? 'active' : ''} ${getStepStatus(3) === 'completed' ? 'completed' : ''}`}
            >
              Password
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>

        {/* Progress Text */}
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600">
            Step {currentStep} of 3 • {Math.round(getProgressPercentage())}%
            Complete
          </span>
        </div>
      </div>

      <div className="step-container">
        {/* STEP 1: Mobile Verification with API Integration */}
        {currentStep === 1 && (
          <div>
            {step === 'input' && (
              /* Mobile Number Input with Real-time API Validation */
              <form onSubmit={handleSubmitMobile(onMobileSubmit)}>
                <label className="block mb-2 font-medium text-left">
                  Mobile Number
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="Enter your mobile number"
                      {...registerMobile('mobile', {
                        required: 'Mobile number is required',
                        pattern: {
                          value: /^\d{10}$/,
                          message: 'Enter a valid 10-digit mobile number',
                        },
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value
                            .replace(/[^0-9]/g, '')
                            .slice(0, 10);
                          setMobileValue('mobile', value);
                          dispatch(setMobile(value));
                        },
                      })}
                      ref={(el) => {
                        inputRef.current = el;
                        // @ts-ignore
                        registerMobile('mobile').ref(el);
                      }}
                      className={`
                        w-full border border-gray-300 rounded-md p-2 mb-2 
                        focus:outline-none focus:ring-2 focus:ring-green-400
                        ${validationStatus === 'error' ? 'border-red-500' : ''}
                        ${validationStatus === 'valid' ? 'border-green-500' : ''}
                      `}
                    />

                    {/* API Loading indicator */}
                    {validationStatus === 'checking' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                  {/* Real-time validation feedback */}
                  {currentMobile.length > 0 && (
                    <div className="mt-1">
                      {validationStatus === 'checking' && (
                        <p className="text-blue-500 text-sm">
                          🔍 Checking mobile number...
                        </p>
                      )}
                      {validationStatus === 'error' && error && (
                        <p className="text-red-500 text-sm">❌ {error}</p>
                      )}
                      {validationStatus === 'valid' &&
                        currentMobile.length === 10 &&
                        !error && (
                          <p className="text-green-500 text-sm">
                            ✅ Mobile number is available
                          </p>
                        )}
                      {validationStatus === 'invalid' && (
                        <p className="text-red-500 text-sm">
                          ❌ Please enter a valid 10-digit mobile number
                        </p>
                      )}
                      {validationStatus === 'incomplete' &&
                        currentMobile.length > 0 && (
                          <p className="text-gray-500 text-sm">
                            📱 Enter {10 - currentMobile.length} more digits
                          </p>
                        )}
                    </div>
                  )}
                </label>

                {mobileErrors.mobile && (
                  <p className="text-red-500 mb-2">
                    {mobileErrors.mobile.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={
                    otpLoading ||
                    loading ||
                    validationStatus !== 'valid' ||
                    currentMobile.length !== 10 ||
                    !!error
                  }
                  className="w-full"
                >
                  {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>

                {/* API Connection Status */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    🔗 <strong>API Status:</strong> Checking mobile numbers via
                    localhost:3000
                  </p>
                  <p className="text-blue-700 text-xs mt-1">
                    Make sure your JSON server is running on port 3000
                  </p>
                </div>
              </form>
            )}

            {step === 'otp' && (
              /* OTP Verification */
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Verify Your Mobile
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a 6-digit code to +91 {mobile.slice(0, 2)}****
                  {mobile.slice(-2)}
                </p>

                {otpSent && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    ✅ OTP sent successfully! Use: <strong>123456</strong>
                  </div>
                )}

                <OTPInput
                  length={6}
                  value={otp}
                  onChange={handleOtpChange}
                  onComplete={handleOtpComplete}
                  disabled={otpLoading}
                  error={otpError || ''}
                  autoFocus
                  className="mb-4"
                />

                {!verified ? (
                  <>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6 || otpLoading}
                      className="w-full mb-4"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify OTP'}
                    </Button>

                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Didn't receive the code?
                      </p>
                      {countdown > 0 ? (
                        <span className="text-gray-500 text-sm">
                          Resend in {countdown}s
                        </span>
                      ) : (
                        <button
                          onClick={handleResendOtp}
                          disabled={otpLoading}
                          className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      onClick={handleChangeMobile}
                      className="w-full"
                    >
                      Change Mobile Number
                    </Button>
                  </>
                ) : null}
              </div>
            )}

            {step === 'verified' && verified && (
              <div className="text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  ✅ Mobile number verified successfully!
                </div>
                <Button onClick={handleNext} className="w-full">
                  Continue to Profile
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Profile Form with Lazy Loading */}
        {currentStep === 2 && (
          <div>
            {!profileSubmitted ? (
              <Suspense fallback={<ProfileFormLoader />}>
                <ProfileForm
                  className="mb-10"
                  onSubmit={() => setProfileSubmitted(true)}
                />
              </Suspense>
            ) : (
              <div className="navigation-buttons mt-4 flex flex-col sm:flex-row gap-2 justify-between">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="w-full sm:w-auto"
                >
                  Back
                </Button>
                <Button onClick={handleNext} className="w-full sm:w-auto">
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Password Setup */}
        {currentStep === 3 && (
          <div>
            {!showWelcome ? (
              <>
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                />
                <PasswordStrengthIndicator password={password} />
                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={confirmPasswordError}
                />
                <Button
                  onClick={onPasswordSubmit}
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword
                  }
                  className="w-full mt-4"
                >
                  Set Password
                </Button>
              </>
            ) : (
              <div className="text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  ✅ Account created successfully!
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  Welcome Onboard! 🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  Mobile: {mobile} | Verified: ✅
                </p>
                <Button
                  onClick={() => alert('Onboarding completed!')}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileVerification;
