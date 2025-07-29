import React from 'react';

interface ProgressBarProps {
    className?: string;
}
const ProgressBar: React.FC<ProgressBarProps> = ({ className }) => {

    return (
        <div className={`w-full max-w-xs mx-auto mt-10${className ? ` ${className}` : ''}`}>
            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase">Step 1</span>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase">Step 2</span>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase">Step 3</span>
                </div>

                <div className="flex mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-lg">
                        <div className="h-2 bg-blue-500 rounded-lg" style={{ width: '33%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProgressBar;