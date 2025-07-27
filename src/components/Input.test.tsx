import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

describe('Input Component', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  it('renders with placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('renders with default value', () => {
    render(<Input defaultValue="Default text" />);
    const input = screen.getByDisplayValue('Default text');
    expect(input).toBeInTheDocument();
  });

  it('renders with controlled value', () => {
    render(<Input value="Controlled value" onChange={() => {}} />);
    const input = screen.getByDisplayValue('Controlled value');
    expect(input).toBeInTheDocument();
  });
});

// Event handling tests
describe('Event Handling', () => {
  it('handles onChange events', () => {
    let inputValue = '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      inputValue = e.target.value;
    };

    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'New value' } });
    expect(inputValue).toBe('New value');
  });

  it('handles onFocus events', () => {
    let focused = false;
    const handleFocus = () => {
      focused = true;
    };

    render(<Input onFocus={handleFocus} />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    expect(focused).toBe(true);
  });

  it('handles onBlur events', () => {
    let blurred = false;
    const handleBlur = () => {
      blurred = true;
    };

    render(<Input onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(blurred).toBe(true);
  });

  it('handles onKeyDown events', () => {
    let keyPressed = '';
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      keyPressed = e.key;
    };

    render(<Input onKeyDown={handleKeyDown} />);
    const input = screen.getByRole('textbox');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(keyPressed).toBe('Enter');
  });

  it('handles onKeyUp events', () => {
    let keyReleased = '';
    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      keyReleased = e.key;
    };

    render(<Input onKeyUp={handleKeyUp} />);
    const input = screen.getByRole('textbox');

    fireEvent.keyUp(input, { key: 'Tab' });
    expect(keyReleased).toBe('Tab');
  });

  it('handles multiple character input', () => {
    let inputValue = '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      inputValue = e.target.value;
    };

    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Hello World!' } });
    expect(inputValue).toBe('Hello World!');
  });
});

// HTML attributes tests
describe('HTML Attributes', () => {
  it('applies id attribute', () => {
    render(<Input id="test-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('applies name attribute', () => {
    render(<Input name="username" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'username');
  });

  it('applies disabled attribute', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('applies required attribute', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('applies readonly attribute', () => {
    render(<Input readOnly />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('applies maxLength attribute', () => {
    render(<Input maxLength={10} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxlength', '10');
  });

  it('applies minLength attribute', () => {
    render(<Input minLength={5} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('minlength', '5');
  });

  it('applies pattern attribute', () => {
    render(<Input pattern="[0-9]{3}" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('pattern', '[0-9]{3}');
  });

  it('applies autocomplete attribute', () => {
    render(<Input autoComplete="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('applies aria-label attribute', () => {
    render(<Input aria-label="Email address" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Email address');
  });

  it('applies aria-describedby attribute', () => {
    render(<Input aria-describedby="help-text" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'help-text');
  });

  it('applies data attributes', () => {
    render(<Input data-testid="custom-input" data-custom="value" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-testid', 'custom-input');
    expect(input).toHaveAttribute('data-custom', 'value');
  });
});

// Accessibility tests
describe('Accessibility', () => {
  it('is focusable by default', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    input.focus();
    expect(input).toHaveFocus();
  });

  it('supports keyboard navigation', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    fireEvent.keyDown(input, { key: 'Tab' });
    expect(input).toBeInTheDocument();
  });

  it('has proper role for different input types', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('supports screen reader labels', () => {
    render(<Input aria-label="Search query" type="search" />);
    const input = screen.getByLabelText('Search query');
    expect(input).toBeInTheDocument();
  });
});

// Edge cases
describe('Edge Cases', () => {
  it('handles empty string values', () => {
    render(<Input value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('handles special characters', () => {
    let inputValue = '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      inputValue = e.target.value;
    };

    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, {
      target: { value: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
    });
    expect(inputValue).toBe('!@#$%^&*()_+-=[]{}|;:,.<>?');
  });

  it('handles unicode characters', () => {
    let inputValue = '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      inputValue = e.target.value;
    };

    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '🚀 émojis & àccénts' } });
    expect(inputValue).toBe('🚀 émojis & àccénts');
  });

  it('handles very long text', () => {
    const longText = 'A'.repeat(1000);
    let inputValue = '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      inputValue = e.target.value;
    };

    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: longText } });
    expect(inputValue).toBe(longText);
  });
});
