import React, { useEffect, useState } from 'react';
import { X, ChevronUp, Equal, ChevronDown, Check, MoreHorizontal } from 'lucide-react';
import { Badge } from './Badge';
import { api } from '../utils/api';

interface BugDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    bugId: string | null;
}

const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
        case 'HIGH': return <ChevronUp size={16} className="text-red-500" />;
        case 'MEDIUM': return <Equal size={16} className="text-orange-500" />;
        case 'LOW': return <ChevronDown size={16} className="text-blue-500" />;
        default: return null;
    }
};

export const BugDrawer: React.FC<BugDrawerProps> = ({ isOpen, onClose, bugId }) => {
    const [bug, setBug] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (bugId) {
                fetchBugDetails();
            }
        } else {
            document.body.style.overflow = 'unset';
            setBug(null);
        }
    }, [isOpen, bugId]);

    const fetchBugDetails = async () => {
        if (!bugId) return;
        setLoading(true);
        try {
            // strip 'BUG-' prefix if present
            const numericId = bugId.startsWith('BUG-') ? bugId.split('-')[1] : bugId;
            const response = await api.get(`/api/bugs/${numericId}`);
            setBug(response.data);
        } catch (error) {
            console.error("Failed to fetch bug details", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex justify-end">
            <div
                className="absolute inset-0 bg-[#091e424f] backdrop-blur-[1px] transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-[600px] h-full bg-white shadow-[-4px_0_16px_rgba(9,30,66,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header Navbar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#dfe1e6] shrink-0">
                    <div className="flex items-center gap-4 text-sm font-medium text-[#5e6c84]">
                        <span className="hover:underline cursor-pointer flex gap-1 items-center">
                            <Check size={16} className="text-blue-500 bg-blue-100 rounded-sm" />
                            {bugId || 'BUG-123'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-[3px] text-[#42526e] hover:bg-[#091e420f] transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                        <button onClick={onClose} className="p-1.5 rounded-[3px] text-[#42526e] hover:bg-[#091e420f] transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-[#5e6c84]">Loading details...</div>
                    ) : bug ? (
                        <>
                            <h1 className="text-2xl font-semibold text-[#172b4d] mb-6 outline-none focus:ring-2 focus:ring-jira-blue rounded-[3px] p-1 -ml-1 border border-transparent hover:bg-[#ebecf0] hover:border-[#dfe1e6]">
                                {bug.title}
                            </h1>

                            <div className="grid grid-cols-3 gap-8">
                                {/* Main Details */}
                                <div className="col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-base font-semibold text-[#172b4d] mb-3">Description</h3>
                                        <div className="text-sm text-[#172b4d] bg-[#fafbfc] border border-[#dfe1e6] p-3 rounded-[3px] min-h-[100px] hover:bg-[#ebecf0] cursor-text whitespace-pre-line">
                                            {bug.description || "No description provided."}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-semibold text-[#172b4d] mb-3">Steps to Reproduce</h3>
                                        <div className="text-sm text-[#172b4d] bg-[#fafbfc] border border-[#dfe1e6] p-3 rounded-[3px] min-h-[100px] hover:bg-[#ebecf0] cursor-text whitespace-pre-line">
                                            {bug.stepsToReproduce || "No steps provided."}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar context */}
                                <div className="space-y-6 pt-1">
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#5e6c84] uppercase tracking-wider mb-2">Status</h4>
                                        <Badge variant="default" className="cursor-pointer hover:bg-[#c1c7d0]">{bug.status}</Badge>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold text-[#5e6c84] uppercase tracking-wider mb-2">Assignee</h4>
                                        <div className="flex items-center gap-2 text-sm text-[#172b4d] hover:bg-[#ebecf0] p-1 rounded-[3px] -ml-1 cursor-pointer">
                                            {bug.assignee ? (
                                                <React.Fragment>
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                                                        {(bug.assignee.name || bug.assignee.username).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {bug.assignee.name || bug.assignee.username}
                                                </React.Fragment>
                                            ) : (
                                                <span className="text-[#5e6c84] italic">Unassigned</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold text-[#5e6c84] uppercase tracking-wider mb-2">Reporter</h4>
                                        <div className="flex items-center gap-2 text-sm text-[#172b4d] hover:bg-[#ebecf0] p-1 rounded-[3px] -ml-1 cursor-pointer">
                                            {bug.reporter ? (
                                                <React.Fragment>
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-teal-500 text-white flex items-center justify-center text-[10px] font-bold">
                                                        {(bug.reporter.name || bug.reporter.username).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {bug.reporter.name || bug.reporter.username}
                                                </React.Fragment>
                                            ) : (
                                                <span className="text-[#5e6c84] italic">System</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold text-[#5e6c84] uppercase tracking-wider mb-2">Priority</h4>
                                        <div className="flex items-center gap-2 text-sm text-[#172b4d] hover:bg-[#ebecf0] p-1 rounded-[3px] -ml-1 cursor-pointer capitalize">
                                            <PriorityIcon priority={bug.priority} />
                                            {bug.priority}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-[#bf2600]">Failed to load bug details.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
