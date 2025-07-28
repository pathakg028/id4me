import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'One number',
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: 'One special character',
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

const getPasswordStrength = (password: string) => {
  if (!password) return { strength: '', score: 0, color: '' };

  const passedRequirements = requirements.filter((req) =>
    req.test(password)
  ).length;

  if (passedRequirements < 3) {
    return {
      strength: 'Weak',
      score: passedRequirements,
      color: 'text-red-500',
    } as const;
  } else if (passedRequirements < 5) {
    return {
      strength: 'Medium',
      score: passedRequirements,
      color: 'text-yellow-500',
    } as const;
  } else {
    return {
      strength: 'Strong',
      score: passedRequirements,
      color: 'text-green-500',
    } as const;
  }
};

const getStrengthColor = (score: number): string => {
  if (score < 3) return 'bg-red-500';
  if (score < 5) return 'bg-yellow-500';
  return 'bg-green-500';
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const { strength, score, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 mb-4">
      {/* Strength Label and Visual Indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700">
          Password strength:
        </span>
        <span className={`text-sm font-semibold ${color}`}>{strength}</span>
        <div
          className="flex gap-1"
          role="progressbar"
          aria-label={`Password strength: ${strength}`}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index < score ? getStrengthColor(score) : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-gray-50 p-3 rounded-md border">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Password requirements:
        </p>
        <ul className="space-y-1">
          {requirements.map((requirement, index) => {
            const isValid = requirement.test(password);
            return (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span
                  className={`text-xs ${
                    isValid ? 'text-green-500' : 'text-red-500'
                  }`}
                  aria-hidden="true"
                >
                  {isValid ? '✓' : '✗'}
                </span>
                <span className={isValid ? 'text-green-700' : 'text-gray-600'}>
                  {requirement.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
