import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { verifyMobile } from "../features/counter/MobileVerificationSlice";

const MobileVerification: React.FC = () => {
    const dispatch = useAppDispatch();
    const { verified, loading, error } = useAppSelector(
        (state) => state.mobileVerification
    );

    const [inputMobile, setInputMobile] = useState(() => localStorage.getItem("mobile") || "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleVerify = () => {
        dispatch(verifyMobile(inputMobile));
        localStorage.setItem("mobile", inputMobile);
    };

    return (
        <div className="max-w-md mx-auto p-4 border rounded-md shadow-md">
            <h1 className="text-2xl font-bold mb-4">Mobile Verification</h1>
            <input
                ref={inputRef}
                type="tel"
                placeholder="Enter your mobile number"
                value={inputMobile}
                onChange={(e) => setInputMobile(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
            />
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