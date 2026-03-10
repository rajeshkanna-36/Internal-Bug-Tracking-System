import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { BugDrawer } from '../components/BugDrawer';
import { useAuth } from '../context/AuthContext';
import { Bug as BugIcon, ChevronUp, Equal, ChevronDown, Clock, Search, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { useOutletContext } from 'react-router-dom';

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'OPEN' | 'IN_REVIEW' | 'TESTING' | 'CLOSED';

interface MockBug {
    id: string | number;
    title: string;
    priority: Priority;
    status: Status;
    assigneeName?: string;
    assignee?: { id: number; name: string; username: string };
    createdAt?: string;
}

interface ContextType {
    searchTerm: string;
}

const statusTitles: Record<Status, string> = {
    OPEN: 'TO DO',
    IN_REVIEW: 'IN REVIEW',
    TESTING: 'TESTING',
    CLOSED: 'DONE'
};

const PriorityIcon = ({ priority }: { priority: Priority }) => {
    switch (priority) {
        case 'HIGH': return <ChevronUp size={16} className="text-priority-high" />;
        case 'MEDIUM': return <Equal size={16} className="text-priority-medium" />;
        case 'LOW': return <ChevronDown size={16} className="text-priority-low" />;
    }
};

export const MyBugsPage = () => {
    const { user } = useAuth();
    const context = useOutletContext<ContextType>();
    const searchTerm = context?.searchTerm || "";

    const [bugs, setBugs] = useState<MockBug[]>([]);
    const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMyBugs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bugs');
            const data: MockBug[] = response.data;

            // Filter only bugs assigned to the current user
            let myAssignedBugs = data.filter(bug => bug.assignee?.username === user?.username);

            // Map IDs for UI
            myAssignedBugs = myAssignedBugs.map(bug => ({
                ...bug,
                id: `BUG-${bug.id}`,
            }));

            setBugs(myAssignedBugs);
        } catch (error) {
            console.error("Failed to fetch my bugs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.username) {
            fetchMyBugs();
        }
    }, [user?.username]);

    // Apply Global Search filter
    const filteredBugs = bugs.filter(bug => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return bug.title.toLowerCase().includes(lowerTerm) || String(bug.id).toLowerCase().includes(lowerTerm);
    });

    return (
        <div className="flex flex-col h-full bg-transparent w-full p-8 relative">
            {/* Background Effects */}
            <div className="absolute top-10 right-20 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>

            <div className="shrink-0 mb-8 mt-2">
                <div className="flex items-center gap-2 text-brand-secondary font-mono text-xs uppercase tracking-widest mb-2 opacity-80">
                    <Sparkles size={14} />
                    <span>Focus Area</span>
                    <span className="text-text-muted">/</span>
                    <span className="text-text-secondary">Assigned</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">Your Work</h1>
                <p className="text-text-muted mt-2 max-w-2xl text-sm leading-relaxed">
                    Review and act on the bugs currently assigned to you. Keep your board clean and your project moving forward.
                </p>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-secondary"></div>
                    </div>
                ) : filteredBugs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 glass-panel rounded-2xl border-white/5 mx-auto max-w-2xl text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-text-muted">
                            <BugIcon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No bugs assigned to you</h3>
                        <p className="text-text-secondary text-sm">
                            {searchTerm ? "No results match your search." : "You're all caught up! Enjoy the zero-inbox serenity."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredBugs.map((bug) => (
                            <div
                                key={bug.id}
                                onClick={() => setSelectedBugId(String(bug.id))}
                                className="glass-card flex flex-col p-5 rounded-2xl cursor-pointer group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] hover:border-brand-secondary"
                            >
                                {/* Decorative Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-text-muted group-hover:text-brand-secondary group-hover:border-brand-secondary/30 transition-colors">
                                            <BugIcon size={18} />
                                        </div>
                                        <div className="text-xs font-mono font-bold text-text-muted bg-bg-base px-2 py-1 rounded-md border border-white/5">
                                            {String(bug.id)}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                                        bug.status === 'OPEN' ? "text-status-todo bg-status-todo/20 border border-status-todo/30" :
                                            bug.status === 'IN_REVIEW' ? "text-status-in-review bg-status-in-review/20 border border-status-in-review/30" :
                                                bug.status === 'TESTING' ? "text-status-testing bg-status-testing/20 border border-status-testing/30" :
                                                    "text-status-done bg-status-done/20 border border-status-done/30"
                                    )}>
                                        {statusTitles[bug.status]}
                                    </div>
                                </div>

                                <h3 className="text-base font-semibold text-white mb-4 line-clamp-2 leading-snug group-hover:text-brand-secondary transition-colors">
                                    {bug.title}
                                </h3>

                                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-xs text-text-muted" title={`Priority: ${bug.priority}`}>
                                            <div className="bg-bg-base/50 p-1.5 rounded-lg border border-white/5">
                                                <PriorityIcon priority={bug.priority} />
                                            </div>
                                            <span className="font-medium">{bug.priority}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BugDrawer
                isOpen={!!selectedBugId}
                onClose={() => {
                    setSelectedBugId(null);
                    fetchMyBugs(); // Refresh when drawer closes in case status changed
                }}
                bugId={selectedBugId}
            />
        </div>
    );
};
