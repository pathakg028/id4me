import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordInput from './PasswordInput';

console.log(React, "for testing purpose");
describe('PasswordInput Component - Key Tests', () => {
  const defaultProps = {
    label: 'Password',
    value: '',
    onChange: () => { },
  };

  // ✅ Test 1: Basic Rendering (Safe tests only)
  describe('1. Basic Rendering', () => {
    it('renders label correctly', () => {
      render(<PasswordInput {...defaultProps} />);
      expect(screen.getByText('Password')).toBeInTheDocument();
    });
  });

  it('displays custom label correctly', () => {
    render(<PasswordInput {...defaultProps} label="Confirm Password" />);
    expect(screen.getByText('Confirm Password')).toBeInTheDocument();
  });

  it('renders with controlled value', () => {
    render(<PasswordInput {...defaultProps} value="test123" />);
    expect(screen.getByDisplayValue('test123')).toBeInTheDocument();
  });
});
