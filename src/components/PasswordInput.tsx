import React, { useState } from "react";

interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label }) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">{label}</label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder={`Enter your ${label.toLowerCase()}`}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-2 text-gray-600"
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;