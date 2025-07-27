import React, { useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { validatePassword } from '../utils/passwordFieldValidation';
import './MobileVerification.css';
import ProfileForm from '../components/ProfileForm';
import Input from '../components/Input';
import OTPInput from '../components/OTPInput';

interface MobileVerificationProps {
  className?: string;
}

type MobileFormValues = { mobile: string };

function MobileVerification({ className }: MobileVerificationProps) {
  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [profileSubmitted, setProfileSubmitted] = useState(false);

  // Mobile & OTP states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Password states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Mobile form
  const {
    register: registerMobile,
    handleSubmit: handleSubmitMobile,
    setValue: setMobileValue,
    formState: { errors: mobileErrors },
  } = useForm<MobileFormValues>({
    defaultValues: { mobile: localStorage.getItem('mobile') || '' },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Fake API: Send OTP
  const sendOtp = (mobileNumber: string) => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    // Simulate API call
    setTimeout(() => {
      console.log(`🔐 OTP sent to ${mobileNumber}: 123456`);
      setOtpSent(true);
      setIsLoading(false);
      setCountdown(30);
    }, 2000);
  };

  // Fake API: Verify OTP
  const verifyOtp = (otpValue: string) => {
    if (otpValue.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    // Simulate API call
    setTimeout(() => {
      if (otpValue === '123456') {
        setMobileVerified(true);
        setOtpError('');
        console.log('✅ Mobile verified successfully!');
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  // Step 1: Mobile submission
  const onMobileSubmit = (data: MobileFormValues) => {
    setPhone(data.mobile);
    localStorage.setItem('mobile', data.mobile);
    sendOtp(data.mobile);
  };

  // Handle OTP changes
  const handleOtpChange = (value: string) => {
    setOtp(value);
    setOtpError('');
  };

  // Handle OTP completion (auto-verify)
  const handleOtpComplete = (value: string) => {
    setOtp(value);
    verifyOtp(value);
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtp('');
    setOtpError('');
    sendOtp(phone);
  };

  // Change mobile number
  const handleChangeMobile = () => {
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    setMobileVerified(false);
    setPhone('');
    setCountdown(0);
  };

  // Step 3: Password submission
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

  return (
    <div
      className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto p-4 md:p-8 border rounded-md shadow-md bg-white min-h-screen flex flex-col justify-center ${className}`}
    >
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        Onboarding App
      </h1>

      {/* Progress Bar */}
      <div className="progress-container mb-6">
        <div
          className="progress-bar"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        ></div>
      </div>

      <div className="step-container">
        {/* STEP 1: Mobile Verification */}
        {currentStep === 1 && (
          <div>
            {!otpSent ? (
              /* Mobile Number Input */
              <form onSubmit={handleSubmitMobile(onMobileSubmit)}>
                <label className="block mb-2 font-medium text-left">
                  Mobile Number
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
                        setMobileValue('mobile', e.target.value);
                        setPhone(e.target.value);
                      },
                    })}
                    ref={(el) => {
                      inputRef.current = el;
                      // @ts-ignore
                      registerMobile('mobile').ref(el);
                    }}
                    className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </label>
                {mobileErrors.mobile && (
                  <p className="text-red-500 mb-2">
                    {mobileErrors.mobile.message}
                  </p>
                )}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
                {otpError && <p className="text-red-500 mt-4">{otpError}</p>}
              </form>
            ) : (
              /* OTP Verification */
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Verify Your Mobile
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a 6-digit code to +91 {phone.slice(0, 2)}****
                  {phone.slice(-2)}
                </p>

                <OTPInput
                  length={6}
                  value={otp}
                  onChange={handleOtpChange}
                  onComplete={handleOtpComplete}
                  disabled={isLoading}
                  error={otpError}
                  autoFocus
                  className="mb-4"
                />

                {!mobileVerified ? (
                  <>
                    <Button
                      onClick={() => verifyOtp(otp)}
                      disabled={otp.length !== 6 || isLoading}
                      className="w-full mb-4"
                    >
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
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
                          disabled={isLoading}
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
                ) : (
                  <div>
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                      ✅ Mobile verified successfully!
                    </div>
                    <Button onClick={handleNext} className="w-full">
                      Continue to Profile
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Profile Form */}
        {currentStep === 2 && (
          <div>
            {!profileSubmitted ? (
              <ProfileForm
                className="mb-10"
                onSubmit={() => setProfileSubmitted(true)}
              />
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
                  ✅ Password set successfully!
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  Welcome Onboard! 🎉
                </h2>
                <Button
                  onClick={() => console.log('Onboarding completed!')}
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
