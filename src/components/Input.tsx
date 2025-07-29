import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 font-bold mb-2">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full border border-gray-300 rounded-md p-2 ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";

export default Input;
