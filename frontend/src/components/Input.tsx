import React from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    icon,
    className,
    ...props
}, ref) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className="text-sm font-semibold text-jira-gray-subtext">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-jira-gray-subtext">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-[#fafbfc] border border-[#dfe1e6] hover:bg-[#ebecf0] focus:bg-white focus:border-jira-blue focus:ring-2 focus:ring-jira-blue focus:ring-opacity-20 rounded-[3px] px-3 py-2 text-sm text-jira-gray-text placeholder:text-[#8993a4] outline-none transition-colors",
                        icon && "pl-10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs text-red-500 mt-0.5">{error}</span>
            )}
        </div>
    );
});
Input.displayName = 'Input';
