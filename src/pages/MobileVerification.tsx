import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { z } from "zod";
import { verifyMobile } from "../features/counter/MobileVerificationSlice";
import { resetVerification } from "../features/counter/MobileVerificationSlice"; // Import the reset action
import "./MobileVerification.css"
import ProfileForm from "../components/ProfileForm";
import PasswordInput from "../components/PasswordInput"; // Corrected the import path



interface MobileVerificationProps {
    className?: string;
}

const passwordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters long"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

function MobileVerification({ className }: MobileVerificationProps) {
    const dispatch = useAppDispatch();
    const { verified, loading, error } = useAppSelector(
        (state) => state.mobileVerification
    );
    const [inputMobile, setInputMobile] = useState(() => localStorage.getItem("mobile") || "");
    const [currentStep, setCurrentStep] = useState(1);
    const [inputError, setInputError] = useState<string | null>(null);
    const [password, setPassword] = useState("");

    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const [isFinished, setIsFinished] = useState(false); // Add state to track if the process is finished


    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Simple validation: must be 10 digits
    const validateMobile = (mobile: string) => {
        return /^\d{10}$/.test(mobile);
    };
    const handleNext = () => {
        if (currentStep === 1 && !validateMobile(inputMobile)) {
            setInputError("Please enter a valid 10-digit mobile number.");
            inputRef.current?.focus();
            return;
        }
        if (currentStep === 3) {
            try {
                passwordSchema.parse({ password, confirmPassword });
                setPasswordError(null);
                setIsFinished(true); // Mark as finished when step 3 is completed
            } catch (e) {
                if (e instanceof z.ZodError) {
                    setPasswordError(e.issues[0].message);
                    return;
                }
            }
        }
        setInputError(null);
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
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
        <h1 className="text-2xl font-bold mb-4">Onboarding App</h1>
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${(currentStep / 3) * 100}%` }}>
            </div>
        </div>
        <div className="step-container">
            {currentStep === 1 && (
                <div>
                    <input
                        ref={inputRef}
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={inputMobile}
                        onChange={(e) => setInputMobile(e.target.value)}
                        onFocus={() => {
                            setInputError(null); // Clear error
                            dispatch(resetVerification()); // Clear verified message
                        }
                    }

                        className="w-full border border-gray-300 rounded-md p-2 mb-4"
                    />
                    {inputError && <p className="text-red-500 mb-5">{inputError}</p>}
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
            )}
            {currentStep === 2 && <ProfileForm className='mb-10' />}
            {currentStep === 3 && !isFinished && (
                    <div>
                    <PasswordInput
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <PasswordInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {passwordError && <p className="text-red-500 mt-4">{passwordError}</p>}
                </div>
                )}
        </div>
        <div className="navigation-buttons">
        {!isFinished ? (
                <>
            <button onClick={handleBack} disabled={currentStep === 1}>
                Back
            </button>
            <button onClick={() => {
                    if (currentStep === 3) {
                        setIsFinished(true); // Ensure this is called
                    } else {
                        handleNext();
                    }
                }}>
                {currentStep === 3 ? "Finish" : "Next"}
            </button>
            </>
            ) : (
                <button
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    onClick={() => alert("Get Started!")}
                >
                    Get Started
                </button>
            )}
        </div>
    </div>
);
}
export default MobileVerification;