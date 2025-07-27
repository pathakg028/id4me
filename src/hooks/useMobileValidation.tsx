import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface UseMobileValidationOptions {
  debounceDelay?: number;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

interface UseMobileValidationReturn {
  isValid: boolean;
  error: string;
  isValidating: boolean;
  checkMobileExists: (mobile: string) => Promise<boolean>;
}

export const useMobileValidation = (
  mobile: string,
  options: UseMobileValidationOptions = {}
): UseMobileValidationReturn => {
  const { debounceDelay = 500, onValidationChange } = options;

  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Debounce the mobile number input
  const debouncedMobile = useDebounce(mobile, debounceDelay);

  // Validate mobile number format
  const validateMobileFormat = useCallback(
    (mobileNumber: string): { isValid: boolean; error?: string } => {
      if (!mobileNumber) {
        return { isValid: false, error: '' };
      }

      if (!/^\d+$/.test(mobileNumber)) {
        return {
          isValid: false,
          error: 'Mobile number can only contain digits',
        };
      }

      if (mobileNumber.length < 10) {
        return { isValid: false, error: 'Mobile number must be 10 digits' };
      }

      if (mobileNumber.length > 10) {
        return {
          isValid: false,
          error: 'Mobile number cannot exceed 10 digits',
        };
      }

      if (!/^[6-9]/.test(mobileNumber)) {
        return {
          isValid: false,
          error: 'Mobile number must start with 6, 7, 8, or 9',
        };
      }

      return { isValid: true };
    },
    []
  );

  // Check if mobile number already exists (fake API)
  const checkMobileExists = useCallback(
    async (mobileNumber: string): Promise<boolean> => {
      // Simulate API call to check if mobile exists
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock: these numbers are "already registered"
          const existingNumbers = ['9876543210', '8765432109', '7654321098'];
          resolve(existingNumbers.includes(mobileNumber));
        }, 800);
      });
    },
    []
  );

  // Validate mobile when debounced value changes
  useEffect(() => {
    const validateMobile = async () => {
      if (!debouncedMobile) {
        setIsValid(false);
        setError('');
        setIsValidating(false);
        return;
      }

      setIsValidating(true);

      // First check format
      const formatValidation = validateMobileFormat(debouncedMobile);

      if (!formatValidation.isValid) {
        setIsValid(false);
        setError(formatValidation.error || '');
        setIsValidating(false);
        onValidationChange?.(false, formatValidation.error);
        return;
      }

      try {
        // Check if mobile already exists
        const exists = await checkMobileExists(debouncedMobile);

        if (exists) {
          setIsValid(false);
          setError('This mobile number is already registered');
          onValidationChange?.(
            false,
            'This mobile number is already registered'
          );
        } else {
          setIsValid(true);
          setError('');
          onValidationChange?.(true);
        }
      } catch (err) {
        setIsValid(false);
        setError('Failed to validate mobile number');
        onValidationChange?.(false, 'Failed to validate mobile number');
      } finally {
        setIsValidating(false);
      }
    };

    validateMobile();
  }, [
    debouncedMobile,
    validateMobileFormat,
    checkMobileExists,
    onValidationChange,
  ]);

  return {
    isValid,
    error,
    isValidating,
    checkMobileExists,
  };
};
