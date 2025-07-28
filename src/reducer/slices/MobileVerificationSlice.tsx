import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: string;
  mobile: string;
  name?: string;
  email?: string;
}

interface MobileVerificationState {
  mobile: string;
  verified: boolean;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  otpLoading: boolean;
  otpError: string | null;
  user: User | null;
  step: 'input' | 'otp' | 'verified';
}

const initialState: MobileVerificationState = {
  mobile: '',
  verified: false,
  loading: false,
  error: null,
  otpSent: false,
  otpLoading: false,
  otpError: null,
  user: null,
  step: 'input',
};

// Check if mobile number exists in database
export const checkMobileExists = createAsyncThunk(
  'mobileVerification/checkMobileExists',
  async (mobile: string, { rejectWithValue }) => {
    try {
      console.log('🔍 Checking mobile:', mobile);

      const response = await axios.get(
        `http://localhost:3000/users?mobile=${mobile}`,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📱 API Response:', response.data);

      if (response.data && response.data.length > 0) {
        // Mobile number exists - return user data
        return {
          exists: true,
          user: response.data[0],
        };
      } else {
        // Mobile number doesn't exist - can proceed with registration
        return {
          exists: false,
          user: null,
        };
      }
    } catch (error: any) {
      console.error('❌ API Error:', error);

      let message = 'Failed to verify mobile number';

      if (error.code === 'ECONNREFUSED') {
        message =
          'Cannot connect to server. Please check if the API server is running.';
      } else if (error.code === 'ENOTFOUND') {
        message = 'Server not found. Please check your network connection.';
      } else if (error.response) {
        message = `Server error: ${error.response.status} - ${error.response.statusText}`;
      } else if (error.request) {
        message = 'No response from server. Please try again.';
      } else {
        message = error.message || 'An unexpected error occurred';
      }

      return rejectWithValue(message);
    }
  }
);

// Send OTP to mobile number
export const sendOTP = createAsyncThunk(
  'mobileVerification/sendOTP',
  async (mobile: string, { rejectWithValue }) => {
    try {
      // In a real app, this would call your OTP service
      return new Promise<{ mobile: string; otpId: string; message: string }>(
        (resolve) => {
          setTimeout(() => {
            resolve({
              mobile,
              otpId: 'simulated-otp-id',
              message: 'OTP sent successfully',
            });
          }, 1500);
        }
      );
    } catch (error: any) {
      console.error('❌ OTP Send Error:', error);
      return rejectWithValue('Failed to send OTP. Please try again.');
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'mobileVerification/verifyOTP',
  async (
    { mobile, otp }: { mobile: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API call for OTP verification
      return new Promise<{
        mobile: string;
        verified: boolean;
        message: string;
      }>((resolve, reject) => {
        setTimeout(() => {
          // For demo purposes - accept 123456 as valid OTP
          if (otp === '123456') {
            resolve({
              mobile,
              verified: true,
              message: 'Mobile number verified successfully',
            });
          } else {
            reject(new Error('Invalid OTP. Please try again.'));
          }
        }, 1500);
      });
    } catch (error: any) {
      console.error('❌ OTP Verification Error:', error);

      let message = 'Failed to verify OTP';
      if (error.message) {
        message = error.message;
      }

      return rejectWithValue(message);
    }
  }
);

const mobileVerificationSlice = createSlice({
  name: 'mobileVerification',
  initialState,
  reducers: {
    setMobile: (state, action: PayloadAction<string>) => {
      state.mobile = action.payload;
      state.error = null; // Clear errors when mobile changes
    },
    resetVerification: (state) => {
      return initialState;
    },
    clearError: (state) => {
      state.error = null;
      state.otpError = null;
    },
    setStep: (state, action: PayloadAction<'input' | 'otp' | 'verified'>) => {
      state.step = action.payload;
    },
    resetOTP: (state) => {
      state.otpSent = false;
      state.otpError = null;
      state.step = 'input';
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle checkMobileExists
      .addCase(checkMobileExists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkMobileExists.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.exists) {
          state.error =
            'This mobile number is already registered. Please login instead.';
          state.user = action.payload.user;
        } else {
          state.error = null;
          state.user = null;
          // Mobile is available for registration
        }
      })
      .addCase(checkMobileExists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
      })

      // Handle sendOTP
      .addCase(sendOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.step = 'otp';
        state.mobile = action.payload.mobile;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload as string;
      })

      // Handle verifyOTP
      .addCase(verifyOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.verified = true;
        state.step = 'verified';
        state.mobile = action.payload.mobile;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload as string;
      });
  },
});

export const { setMobile, resetVerification, clearError, setStep, resetOTP } =
  mobileVerificationSlice.actions;

export default mobileVerificationSlice.reducer;
