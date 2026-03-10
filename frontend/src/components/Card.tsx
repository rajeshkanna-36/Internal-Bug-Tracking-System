import React from 'react';
import { cn } from '../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                "bg-jira-gray-card border border-jira-gray-border rounded-[3px] p-5 shadow-sm hover:shadow-md transition-shadow",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
