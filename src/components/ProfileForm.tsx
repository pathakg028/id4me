import React, { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFormSchema } from '../utils/profileFormValidation';
import { z } from 'zod';
import {
  setProfileForm,
  setProfileFormLoading,
} from '../reducer/slices/ProfileFormSlice';

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  className?: string;
  onSubmit: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ className, onSubmit }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.profileForm.loading);

  // Refs for keyboard navigation
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  // Auto-focus first field on mount
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Focus first error field when validation fails
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof ProfileFormData;
    if (firstError) {
      setFocus(firstError);
    }
  }, [errors, setFocus]);

  const handleFormSubmit = async (data: ProfileFormData) => {
    dispatch(setProfileFormLoading(true));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    dispatch(
      setProfileForm({
        ...data,
        gender: data.gender || undefined,
      })
    );

    dispatch(setProfileFormLoading(false));
    onSubmit();
  };

  // Enhanced keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    currentRef: React.RefObject<
      HTMLInputElement | HTMLSelectElement | HTMLButtonElement
    >,
    nextRef?: React.RefObject<
      HTMLInputElement | HTMLSelectElement | HTMLButtonElement
    >
  ) => {
    // Enter key navigation
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }

    // Arrow key navigation
    if (e.key === 'ArrowDown' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const refs = [fullNameRef, emailRef, dobRef, genderRef, submitRef];
      const currentIndex = refs.findIndex((ref) => ref === currentRef);
      if (currentIndex > 0) {
        refs[currentIndex - 1].current?.focus();
      }
    }

    // Escape to blur current field
    if (e.key === 'Escape') {
      currentRef.current?.blur();
    }
  };

  // Handle form-level keyboard shortcuts
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }

    // Alt + number to jump to specific field
    if (e.altKey && !isNaN(Number(e.key))) {
      e.preventDefault();
      const fieldNumber = Number(e.key);
      const refs = [fullNameRef, emailRef, dobRef, genderRef, submitRef];
      if (fieldNumber >= 1 && fieldNumber <= refs.length) {
        refs[fieldNumber - 1].current?.focus();
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      onKeyDown={handleFormKeyDown}
      className={`max-w-md mx-auto p-4 border rounded-md shadow-md flex flex-col gap-4 ${className}`}
      role="form"
      aria-label="Profile information form"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-center mb-2">
          Profile Information
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Use Tab to navigate, Enter to move to next field, Ctrl+Enter to submit
        </p>
      </div>

      <div>
        <label htmlFor="fullName" className="block mb-1 font-medium">
          Full Name{' '}
          <span className="text-red-500" aria-label="required">
            *
          </span>
        </label>
        <input
          {...register('fullName')}
          ref={(e) => {
            register('fullName').ref(e);
            firstInputRef.current = e;
            fullNameRef.current = e;
          }}
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Enter your full name"
          className="w-full border rounded px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          onKeyDown={(e) => handleKeyDown(e, fullNameRef, emailRef)}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName && (
          <p
            id="fullName-error"
            className="text-red-500 text-sm mt-1"
            role="alert"
            aria-live="polite"
          >
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Email{' '}
          <span className="text-red-500" aria-label="required">
            *
          </span>
        </label>
        <input
          {...register('email')}
          ref={(e) => {
            register('email').ref(e);
            emailRef.current = e;
          }}
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          className="w-full border rounded px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          onKeyDown={(e) => handleKeyDown(e, emailRef, dobRef)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p
            id="email-error"
            className="text-red-500 text-sm mt-1"
            role="alert"
            aria-live="polite"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="dob" className="block mb-1 font-medium">
          Date of Birth{' '}
          <span className="text-red-500" aria-label="required">
            *
          </span>
        </label>
        <input
          {...register('dob')}
          ref={(e) => {
            register('dob').ref(e);
            dobRef.current = e;
          }}
          id="dob"
          type="date"
          autoComplete="bday"
          className="w-full border rounded px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          onKeyDown={(e) => handleKeyDown(e, dobRef, genderRef)}
          aria-invalid={!!errors.dob}
          aria-describedby={errors.dob ? 'dob-error' : undefined}
        />
        {errors.dob && (
          <p
            id="dob-error"
            className="text-red-500 text-sm mt-1"
            role="alert"
            aria-live="polite"
          >
            {errors.dob.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="gender" className="block mb-1 font-medium">
          Gender
        </label>
        <select
          {...register('gender')}
          ref={(e) => {
            register('gender').ref(e);
            genderRef.current = e;
          }}
          id="gender"
          autoComplete="sex"
          className="w-full border rounded px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          onKeyDown={(e) => handleKeyDown(e, genderRef, submitRef)}
          aria-invalid={!!errors.gender}
          aria-describedby={errors.gender ? 'gender-error' : undefined}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && (
          <p
            id="gender-error"
            className="text-red-500 text-sm mt-1"
            role="alert"
            aria-live="polite"
          >
            {errors.gender.message}
          </p>
        )}
      </div>

      <button
        ref={submitRef}
        type="submit"
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            genderRef.current?.focus();
          }
        }}
        aria-describedby="submit-help"
      >
        {loading ? 'Submitting...' : 'Submit Profile'}
      </button>

      <p id="submit-help" className="text-xs text-gray-500 text-center">
        Press Ctrl+Enter to submit from any field, Alt+1-5 to jump to specific
        fields
      </p>
    </form>
  );
};

export default ProfileForm;
