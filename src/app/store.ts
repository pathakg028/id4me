import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
// Update the import path if your counterSlice is located elsewhere, for example:
import counterReducer from '../features/counter/counterSlice'; // Import your slice reducer
import MobileVerificationSlice from "../features/counter/MobileVerificationSlice";

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        mobileVerification: MobileVerificationSlice, // Add your slice reducer here
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
