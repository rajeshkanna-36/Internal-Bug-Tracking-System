import React, { useEffect, useState } from 'react';
import { X, ChevronUp, Equal, ChevronDown, MoreHorizontal, Bug, CheckSquare, BookOpen, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

const IssueTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'BUG': return <Bug size={16} className="text-red-400" />;
        case 'TASK': return <CheckSquare size={16} className="text-blue-400" />;
        case 'STORY': return <BookOpen size={16} className="text-green-400" />;
        case 'EPIC': return <BookOpen size={16} className="text-purple-400" />;
        default: return <Bug size={16} className="text-brand-primary" />;
    }
};

export const BugDrawer: React.FC<BugDrawerProps> = ({ isOpen, onClose, bugId }) => {
    const { user } = useAuth();
    const [bug, setBug] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    // Comments state
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

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
            setComments([]);
            setNewComment("");
        }
    }, [isOpen, bugId]);

    const fetchBugDetails = async () => {
        if (!bugId) return;
        setLoading(true);
        // Ensure bugId numeric part for API call
        const numericId = bugId.startsWith('BUG-') || bugId.startsWith('ISS-') ? bugId.split('-')[1] : bugId;
        
        try {
            const [bugRes, commentsRes] = await Promise.all([
                api.get(`/api/bugs/${numericId}`),
                api.get(`/api/bugs/${numericId}/comments`).catch(() => ({ data: [] }))
            ]);
            setBug(bugRes.data);
            setComments(commentsRes.data);
        } catch (error) {
            console.error("Failed to fetch bug details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !bug) return;
        
        setSubmittingComment(true);
        try {
            const response = await api.post(`/api/bugs/${bug.id}/comments`, { text: newComment });
            setComments([response.data, ...comments]); // Prepend new comment visually
            setNewComment("");
        } catch (error) {
            console.error("Failed to add comment", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteBug = async () => {
        if (!bug || !window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) return;
        
        try {
            await api.delete(`/api/bugs/${bug.id}`);
            onClose();
            window.location.reload(); // Quick way to refresh dashboard
        } catch (error) {
            console.error("Failed to delete bug", error);
            alert("Failed to delete the issue.");
        }
    };

    if (!isOpen) return null;

    const status = bug?.status as Status;
    const sConfig = status ? statusConfig[status] : null;

    return (
        <div className="fixed inset-0 z-40 flex justify-end">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-[650px] h-full glass-panel border-l border-white/10 shadow-[-8px_0_40px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/5">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-text-muted">
                            <IssueTypeIcon type={bug?.issueType || 'BUG'} />
                            <span className="font-mono font-medium text-white hover:underline cursor-pointer">
                                {bugId || 'ISS-?'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {user?.role === 'ADMIN' && (
                            <button onClick={handleDeleteBug} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors" title="Delete Issue">
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 pb-20 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                            <span className="text-text-muted text-sm">Loading issue details...</span>
                        </div>
                    ) : bug ? (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-8 leading-snug">
                                {bug.title}
                            </h1>

                            <div className="grid grid-cols-3 gap-10">
                                {/* Main Details */}
                                <div className="col-span-2 space-y-8">
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Description</h3>
                                        <div className="text-sm text-text-secondary bg-white/5 border border-white/10 p-5 rounded-xl min-h-[120px] whitespace-pre-line leading-relaxed hover:bg-white/10 transition-colors cursor-text prose prose-invert prose-sm max-w-none">
                                            {bug.description ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{bug.description}</ReactMarkdown>
                                            ) : (
                                                <span className="text-text-muted italic">Click to add a description...</span>
                                            )}
                                        </div>
                                    </div>

                                    {bug.stepsToReproduce && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Steps to Reproduce</h3>
                                            <div className="text-sm text-text-secondary bg-white/5 border border-white/10 p-5 rounded-xl min-h-[100px] whitespace-pre-line leading-relaxed prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{bug.stepsToReproduce}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Comments Section */}
                                    <div className="pt-8 border-t border-white/10">
                                        <h3 className="text-sm font-semibold text-text-secondary mb-5 uppercase tracking-wider">Activity</h3>
                                        
                                        {/* Add Comment Input */}
                                        <div className="flex gap-4 mb-8">
                                            <div className="w-9 h-9 mt-1 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0 border border-brand-primary/30">
                                                <span className="text-brand-primary text-xs font-bold">ME</span>
                                            </div>
                                            <div className="flex-1 relative group">
                                                <textarea 
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white/10 transition-all resize-none min-h-[80px]"
                                                />
                                                <div className="absolute flex justify-end w-full bottom-0 left-0 p-2 opacity-0 group-focus-within:opacity-100 transition-opacity bg-gradient-to-t from-bg-surface/80 to-transparent rounded-b-xl">
                                                    <button 
                                                        onClick={handleAddComment}
                                                        disabled={!newComment.trim() || submittingComment}
                                                        className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                                                        {submittingComment ? 'Saving...' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Comments List */}
                                        <div className="space-y-6">
                                            {comments.length > 0 ? (
                                                comments.map((comment: any) => (
                                                    <div key={comment.id} className="flex gap-4 group">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center shrink-0 shadow-lg">
                                                            <span className="text-white text-xs font-bold">
                                                                {(comment.user?.name || comment.user?.username || 'U').substring(0,2).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1.5">
                                                                <span className="text-sm font-semibold text-white">{comment.user?.name || comment.user?.username}</span>
                                                                <span className="text-[11px] text-text-muted font-medium">{new Date(comment.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <div className="text-sm text-text-secondary whitespace-pre-line leading-relaxed bg-white/5 border border-white/10 p-3.5 rounded-xl rounded-tl-none group-hover:border-white/20 transition-colors prose prose-invert prose-sm max-w-none">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.text}</ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-text-muted text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/5">
                                                    There are no comments yet on this issue.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar context */}
                                <div className="space-y-6 pt-1">
                                    <div>
                                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Status</h4>
                                        <button className={cn(
                                            "inline-flex w-full items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer hover:brightness-110",
                                            sConfig?.color, sConfig?.bg, `border ${sConfig?.border}`
                                        )}>
                                            <span>{sConfig?.label}</span>
                                            <ChevronDown size={14} className="opacity-50" />
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Assignee</h4>
                                        <div className="flex items-center justify-between w-full hover:bg-white/10 p-2 rounded-lg -ml-2 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-2 text-sm text-white">
                                                {bug.assignee ? (
                                                    <>
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                                                            {(bug.assignee.name || bug.assignee.username).substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium group-hover:text-brand-primary transition-colors">{bug.assignee.name || bug.assignee.username}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-text-muted italic text-xs">Unassigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Reporter</h4>
                                        <div className="flex items-center gap-2 text-sm text-white p-2 rounded-lg -ml-2">
                                            {bug.reporter ? (
                                                <>
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-teal-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                                                        {(bug.reporter.name || bug.reporter.username).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-text-secondary">{bug.reporter.name || bug.reporter.username}</span>
                                                </>
                                            ) : (
                                                <span className="text-text-muted italic text-xs">System</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Issue Type</h4>
                                        <div className="flex items-center justify-between w-full p-2 rounded-lg -ml-2 text-sm text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded bg-white/5 border border-white/10">
                                                    <IssueTypeIcon type={bug.issueType || 'BUG'} />
                                                </div>
                                                <span className="font-medium capitalize">{bug.issueType?.toLowerCase() || 'Bug'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Priority</h4>
                                        <div className="flex items-center justify-between w-full p-2 rounded-lg -ml-2 text-sm text-white cursor-pointer hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded bg-white/5 border border-white/10">
                                                    <PriorityIcon priority={bug.priority || 'MEDIUM'} />
                                                </div>
                                                <span className="font-medium capitalize text-text-secondary">{bug.priority?.toLowerCase() || 'Medium'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-white/10 pt-4 mt-6">
                                        <div className="text-[11px] text-text-muted space-y-2">
                                            <p>Created by {bug.reporter?.name || bug.reporter?.username}</p>
                                            <p>Last updated recently</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4">
                            <Bug size={48} className="text-white/10" />
                            <span className="text-white/40 font-medium">Issue could not be found.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
