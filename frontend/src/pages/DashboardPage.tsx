import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { ChevronUp, Equal, ChevronDown, MoreHorizontal, User, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { BugDrawer } from '../components/BugDrawer';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

// Mock Data structure based on backend entities
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'OPEN' | 'IN_REVIEW' | 'TESTING' | 'CLOSED';

interface MockBug {
    id: string | number;
    title: string;
    priority: Priority;
    status: Status;
    assigneeName?: string;
    assignee?: { id: number; name: string; username: string };
    reporter?: { id: number; name: string; username: string };
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

export const DashboardPage = () => {
    const { user } = useAuth();
    // Context from Layout.tsx for global search
    const context = useOutletContext<ContextType>();
    const searchTerm = context?.searchTerm || "";

    const [columns, setColumns] = useState<Record<Status, MockBug[]>>({
        OPEN: [],
        IN_REVIEW: [],
        TESTING: [],
        CLOSED: []
    });
    const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
    const [_loading, setLoading] = useState(true);
    const [onlyMyIssues, setOnlyMyIssues] = useState(false);

    const fetchBugs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bugs');
            const data: MockBug[] = response.data;

            // Map the flat array of bugs into columns
            const newColumns: Record<Status, MockBug[]> = {
                OPEN: [],
                IN_REVIEW: [],
                TESTING: [],
                CLOSED: []
            };

            data.forEach(bug => {
                // Determine assignee name
                const assigneeName = bug.assignee ? bug.assignee.name || bug.assignee.username : undefined;

                if (newColumns[bug.status]) {
                    newColumns[bug.status].push({
                        ...bug,
                        id: `BUG-${bug.id}`, // Format ID for UI
                        assigneeName
                    });
                }
            });

            setColumns(newColumns);
        } catch (error) {
            console.error("Failed to fetch bugs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBugs();
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceCol = source.droppableId as Status;
        const destCol = destination.droppableId as Status;

        const sourceBugs = Array.from(columns[sourceCol]);
        const destBugs = sourceCol === destCol ? sourceBugs : Array.from(columns[destCol]);

        const [movedBug] = sourceBugs.splice(source.index, 1);
        movedBug.status = destCol; // Update status if moved to new column

        destBugs.splice(destination.index, 0, movedBug);

        // Optimistically update UI
        setColumns({
            ...columns,
            [sourceCol]: sourceBugs,
            [destCol]: destBugs,
        });

        // Call backend PATCH API
        try {
            // draggableId is in format "BUG-123", we need to extract the number
            const numericId = draggableId.split('-')[1];
            await api.patch(`/api/bugs/${numericId}/status?status=${destCol}`);
        } catch (error) {
            console.error("Failed to update status on server", error);
            // Revert on failure
            fetchBugs();
        }
    };

    // Filter logic
    const getFilteredBugs = (status: Status) => {
        let list = columns[status];

        // 1. "Only my issues" Filter
        if (onlyMyIssues && user?.username) {
            list = list.filter(bug => bug.assignee?.username === user.username);
        }

        // 2. Global Search Term Filter
        if (searchTerm.trim() !== '') {
            const lowerTerm = searchTerm.toLowerCase();
            list = list.filter(bug =>
                bug.title.toLowerCase().includes(lowerTerm) ||
                String(bug.id).toLowerCase().includes(lowerTerm)
            );
        }

        return list;
    };

    return (
        <div className="flex flex-col h-full bg-transparent w-full">
            {/* Header Area */}
            <div className="px-8 py-8 shrink-0 pb-4 relative z-10">
                {/* Decorative glowing orb behind title */}
                <div className="absolute top-4 left-4 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>

                <div className="flex items-center gap-2 text-brand-primary font-mono text-xs uppercase tracking-widest mb-2 opacity-80">
                    <Sparkles size={14} />
                    <span>Project Nexus</span>
                    <span className="text-text-muted">/</span>
                    <span className="text-text-secondary">Tracking</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">Active Sprint</h1>
            </div>

            {/* Filters Bar */}
            <div className="px-8 py-4 flex items-center gap-4 shrink-0 border-b border-white/5 relative z-10 glass-panel mx-8 rounded-xl mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted mr-2 font-medium">Quick Filters:</span>
                    <button
                        onClick={() => setOnlyMyIssues(!onlyMyIssues)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-md",
                            onlyMyIssues
                                ? "bg-brand-primary/20 text-white border-brand-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                : "bg-white/5 text-text-secondary border-white/10 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        My Issues
                    </button>
                    <button className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sm font-medium transition-all text-text-secondary hover:text-white border border-white/10">
                        Recently Updated
                    </button>
                </div>
            </div>

            {/* Kanban Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-6 h-full items-start">
                        {(Object.keys(columns) as Status[]).map((status) => {
                            const filteredBugs = getFilteredBugs(status);

                            return (
                                <div key={status} className="flex flex-col w-[300px] min-w-[300px] max-h-full glass-panel rounded-2xl overflow-hidden border border-white/10 relative group">
                                    {/* Column Header */}
                                    <div className="px-4 py-4 w-full shrink-0 flex items-center justify-between sticky top-0 bg-bg-surface/50 backdrop-blur-xl border-b border-white/5 z-10">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                                                status === 'OPEN' ? "text-status-todo bg-status-todo" :
                                                    status === 'IN_REVIEW' ? "text-status-in-review bg-status-in-review" :
                                                        status === 'TESTING' ? "text-status-testing bg-status-testing" :
                                                            "text-status-done bg-status-done"
                                            )} />
                                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                                                {statusTitles[status]}
                                            </h2>
                                            <span className="text-xs font-mono bg-white/10 text-text-secondary px-2 py-0.5 rounded-full ml-1">
                                                {filteredBugs.length}
                                            </span>
                                        </div>
                                        <button className="text-text-muted hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>

                                    {/* Droppable Area */}
                                    <Droppable droppableId={status}>
                                        {(provided: any, snapshot: any) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={cn(
                                                    "flex-1 overflow-y-auto p-3 transition-colors min-h-[150px] space-y-3",
                                                    snapshot.isDraggingOver && "bg-white/5"
                                                )}
                                            >
                                                {filteredBugs.map((bug, index) => (
                                                    <Draggable key={bug.id} draggableId={String(bug.id)} index={index}>
                                                        {(provided: any, snapshot: any) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={cn(
                                                                    "glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing group relative overflow-hidden",
                                                                    snapshot.isDragging && "shadow-[0_10px_25px_rgba(0,0,0,0.5)] rotate-3 scale-105 border-brand-primary"
                                                                )}
                                                                onClick={() => {
                                                                    if (snapshot.isDragging) return;
                                                                    setSelectedBugId(String(bug.id));
                                                                }}
                                                            >
                                                                {/* Hover Glow Effect */}
                                                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                                                <div className="text-sm font-medium text-white mb-4 line-clamp-2 leading-relaxed">
                                                                    {bug.title}
                                                                </div>

                                                                <div className="flex items-center justify-between mt-auto">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-[11px] font-mono text-text-muted bg-bg-base/50 px-2 py-1 rounded-md border border-white/5">
                                                                            {String(bug.id)}
                                                                        </div>
                                                                        <div className="bg-bg-base/50 p-1 rounded-md border border-white/5" title={`Priority: ${bug.priority}`}>
                                                                            <PriorityIcon priority={bug.priority} />
                                                                        </div>
                                                                    </div>

                                                                    {bug.assigneeName ? (
                                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-bg-surface" title={`Assignee: ${bug.assigneeName}`}>
                                                                            {bug.assigneeName.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-7 h-7 rounded-full border border-dashed border-text-muted flex items-center justify-center text-text-muted bg-white/5">
                                                                            <User size={14} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>

            <BugDrawer
                isOpen={!!selectedBugId}
                onClose={() => setSelectedBugId(null)}
                bugId={selectedBugId}
            />
        </div>
    );
};
