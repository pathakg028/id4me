import React, { useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../components/Button';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import PasswordInput from '../components/PasswordInput';
import { validatePassword } from '../utils/passwordFieldValidation';
import {
  verifyMobile,
  resetVerification,
} from '../reducer/slices/MobileVerificationSlice';
import './MobileVerification.css';
import ProfileForm from '../components/ProfileForm';
import Input from '../components/Input';

interface MobileVerificationProps {
  className?: string;
}

type MobileFormValues = { mobile: string };

function MobileVerification({ className }: MobileVerificationProps) {
  const dispatch = useAppDispatch();
  const { verified, loading, error } = useAppSelector(
    (state) => state.mobileVerification
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [profileSubmitted, setProfileSubmitted] = useState(false);
  // Step 1: Mobile form
  const {
    register: registerMobile,
    handleSubmit: handleSubmitMobile,
    setValue: setMobileValue,
    formState: { errors: mobileErrors },
  } = useForm<MobileFormValues>({
    defaultValues: { mobile: localStorage.getItem('mobile') || '' },
  });

  // Step 3: Password form
  // Removed duplicate useForm for password fields to avoid redeclaration error.

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordNav, setShowPasswordNav] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Step 1: Mobile verification
  const onMobileSubmit = (data: MobileFormValues) => {
    dispatch(verifyMobile(data.mobile));
    localStorage.setItem('mobile', data.mobile);
  };

  // Step 3: Password submit
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
      setShowPasswordNav(true);
      setShowWelcome(true);
    }
  };

  function handleSubmitPassword(
    onPasswordSubmit: () => void
  ): React.MouseEventHandler<HTMLButtonElement> {
    return (e) => {
      e.preventDefault();
      onPasswordSubmit();
    };
  }

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  function handleSubmitPassword(
    onPasswordSubmit: () => void
  ): React.MouseEventHandler<HTMLButtonElement> {
    return (e) => {
      e.preventDefault();
      onPasswordSubmit();
    };
  }

  return (
    <div
      className={`w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto p-4 md:p-8 border rounded-md shadow-md bg-white min-h-screen flex flex-col justify-center ${className}`}
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        Onboarding App
      </h1>
      <div className="progress-container mb-6">
        <div
          className="progress-bar"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        ></div>
      </div>
      <div className="step-container">
        {currentStep === 1 && (
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
              <p className="text-red-500 mb-2">{mobileErrors.mobile.message}</p>
            )}
            {!verified ? (
              <>
                <Button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
              </>
            ) : (
              <>
                <p className="text-green-500 mt-4">Mobile number verified!</p>
                <div className="navigation-buttons mt-4 flex flex-col sm:flex-row gap-2 justify-between">
                  <Button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="w-full sm:w-auto"
                  >
                    Back
                  </Button>
                  <Button onClick={handleNext} className="w-full sm:w-auto">
                    Next
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
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
        {currentStep === 3 && (
          <div>
            {!showPasswordNav && (
              <>
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                />
                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={confirmPasswordError}
                />
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <p className="text-red-500 mt-2">
                      Passwords do not match. Please try again.
                    </p>
                  )}
                <Button
                  type="button"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 mt-4"
                  onClick={handleSubmitPassword(onPasswordSubmit)}
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword
                  }
                >
                  Set Password
                </Button>
              </>
            )}
            {showWelcome && (
              <div className="text-center my-4">
                <p className="text-gray-700 mb-4">
                  Your password has been set successfully.
                </p>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  Welcome Onboard!
                </h2>
              </div>
            )}
            <div className="navigation-buttons mt-4 flex flex-col sm:flex-row gap-2 justify-between">
              {showPasswordNav && !showWelcome && (
                <div className="navigation-buttons mt-4 flex flex-col sm:flex-row gap-2 justify-between">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleBack}
                    className="w-full sm:w-auto"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileVerification;
