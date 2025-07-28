import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ProfileFormState {
  fullName: string;
  email: string;
  dob: string;
  gender?: 'male' | 'female' | 'other';
  loading: boolean;
}

const initialState: ProfileFormState = {
  fullName: '',
  email: '',
  dob: '',
  gender: undefined,
  loading: false,
};

const profileFormSlice = createSlice({
  name: 'profileForm',
  initialState,
  reducers: {
    // Bulk setter - this is what ProfileForm actually uses
    setProfileForm(state, action: PayloadAction<Partial<ProfileFormState>>) {
      return { ...state, ...action.payload };
    },
    setProfileFormLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    resetProfileForm() {
      return initialState;
    },
  },
});

export const { setProfileForm, setProfileFormLoading, resetProfileForm } =
  profileFormSlice.actions;

export default profileFormSlice.reducer;
