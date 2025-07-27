import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface MobileVerificationState {
    mobile: string;
    verified: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: MobileVerificationState = {
    mobile: "",
    verified: false,
    loading: false,
    error: null,
};

// Async thunk to verify mobile number
export const verifyMobile = createAsyncThunk(
    "mobileVerification/verifyMobile",
    async (mobile: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`http://localhost:3000/users?mobile=${mobile}`);
            if (response.data.length > 0) {
                return response.data[0];
            } else {
                throw new Error("Mobile number not found");
            }
        } catch (error: unknown) {
            let message = "An error occurred";
            if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);

const mobileVerificationSlice = createSlice({
    name: "mobileVerification",
    initialState: {
        mobile: "",
        verified: false,
        loading: false,
        error: null,
    } as MobileVerificationState,
    reducers: {
        verifyMobileReducer: (state, action) => {
            // Verification logic
        },
        resetVerification: (state) => {
            state.verified = false; // Reset verified state
        },
        setMobile(state, action) {
            state.mobile = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(verifyMobile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyMobile.fulfilled, (state, action) => {
                state.loading = false;
                state.verified = true;
                state.mobile = action.payload.mobile;
            })
            .addCase(verifyMobile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setMobile, verifyMobileReducer, resetVerification } = mobileVerificationSlice.actions;
export default mobileVerificationSlice.reducer;
