import React from 'react';
import { cn } from '../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className,
    ...props
}) => {
    const variants = {
        default: "bg-[#dfe1e6] text-[#42526e]", // OPEN / TO DO
        success: "bg-jira-green-bg text-jira-green-text", // CLOSED / DONE
        warning: "bg-jira-yellow-bg text-jira-yellow-text", // IN PROGRESS
        danger: "bg-jira-red-bg text-jira-red-text", // HIGH PRIORITY
        info: "bg-jira-blue-light text-jira-blue-text" // IN REVIEW / TESTING
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-bold uppercase tracking-wide",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
