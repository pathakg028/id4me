import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

console.log(React, "for testing purpose");
describe('Button Component', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    it('renders button with children text', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('renders button with JSX children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  // Variant styling tests
  describe('Variants', () => {
    it('applies primary variant styles by default', () => {
      render(<Button>Primary Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-green-500',
        'text-white',
        'hover:bg-green-600'
      );
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-gray-500',
        'text-white',
        'hover:bg-gray-600'
      );
    });

    it('applies danger variant styles', () => {
      render(<Button variant="danger">Danger Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-red-500',
        'text-white',
        'hover:bg-red-600'
      );
    });
  });

  // Base styles tests
  describe('Base Styles', () => {
    it('always applies base styles', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'py-2',
        'px-4',
        'rounded-md',
        'font-medium',
        'focus:outline-none',
        'transition-colors'
      );
    });
  });

  // Custom className tests
  describe('Custom Classes', () => {
    it('applies custom className alongside base and variant styles', () => {
      render(<Button className="custom-class">Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('py-2', 'px-4'); // base styles
      expect(button).toHaveClass('bg-green-500'); // variant styles
    });

    it('handles multiple custom classes', () => {
      render(<Button className="class1 class2 class3">Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('class1', 'class2', 'class3');
    });

    it('handles empty className prop', () => {
      render(<Button className="">Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
  describe('HTML Attributes', () => {
    it('applies type attribute', () => {
      render(<Button type="submit">Submit Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('applies disabled attribute', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies custom id attribute', () => {
      render(<Button id="custom-id">Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'custom-id');
    });

    it('applies aria-label attribute', () => {
      render(<Button aria-label="Custom Label">Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('applies data attributes', () => {
      render(
        <Button data-testid="test-button" data-custom="value">
          Test Button
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'test-button');
      expect(button).toHaveAttribute('data-custom', 'value');
    });
  });

  // Disabled state tests
  describe('Disabled State', () => {
    it('maintains styling when disabled', () => {
      render(
        <Button disabled variant="danger">
          Disabled Danger
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500', 'text-white');
      expect(button).toBeDisabled();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('is focusable by default', () => {
      render(<Button>Focusable Button</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('has proper button role', () => {
      render(<Button>Role Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('supports screen reader text', () => {
      render(
        <Button aria-describedby="description">Button with description</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      render(<Button>{null}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(<Button>{undefined}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles empty string children', () => {
      render(<Button>{''}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles numeric children', () => {
      render(<Button>{42}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('42');
    });
  });

  // Snapshot testing
  describe('Snapshots', () => {
    it('matches snapshot for primary variant', () => {
      const { container } = render(<Button>Primary</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for secondary variant', () => {
      const { container } = render(
        <Button variant="secondary">Secondary</Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for danger variant', () => {
      const { container } = render(<Button variant="danger">Danger</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(<Button className="custom">Custom</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
