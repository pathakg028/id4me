import React, { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  error?: string;
  label?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  placeholder = '',
  className = '',
  inputClassName = '',
  error,
  label,
}) => {
  const [otp, setOtp] = useState<string[]>(
    value.split('').concat(Array(length - value.length).fill(''))
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const newOtp = value
      .split('')
      .concat(Array(length - value.length).fill(''));
    setOtp(newOtp.slice(0, length));
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    if (disabled) return;

    // Only allow numbers
    const newVal = val.replace(/[^0-9]/g, '');

    if (newVal.length > 1) {
      // Handle paste
      const pastedData = newVal.slice(0, length);
      const newOtp = pastedData
        .split('')
        .concat(Array(length - pastedData.length).fill(''));
      setOtp(newOtp);
      onChange(newOtp.join(''));

      // Focus on the last filled input or next empty input
      const nextIndex = Math.min(pastedData.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex]?.focus();
      }

      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = newVal;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input
    if (newVal && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const otpString = newOtp.join('');
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    if (disabled) return;
    // Select all text when focused
    inputRefs.current[index]?.select();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

    if (pastedData) {
      const newOtp = pastedData
        .slice(0, length)
        .split('')
        .concat(Array(Math.max(0, length - pastedData.length)).fill(''));
      setOtp(newOtp);
      onChange(newOtp.join(''));

      // Focus on the last filled input
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-gray-700 font-bold mb-2">{label}</label>
      )}

      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder={placeholder}
            className={`
              w-12 h-12 text-center text-lg font-semibold
              border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-colors duration-200
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              }
              ${
                disabled
                  ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                  : 'bg-white hover:border-gray-400'
              }
              ${otp[index] ? 'border-green-500' : ''}
              ${inputClassName}
            `}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default OTPInput;
