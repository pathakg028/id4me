// import React, { useState } from 'react';

// type MobileVerificationProps = {
//     onSubmit: (verificationCode: string) => void;
//     loading: boolean;
//     error?: string;
// };

// const MobileVerification: React.FC<MobileVerificationProps> = ({ onSubmit, loading, error }) => {
//     const [verificationCode, setVerificationCode] = useState<string>('');
//     const [isValid, setIsValid] = useState<boolean>(true);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setVerificationCode(e.target.value);
//         // Validation to allow only numbers and ensure the code length is 6
//         if (/[^0-9]/.test(e.target.value)) {
//             setIsValid(false);
//         } else if (e.target.value.length === 6) {
//             setIsValid(true);
//         }
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (verificationCode.length === 6 && isValid) {
//             onSubmit(verificationCode);
//         }
//     };

//     return (
//         <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
//             <h2 className="text-2xl font-semibold text-center mb-4">Verify Mobile Number</h2>

//             <form onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                     <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
//                         Enter the verification code
//                     </label>
//                     <input
//                         id="verificationCode"
//                         type="text"
//                         maxLength={6}
//                         value={verificationCode}
//                         onChange={handleChange}
//                         className={`mt-2 block w-full px-4 py-2 border rounded-md ${!isValid || error ? 'border-red-500' : 'border-gray-300'
//                             } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                         placeholder="123456"
//                         disabled={loading}
//                     />
//                     {!isValid && <p className="text-sm text-red-500 mt-1">Code must be a 6-digit number</p>}
//                     {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
//                 </div>

//                 <button
//                     type="submit"
//                     disabled={loading || verificationCode.length !== 6}
//                     className={`w-full py-2 px-4 mt-4 text-white font-semibold rounded-md ${loading || verificationCode.length !== 6
//                             ? 'bg-gray-300 cursor-not-allowed'
//                             : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
//                         }`}
//                 >
//                     {loading ? 'Verifying...' : 'Verify'}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default MobileVerification;

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { verifyMobile, setMobile } from "../features/counter/MobileVerificationSlice";

const MobileVerification: React.FC = () => {
    const dispatch = useAppDispatch();
    const { mobile, verified, loading, error } = useAppSelector(
        (state) => state.mobileVerification
    );

    const [inputMobile, setInputMobile] = useState("");

    const handleVerify = () => {
        dispatch(verifyMobile(inputMobile));
    };

    return (
        <div className="max-w-md mx-auto p-4 border rounded-md shadow-md">
            <h1 className="text-2xl font-bold mb-4">Mobile Verification</h1>
            <input
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
