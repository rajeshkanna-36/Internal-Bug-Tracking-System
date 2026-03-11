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
        default: "bg-status-todo/20 text-status-todo border border-status-todo/30",
        success: "bg-status-done/20 text-status-done border border-status-done/30",
        warning: "bg-status-testing/20 text-status-testing border border-status-testing/30",
        danger: "bg-priority-high/20 text-priority-high border border-priority-high/30",
        info: "bg-status-in-review/20 text-status-in-review border border-status-in-review/30"
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
