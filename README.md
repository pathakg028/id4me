# ID4Me Mobile Verification Component Documentation

## Component Overview

**Component Name:** MobileVerification  
**File Path:** `/Users/gauravpathak/Desktop/id4me/src/container/MobileVerification.tsx`  
**Component Type:** Container Component  
**Description:** Multi-step mobile verification and onboarding flow with lazy loading, real-time validation, and performance optimizations

## Metadata

| Property | Value |
|----------|-------|
| **Created Date** | 2024-01-01 |
| **Last Modified** | 2024-12-29 |
| **Author** | Gaurav Pathak |
| **Version** | 1.0.0 |
| **Status** | Production |

## Dependencies

### React Imports
```typescript
import React, { 
  useRef, 
  useEffect, 
  useState, 
  lazy, 
  Suspense 
} from 'react';
```

### Third-Party Libraries

#### React Hook Form
```typescript
import { useForm } from 'react-hook-form';
```
**Purpose:** Form state management and validation

#### Custom Components
```typescript
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import Input from '../components/Input';
import OTPInput from '../components/OTPInput';
```

#### Redux Toolkit
```typescript
import { useAppDispatch, useAppSelector } from '../app/hooks';
```

#### Utils & Hooks
```typescript
import { validatePassword } from '../utils/passwordFieldValidation';
import { useDebounce } from '../hooks/useDebounce';
```

## Lazy Loading Configuration

### Profile Form Component
```typescript
const ProfileForm = lazy(() => import('../components/ProfileForm'));
```

### Fallback Loader
```typescript
const ProfileFormLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    <span className="ml-3 text-gray-600">Loading profile form...</span>
  </div>
);
```

**Features:**
- **Loading Strategy:** React.lazy()
- **Fallback Component:** ProfileFormLoader
- **Styling:** Centered with spinner animation

## Component Interface

### Props
```typescript
interface MobileVerificationProps {
  className?: string; // Additional CSS classes (optional)
}
```

### Type Definitions
```typescript
type MobileFormValues = {
  mobile: string; // 10-digit number validation
};
```

## Redux Integration

### State Slice: `mobileVerification`

**State Properties:**
- `mobile: string` - User's mobile number
- `verified: boolean` - Verification status
- `loading: boolean` - API loading state
- `error: string | null` - Error messages
- `otpSent: boolean` - OTP send status
- `otpLoading: boolean` - OTP verification loading
- `otpError: string | null` - OTP-specific errors
- `step: string` - Current verification step

**Actions:**
- `checkMobileExists` - Verify mobile number availability
- `sendOTP` - Send OTP to mobile
- `verifyOTP` - Verify entered OTP
- `setMobile` - Set mobile number
- `resetVerification` - Reset verification state
- `clearError` - Clear error messages
- `resetOTP` - Reset OTP state

## Local State Management

### Form State
```typescript
const [currentStep, setCurrentStep] = useState(1); // Current step (1-3)
const [profileSubmitted, setProfileSubmitted] = useState(false); // Profile completion
const [otp, setOtp] = useState(''); // OTP input value
const [countdown, setCountdown] = useState(0); // Resend countdown timer
```

### Password State
```typescript
const [password, setPassword] = useState(''); // Password input
const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation
const [passwordError, setPasswordError] = useState(''); // Password errors
const [confirmPasswordError, setConfirmPasswordError] = useState(''); // Confirmation errors
const [showWelcome, setShowWelcome] = useState(false); // Completion screen
```

### Refs and Timers
```typescript
const inputRef = useRef<HTMLInputElement>(null); // Auto-focus mobile input
const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Cleanup timeouts
```

## Form Configuration

### Mobile Form Setup
```typescript
const {
  register: registerMobile,
  handleSubmit: handleSubmitMobile,
  setValue: setMobileValue,
  watch: watchMobile,
  formState: { errors: mobileErrors },
} = useForm<MobileFormValues>({
  defaultValues: { 
    mobile: localStorage.getItem('mobile') || '' 
  },
});
```

### Validation Rules
```typescript
mobile: {
  required: 'Mobile number is required',
  pattern: {
    value: /^\d{10}$/,
    message: 'Enter a valid 10-digit mobile number',
  },
  onChange: (e) => {
    // Real-time sanitization and validation
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setMobileValue('mobile', value);
    dispatch(setMobile(value));
  },
}
```

### Debounce Configuration
```typescript
const currentMobile = watchMobile('mobile') || '';
const debouncedMobile = useDebounce(currentMobile, 800); // 800ms delay
```

## useEffect Hooks

### 1. Auto-Focus
```typescript
useEffect(() => {
  if (inputRef.current) {
    timeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
}, []);
```

### 2. Mobile Existence Check
```typescript
useEffect(() => {
  if (
    debouncedMobile &&
    debouncedMobile.length === 10 &&
    /^\d{10}$/.test(debouncedMobile)
  ) {
    dispatch(checkMobileExists(debouncedMobile));
  }
}, [debouncedMobile, dispatch]);
```

### 3. Countdown Timer
```typescript
useEffect(() => {
  let timer: NodeJS.Timeout;
  if (countdown > 0) {
    timer = setTimeout(() => setCountdown(countdown - 1), 1000);
  }
  return () => {
    if (timer) {
      clearTimeout(timer);
    }
  };
}, [countdown]);
```

### 4. Local Storage Sync
```typescript
useEffect(() => {
  if (mobile && mobile.length === 10) {
    localStorage.setItem('mobile', mobile);
  }
}, [mobile]);
```

### 5. Keyboard Shortcuts
```typescript
useEffect(() => {
  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + R to reset form
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      if (currentStep === 1) {
        dispatch(resetVerification());
        setOtp('');
        setCountdown(0);
      }
    }
    // Escape to clear errors
    if (e.key === 'Escape') {
      dispatch(clearError());
      setPasswordError('');
      setConfirmPasswordError('');
    }
  };

  document.addEventListener('keydown', handleGlobalKeyDown);
  return () => {
    document.removeEventListener('keydown', handleGlobalKeyDown);
  };
}, [currentStep, dispatch]);
```

### 6. Auto-Verify OTP
```typescript
useEffect(() => {
  let verifyTimeout: NodeJS.Timeout;
  if (otp.length === 6 && mobile && step === 'otp') {
    verifyTimeout = setTimeout(() => {
      dispatch(verifyOTP({ mobile, otp }));
    }, 500); // 500ms debounce
  }
  return () => {
    if (verifyTimeout) {
      clearTimeout(verifyTimeout);
    }
  };
}, [otp, mobile, step, dispatch]);
```

## Step Flow Architecture

### Step 1: Mobile Verification

#### Sub-steps:
1. **Input** - Mobile number input with real-time validation
   - Real-time validation
   - API integration
   - Debounced calls
   - Loading indicators
   - Error handling

2. **OTP** - OTP verification with auto-verify
   - Auto-verify functionality
   - Manual verification option
   - Resend functionality
   - Countdown timer
   - Error handling

3. **Verified** - Verification success state
   - Success message
   - Navigation to next step

### Step 2: Profile Setup
- Lazy loading with Suspense
- Form validation
- Navigation controls

**States:**
- **Not Submitted:** Show ProfileForm with lazy loading
- **Submitted:** Show navigation buttons

### Step 3: Password Creation
- Password strength validation
- Real-time matching validation
- Completion screen

**States:**
- **Password Setup:** Password creation form
- **Welcome:** Onboarding completion screen

## Progress Tracking

### Progress Calculation
```typescript
const getProgressPercentage = () => {
  if (currentStep === 1) {
    if (step === 'verified' && verified) return 33.33;
    else if (step === 'otp') return 20;
    else return 10;
  } else if (currentStep === 2) {
    if (profileSubmitted) return 66.66;
    else return 50;
  } else if (currentStep === 3) {
    if (showWelcome) return 100;
    else return 80;
  }
  return 0;
};
```

### Step Status
```typescript
const getStepStatus = (stepNumber: number) => {
  if (stepNumber < currentStep) return 'completed';
  if (stepNumber === currentStep) {
    if (stepNumber === 1 && verified) return 'completed';
    if (stepNumber === 2 && profileSubmitted) return 'completed';
    if (stepNumber === 3 && showWelcome) return 'completed';
    return 'active';
  }
  return 'inactive';
};
```

## Event Handlers

### Mobile Submission
```typescript
const onMobileSubmit = async (data: MobileFormValues) => {
  if (!data.mobile || data.mobile.length !== 10) return;
  
  dispatch(setMobile(data.mobile));
  const checkResult = await dispatch(checkMobileExists(data.mobile));
  
  if (checkMobileExists.fulfilled.match(checkResult)) {
    if (!checkResult.payload.exists) {
      const otpResult = await dispatch(sendOTP(data.mobile));
      if (sendOTP.fulfilled.match(otpResult)) {
        setCountdown(30);
      }
    }
  }
};
```

### OTP Handling
```typescript
// OTP Change
const handleOtpChange = (value: string) => {
  setOtp(value);
  dispatch(clearError());
};

// OTP Complete (Auto-verify)
const handleOtpComplete = async (value: string) => {
  setOtp(value);
  if (value.length === 6) {
    await dispatch(verifyOTP({ mobile, otp: value }));
  }
};

// Manual Verification
const handleVerifyOtp = async () => {
  if (otp.length === 6) {
    await dispatch(verifyOTP({ mobile, otp }));
  }
};

// Resend OTP
const handleResendOtp = async () => {
  setOtp('');
  dispatch(clearError());
  const result = await dispatch(sendOTP(mobile));
  if (sendOTP.fulfilled.match(result)) {
    setCountdown(30);
  }
};

// Change Mobile
const handleChangeMobile = () => {
  dispatch(resetOTP());
  setOtp('');
  setCountdown(0);
};
```

### Password Handling
```typescript
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
    setShowWelcome(true);
  }
};
```

### Navigation
```typescript
const handleNext = () => setCurrentStep((prev) => prev + 1);
const handleBack = () => {
  setCurrentStep((prev) => Math.max(prev - 1, 1));
  if (currentStep === 1) {
    handleChangeMobile();
  }
};
```

## Validation Logic

### Mobile Validation Status
```typescript
const getMobileValidationStatus = () => {
  if (!currentMobile) return null;
  if (currentMobile.length < 10) return 'incomplete';
  if (!/^\d{10}$/.test(currentMobile)) return 'invalid';
  if (loading) return 'checking';
  if (error) return 'error';
  return 'valid';
};
```

**Status Conditions:**
- **`null`** - Empty input
- **`incomplete`** - Less than 10 digits
- **`invalid`** - Non-numeric characters
- **`checking`** - API call in progress
- **`error`** - API error occurred
- **`valid`** - 10 digits, no errors

## UI Components Structure

### Header
```jsx
<h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
  Onboarding App
</h1>
```

### Progress Section

#### Step Indicators
- **Count:** 3 steps
- **Labels:** ["Mobile", "Profile", "Password"]
- **States:** ["active", "completed", "inactive"]

#### Progress Bar
- **Type:** Animated
- **Calculation:** Dynamic based on step completion

#### Progress Text
- **Format:** "Step {current} of 3 • {percentage}% Complete"

### Step Content

#### Step 1: Mobile Input
```jsx
<Input
  type="tel"
  placeholder="Enter your mobile number"
  // Real-time validation and sanitization
  // Max length: 10, numeric only
/>
```

**Validation Feedback:**
- 🔍 "Checking mobile number..." (checking)
- ❌ "{error_message}" (error)
- ✅ "Mobile number is available" (valid)
- ❌ "Please enter a valid 10-digit mobile number" (invalid)
- 📱 "Enter {remaining} more digits" (incomplete)

#### Step 1: OTP Verification
```jsx
<OTPInput
  length={6}
  value={otp}
  onChange={handleOtpChange}
  onComplete={handleOtpComplete}
  autoFocus
/>
```

**Features:**
- Auto-focus and auto-complete
- Success message: "✅ OTP sent successfully! Use: 123456"
- 30-second countdown for resend

#### Step 2: Profile Form
```jsx
<Suspense fallback={<ProfileFormLoader />}>
  <ProfileForm
    className="mb-10"
    onSubmit={() => setProfileSubmitted(true)}
  />
</Suspense>
```

#### Step 3: Password Creation
```jsx
<PasswordInput
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={passwordError}
/>
<PasswordStrengthIndicator password={password} />
<PasswordInput
  label="Confirm Password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  error={confirmPasswordError}
/>
```

#### Welcome Screen
```jsx
<h2 className="text-2xl font-bold text-green-600 mb-4">
  Welcome Onboard! 🎉
</h2>
<p className="text-gray-600 mb-4">
  Mobile: {mobile} | Verified: ✅
</p>
```

## Styling Configuration

### CSS Classes

#### Container
```css
.container {
  @apply w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto p-4 md:p-8 
         border rounded-md shadow-md bg-white min-h-screen flex flex-col justify-center;
}
```

#### Form Elements
```css
.input-base {
  @apply w-full border border-gray-300 rounded-md p-2 mb-2 
         focus:outline-none focus:ring-2 focus:ring-green-400;
}

.input-error { @apply border-red-500; }
.input-valid { @apply border-green-500; }
.button-full { @apply w-full; }
.button-responsive { @apply w-full sm:w-auto; }
```

#### Feedback Messages
```css
.error { @apply text-red-500 text-sm; }
.success { @apply text-green-500 text-sm; }
.info { @apply text-blue-500 text-sm; }
.warning { @apply text-gray-500 text-sm; }
```

#### Step Indicators
```css
.step-indicators { @apply mb-4; }
.step-indicator { /* Custom step indicator styles */ }
.step-circle { /* Circle with states: active, completed */ }
.step-label { /* Label with states: active, completed */ }
```

## Performance Optimizations

### Debouncing
- **Mobile Validation:** 800ms delay
- **OTP Verification:** 500ms delay

### Lazy Loading
- **Profile Form:** React.lazy() with Suspense boundary

### Cleanup Patterns
- **Timeouts:** useEffect cleanup functions
- **Event Listeners:** addEventListener/removeEventListener pairs
- **Intervals:** clearInterval on unmount

## Accessibility Features

### Keyboard Navigation
- **Tab Order:** Logical flow through form elements
- **Shortcuts:**
  - **Reset:** Ctrl/Cmd + R
  - **Clear Errors:** Escape

### ARIA Labels
- **Progress Indicators:** Step completion status
- **Form Inputs:** Input field descriptions
- **Error Messages:** Error announcements

### Focus Management
- **Auto-Focus:** Mobile input on mount
- **Focus Trapping:** Within current step

## Security Considerations

### Input Sanitization
- **Mobile Number:** Numeric characters only, max 10 digits
- **Password:** No client-side storage of password

### Data Persistence
- **localStorage:** Only mobile number for UX
- **Sensitive Data:** Not stored client-side

### API Security
- **Rate Limiting:** Debounced requests
- **Error Handling:** No sensitive info in error messages

## Testing Considerations

### Unit Tests
- Component rendering
- Form validation
- State transitions
- Event handlers

### Integration Tests
- Full user flow
- API interactions
- Error scenarios
- Keyboard navigation

### Accessibility Tests
- Screen reader compatibility
- Keyboard-only navigation
- Color contrast
- Focus indicators

## Browser Compatibility

### Target Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Responsive Design
- **Mobile:** max-width: 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

## Deployment Considerations

### Build Optimization
- **Code Splitting:** Automatic with lazy loading
- **Bundle Analysis:** Profile component loading
- **Performance Monitoring:** Core Web Vitals tracking

### Environment Variables
**Optional:**
- `VITE_ENABLE_DEBUG`
- `VITE_API_TIMEOUT`

## Maintenance Notes

### Code Quality
- **TypeScript:** Strict mode enabled
- **ESLint:** Airbnb configuration
- **Prettier:** Code formatting enabled

### Future Enhancements
- Biometric authentication
- Social login integration
- Multi-language support
- Offline capabilities

### Known Limitations
- Requires JavaScript enabled
- localStorage dependency
- Single device session

## Documentation References

- **Component Docs:** `/docs/components/mobile-verification.md`
- **API Integration:** `/docs/api/mobile-verification-endpoints.md`
- **Testing Guide:** `/docs/testing/mobile-verification-tests.md`
- **Deployment Guide:** `/docs/deployment/container-components.md`

---

**Last Updated:** December