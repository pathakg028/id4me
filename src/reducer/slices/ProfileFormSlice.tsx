import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ProfileFormState {
  fullName: string;
  email: string;
  dob: string;
  gender?: 'male' | 'female' | 'other';
  loading: boolean; // Add loading state
}

const initialState: ProfileFormState = {
  fullName: '',
  email: '',
  dob: '',
  gender: undefined,
  loading: false, // Initialize loading
};

const profileFormSlice = createSlice({
  name: 'profileForm',
  initialState,
  reducers: {
    setFullName(state, action: PayloadAction<string>) {
      state.fullName = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setDob(state, action: PayloadAction<string>) {
      state.dob = action.payload;
    },
    setGender(
      state,
      action: PayloadAction<'male' | 'female' | 'other' | undefined>
    ) {
      state.gender = action.payload;
    },
    setProfileForm(state, action: PayloadAction<ProfileFormState>) {
      return { ...state, ...action.payload };
    },
    resetProfileForm() {
      return initialState;
    },
    setProfileFormLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setFullName,
  setEmail,
  setDob,
  setGender,
  setProfileForm,
  resetProfileForm,
  setProfileFormLoading,
} = profileFormSlice.actions;

export default profileFormSlice.reducer;
