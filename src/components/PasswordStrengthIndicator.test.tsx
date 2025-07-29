import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

console.log(React, "for testing purpose");
describe('PasswordStrengthIndicator Component', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    it('renders nothing when password is empty', () => {
      const { container } = render(<PasswordStrengthIndicator password="" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when password is undefined', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders password strength indicator when password is provided', () => {
      render(<PasswordStrengthIndicator password="test" />);
      expect(screen.getByText('Password strength:')).toBeInTheDocument();
      expect(screen.getByText('Password requirements:')).toBeInTheDocument();
    });

    it('renders all 5 password requirements', () => {
      render(<PasswordStrengthIndicator password="test" />);
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
      expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
      expect(screen.getByText('One number')).toBeInTheDocument();
      expect(screen.getByText('One special character')).toBeInTheDocument();
    });
  });

  // Password strength classification tests
  describe('Password Strength Classification', () => {
    it('shows "Weak" strength for passwords meeting fewer than 3 requirements', () => {
      render(<PasswordStrengthIndicator password="ab" />);
      expect(screen.getByText('Weak')).toBeInTheDocument();
      expect(screen.getByText('Weak')).toHaveClass('text-red-500');
    });

    it('shows "Medium" strength for passwords meeting 3-4 requirements', () => {
      render(<PasswordStrengthIndicator password="Abc123" />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toHaveClass('text-yellow-500');
    });

    it('shows "Strong" strength for passwords meeting all 5 requirements', () => {
      render(<PasswordStrengthIndicator password="Abc123!@" />);
      expect(screen.getByText('Strong')).toBeInTheDocument();
      expect(screen.getByText('Strong')).toHaveClass('text-green-500');
    });
  });

  // Individual requirement validation tests
  describe('Individual Requirements Validation', () => {
    describe('Length Requirement (8+ characters)', () => {
      it('marks length requirement as invalid for short passwords', () => {
        render(<PasswordStrengthIndicator password="Abc1!" />);
        const lengthRequirement = screen.getByText(
          'At least 8 characters'
        ).parentElement;
        expect(
          lengthRequirement?.querySelector('.text-red-500')
        ).toHaveTextContent('✗');
        expect(screen.getByText('At least 8 characters')).toHaveClass(
          'text-gray-600'
        );
      });

      it('marks length requirement as valid for 8+ character passwords', () => {
        render(<PasswordStrengthIndicator password="Abc123!@" />);
        const lengthRequirement = screen.getByText(
          'At least 8 characters'
        ).parentElement;
        expect(
          lengthRequirement?.querySelector('.text-green-500')
        ).toHaveTextContent('✓');
        expect(screen.getByText('At least 8 characters')).toHaveClass(
          'text-green-700'
        );
      });
    });

    describe('Uppercase Letter Requirement', () => {
      it('marks uppercase requirement as invalid when no uppercase letters', () => {
        render(<PasswordStrengthIndicator password="abc123!" />);
        const uppercaseRequirement = screen.getByText(
          'One uppercase letter'
        ).parentElement;
        expect(
          uppercaseRequirement?.querySelector('.text-red-500')
        ).toHaveTextContent('✗');
        expect(screen.getByText('One uppercase letter')).toHaveClass(
          'text-gray-600'
        );
      });

      it('marks uppercase requirement as valid when uppercase letters present', () => {
        render(<PasswordStrengthIndicator password="Abc123!" />);
        const uppercaseRequirement = screen.getByText(
          'One uppercase letter'
        ).parentElement;
        expect(
          uppercaseRequirement?.querySelector('.text-green-500')
        ).toHaveTextContent('✓');
        expect(screen.getByText('One uppercase letter')).toHaveClass(
          'text-green-700'
        );
      });
    });

    describe('Lowercase Letter Requirement', () => {
      it('marks lowercase requirement as invalid when no lowercase letters', () => {
        render(<PasswordStrengthIndicator password="ABC123!" />);
        const lowercaseRequirement = screen.getByText(
          'One lowercase letter'
        ).parentElement;
        expect(
          lowercaseRequirement?.querySelector('.text-red-500')
        ).toHaveTextContent('✗');
        expect(screen.getByText('One lowercase letter')).toHaveClass(
          'text-gray-600'
        );
      });

      it('marks lowercase requirement as valid when lowercase letters present', () => {
        render(<PasswordStrengthIndicator password="Abc123!" />);
        const lowercaseRequirement = screen.getByText(
          'One lowercase letter'
        ).parentElement;
        expect(
          lowercaseRequirement?.querySelector('.text-green-500')
        ).toHaveTextContent('✓');
        expect(screen.getByText('One lowercase letter')).toHaveClass(
          'text-green-700'
        );
      });
    });

    describe('Number Requirement', () => {
      it('marks number requirement as invalid when no numbers', () => {
        render(<PasswordStrengthIndicator password="Abcdef!" />);
        const numberRequirement = screen.getByText('One number').parentElement;
        expect(
          numberRequirement?.querySelector('.text-red-500')
        ).toHaveTextContent('✗');
        expect(screen.getByText('One number')).toHaveClass('text-gray-600');
      });

      it('marks number requirement as valid when numbers present', () => {
        render(<PasswordStrengthIndicator password="Abc123!" />);
        const numberRequirement = screen.getByText('One number').parentElement;
        expect(
          numberRequirement?.querySelector('.text-green-500')
        ).toHaveTextContent('✓');
        expect(screen.getByText('One number')).toHaveClass('text-green-700');
      });
    });

    describe('Special Character Requirement', () => {
      it('marks special character requirement as invalid when no special characters', () => {
        render(<PasswordStrengthIndicator password="Abc123" />);
        const specialRequirement = screen.getByText(
          'One special character'
        ).parentElement;
        expect(
          specialRequirement?.querySelector('.text-red-500')
        ).toHaveTextContent('✗');
        expect(screen.getByText('One special character')).toHaveClass(
          'text-gray-600'
        );
      });

      it('marks special character requirement as valid when special characters present', () => {
        render(<PasswordStrengthIndicator password="Abc123!" />);
        const specialRequirement = screen.getByText(
          'One special character'
        ).parentElement;
        expect(
          specialRequirement?.querySelector('.text-green-500')
        ).toHaveTextContent('✓');
        expect(screen.getByText('One special character')).toHaveClass(
          'text-green-700'
        );
      });

      it('recognizes various special characters', () => {
        const specialChars = [
          '!',
          '@',
          '#',
          '$',
          '%',
          '^',
          '&',
          '*',
          '(',
          ')',
          '-',
          '_',
          '+',
          '=',
        ];

        specialChars.forEach((char) => {
          const { unmount } = render(
            <PasswordStrengthIndicator password={`Abc123${char}`} />
          );
          const specialRequirement = screen.getByText(
            'One special character'
          ).parentElement;
          expect(
            specialRequirement?.querySelector('.text-green-500')
          ).toHaveTextContent('✓');
          unmount(); // Clean up between renders
        });
      });
    });
  });

  // Edge cases and special scenarios
  describe('Edge Cases', () => {
    it('handles empty string password', () => {
      const { container } = render(<PasswordStrengthIndicator password="" />);
      expect(container.firstChild).toBeNull();
    });

    it('handles very long passwords correctly', () => {
      const longPassword = 'A'.repeat(100) + 'b1!';
      render(<PasswordStrengthIndicator password={longPassword} />);
      expect(screen.getByText('Strong')).toBeInTheDocument();

      const lengthRequirement = screen.getByText(
        'At least 8 characters'
      ).parentElement;
      expect(
        lengthRequirement?.querySelector('.text-green-500')
      ).toHaveTextContent('✓');
    });

    it('handles passwords with only special characters', () => {
      render(<PasswordStrengthIndicator password="!@#$%^&*" />);
      expect(screen.getByText('Weak')).toBeInTheDocument(); // Only meets 2 requirements

      const specialRequirement = screen.getByText(
        'One special character'
      ).parentElement;
      expect(
        specialRequirement?.querySelector('.text-green-500')
      ).toHaveTextContent('✓');
    });
  });

  // Comprehensive password scenarios
  describe('Password Scenarios', () => {
    const testCases = [
      {
        password: 'a',
        expectedStrength: 'Weak',
        expectedColor: 'text-red-500',
        description: 'single lowercase letter',
      },
      {
        password: 'abc',
        expectedStrength: 'Weak',
        expectedColor: 'text-red-500',
        description: 'only lowercase letters',
      },
      {
        password: 'Abc',
        expectedStrength: 'Weak',
        expectedColor: 'text-red-500',
        description: 'mixed case letters',
      },
      {
        password: 'Abc1',
        expectedStrength: 'Medium',
        expectedColor: 'text-yellow-500',
        description: 'letters and number',
      },
      {
        password: 'Abc123',
        expectedStrength: 'Medium',
        expectedColor: 'text-yellow-500',
        description: 'letters and numbers',
      },
      {
        password: 'Abc123!',
        expectedStrength: 'Medium',
        expectedColor: 'text-yellow-500',
        description: 'short but complex',
      },
      {
        password: 'Abc123!@',
        expectedStrength: 'Strong',
        expectedColor: 'text-green-500',
        description: 'meets all requirements',
      },
      {
        password: 'Password123!',
        expectedStrength: 'Strong',
        expectedColor: 'text-green-500',
        description: 'strong common pattern',
      },
    ];

    testCases.forEach(
      ({ password, expectedStrength, expectedColor, description }) => {
        it(`correctly evaluates ${description}: "${password}"`, () => {
          render(<PasswordStrengthIndicator password={password} />);
          expect(screen.getByText(expectedStrength)).toBeInTheDocument();
          expect(screen.getByText(expectedStrength)).toHaveClass(expectedColor);
        });
      }
    );
  });

  // Component state changes
  describe('Dynamic Updates', () => {
    it('updates strength indicator when password changes', () => {
      const { rerender } = render(<PasswordStrengthIndicator password="a" />);
      expect(screen.getByText('Weak')).toBeInTheDocument();

      rerender(<PasswordStrengthIndicator password="Abc123!@" />);
      expect(screen.getByText('Strong')).toBeInTheDocument();
      expect(screen.queryByText('Weak')).not.toBeInTheDocument();
    });

    it('updates requirement checkmarks when password changes', () => {
      const { rerender } = render(<PasswordStrengthIndicator password="abc" />);

      // Initially, uppercase should be invalid
      let uppercaseRequirement = screen.getByText(
        'One uppercase letter'
      ).parentElement;
      expect(
        uppercaseRequirement?.querySelector('.text-red-500')
      ).toHaveTextContent('✗');

      // After adding uppercase, it should be valid
      rerender(<PasswordStrengthIndicator password="Abc" />);
      uppercaseRequirement = screen.getByText(
        'One uppercase letter'
      ).parentElement;
      expect(
        uppercaseRequirement?.querySelector('.text-green-500')
      ).toHaveTextContent('✓');
    });
  });
});
