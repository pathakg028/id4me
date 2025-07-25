import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { verifyMobile } from "../features/counter/MobileVerificationSlice";

interface MobileVerificationProps {
    className?: string;
}
function MobileVerification({ className }: MobileVerificationProps) {
    const dispatch = useAppDispatch();
    const { verified, loading, error } = useAppSelector(
        (state) => state.mobileVerification
    );

    const [inputMobile, setInputMobile] = useState(() => localStorage.getItem("mobile") || "");
    const [inputError, setInputError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Simple validation: must be 10 digits
    const validateMobile = (mobile: string) => {
        return /^\d{10}$/.test(mobile);
    };

    const handleVerify = () => {
        if (!validateMobile(inputMobile)) {
            setInputError("Please enter a valid 10-digit mobile number.");
            return;
        }
        setInputError(null);
        dispatch(verifyMobile(inputMobile));
        localStorage.setItem("mobile", inputMobile);
    };

    return (
        <div className={`max-w-md mx-auto p-4 border rounded-md shadow-md ${className}`}>
            <h1 className="text-2xl font-bold mb-4">Mobile Verification</h1>
            <input
                ref={inputRef}
                type="tel"
                placeholder="Enter your mobile number"
                value={inputMobile}
                onChange={(e) => setInputMobile(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
            />
            {inputError && <p className="text-red-500 mb-2">{inputError}</p>}
            <button
                onClick={handleVerify}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                disabled={loading}
            >
                {loading ? "Verifying..." : "Verify"}
            </button>
            {verified && <p className="text-green-500 mt-4">Mobile number verified!</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default MobileVerification;