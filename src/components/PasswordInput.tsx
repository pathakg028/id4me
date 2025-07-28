import React, { useState } from 'react';

interface PasswordInputProps {
  label: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  error,
  onChange,
  className = '',
  disabled = false,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const defaultPlaceholder = placeholder || `Enter your ${label.toLowerCase()}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-gray-700 font-bold mb-2">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full border rounded-md p-2 pr-12
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
          `}
          placeholder={defaultPlaceholder}
          aria-describedby={error ? `${label}-error` : undefined}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className={`
            absolute right-2 top-1/2 transform -translate-y-1/2
            px-2 py-1 text-sm font-medium rounded
            transition-colors duration-200
            ${
              disabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }
          `}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={disabled ? -1 : 0}
        >
          {showPassword ? '👁️‍🗨️' : '👁️'}
        </button>
      </div>
      {error && (
        <p
          className="text-red-500 text-sm mt-1"
          id={`${label}-error`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
