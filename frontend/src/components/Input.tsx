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
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary hover:border-white/20",
                        icon && "pl-10",
                        error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs text-red-400 mt-0.5">{error}</span>
            )}
        </div>
    );
});
Input.displayName = 'Input';
