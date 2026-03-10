import React, { useEffect } from 'react';
import { cn } from '../utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className
}) => {
    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#091e428a] backdrop-blur-[1px] transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div
                className={cn(
                    "relative bg-white rounded-[3px] shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200",
                    className
                )}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#dfe1e6]">
                    <h2 className="text-xl font-medium text-[#172b4d]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-[3px] hover:bg-[#091e420f] transition-colors text-[#42526e]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
