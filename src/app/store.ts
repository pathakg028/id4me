import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';
// Update the import path if your counterSlice is located elsewhere, for example:
import MobileVerificationSlice from "../reducer/slices/MobileVerificationSlice";
import ProfileFormSlice from "../reducer/slices/ProfileFormSlice"; // Update the path as needed

export const store = configureStore({
    reducer: {
        mobileVerification: MobileVerificationSlice,
        profileForm: ProfileFormSlice,
    },
});

export type RootState = {
    mobileVerification: ReturnType<typeof MobileVerificationSlice>;
    profileForm: ReturnType<typeof ProfileFormSlice>;
};
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
