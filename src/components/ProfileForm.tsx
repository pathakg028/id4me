import React from 'react';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
    dispatch(setProfileFormLoading(true));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch(
      setProfileForm({
        ...data,
        gender:
          data.gender === 'male' ||
          data.gender === 'female' ||
          data.gender === 'other'
            ? data.gender
            : undefined,
        loading: false,
      })
    );
    dispatch(setProfileFormLoading(false));
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={`max-w-md mx-auto p-4 border rounded-md shadow-md flex flex-col gap-4 ${className}`}
    >
      <div>
        <label className="block mb-1 font-medium">Full Name</label>
        <input
          {...register('fullName')}
          className="w-full border rounded px-3 py-2 border-gray-300"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border rounded px-3 py-2 border-gray-300"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Date of Birth</label>
        <input
          {...register('dob')}
          type="date"
          className="w-full border rounded px-3 py-2 border-gray-300"
        />
        {errors.dob && (
          <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Gender</label>
        <select
          {...register('gender')}
          className="w-full border rounded px-3 py-2 border-gray-300"
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default ProfileForm;
