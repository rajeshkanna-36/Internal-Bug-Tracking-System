import React, { useEffect, useState } from 'react';
import { X, ChevronUp, Equal, ChevronDown, MoreHorizontal, Bug } from 'lucide-react';
import { api } from '../utils/api';
import { cn } from '../utils/cn';

interface BugDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    bugId: string | null;
}

type Status = 'OPEN' | 'IN_REVIEW' | 'TESTING' | 'CLOSED';

const statusConfig: Record<Status, { label: string; color: string; bg: string; border: string }> = {
    OPEN: { label: 'TO DO', color: 'text-status-todo', bg: 'bg-status-todo/20', border: 'border-status-todo/30' },
    IN_REVIEW: { label: 'IN REVIEW', color: 'text-status-in-review', bg: 'bg-status-in-review/20', border: 'border-status-in-review/30' },
    TESTING: { label: 'TESTING', color: 'text-status-testing', bg: 'bg-status-testing/20', border: 'border-status-testing/30' },
    CLOSED: { label: 'DONE', color: 'text-status-done', bg: 'bg-status-done/20', border: 'border-status-done/30' },
};

const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
        case 'HIGH': return <ChevronUp size={16} className="text-priority-high" />;
        case 'MEDIUM': return <Equal size={16} className="text-priority-medium" />;
        case 'LOW': return <ChevronDown size={16} className="text-priority-low" />;
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

    const status = bug?.status as Status;
    const sConfig = status ? statusConfig[status] : null;

    return (
        <div className="fixed inset-0 z-40 flex justify-end">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-[600px] h-full glass-panel border-l border-white/10 shadow-[-4px_0_30px_rgba(0,0,0,0.4)] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-text-muted">
                            <Bug size={16} className="text-brand-primary" />
                            <span className="font-mono font-medium text-white bg-white/10 px-2 py-0.5 rounded-md text-xs">
                                {bugId || 'BUG-?'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                        </div>
                    ) : bug ? (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-6 leading-snug">
                                {bug.title}
                            </h1>

                            <div className="grid grid-cols-3 gap-8">
                                {/* Main Details */}
                                <div className="col-span-2 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Description</h3>
                                        <div className="text-sm text-text-secondary bg-white/5 border border-white/10 p-4 rounded-xl min-h-[100px] whitespace-pre-line leading-relaxed">
                                            {bug.description || "No description provided."}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Steps to Reproduce</h3>
                                        <div className="text-sm text-text-secondary bg-white/5 border border-white/10 p-4 rounded-xl min-h-[100px] whitespace-pre-line leading-relaxed">
                                            {bug.stepsToReproduce || "No steps provided."}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar context */}
                                <div className="space-y-6 pt-1">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Status</h4>
                                        {sConfig && (
                                            <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", sConfig.color, sConfig.bg, `border ${sConfig.border}`)}>
                                                {sConfig.label}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Assignee</h4>
                                        <div className="flex items-center gap-2 text-sm text-white p-1.5 rounded-lg -ml-1">
                                            {bug.assignee ? (
                                                <>
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-bg-surface">
                                                        {(bug.assignee.name || bug.assignee.username).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{bug.assignee.name || bug.assignee.username}</span>
                                                </>
                                            ) : (
                                                <span className="text-text-muted italic text-xs">Unassigned</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Reporter</h4>
                                        <div className="flex items-center gap-2 text-sm text-white p-1.5 rounded-lg -ml-1">
                                            {bug.reporter ? (
                                                <>
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-teal-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-bg-surface">
                                                        {(bug.reporter.name || bug.reporter.username).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{bug.reporter.name || bug.reporter.username}</span>
                                                </>
                                            ) : (
                                                <span className="text-text-muted italic text-xs">System</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Priority</h4>
                                        <div className="flex items-center gap-2 text-sm text-white p-1.5 rounded-lg -ml-1">
                                            <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
                                                <PriorityIcon priority={bug.priority} />
                                            </div>
                                            <span className="font-medium capitalize">{bug.priority?.toLowerCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
                            <Bug size={32} className="text-red-400/50" />
                            <span className="text-red-400">Failed to load bug details.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
