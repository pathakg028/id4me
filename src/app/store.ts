import { configureStore } from '@reduxjs/toolkit';
import MobileVerificationSlice from "../reducer/slices/MobileVerificationSlice";
import ProfileFormSlice from "../reducer/slices/ProfileFormSlice";

export const store = configureStore({
    reducer: {
        mobileVerification: MobileVerificationSlice,
        profileForm: ProfileFormSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;