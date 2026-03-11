import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { api } from '../utils/api';

interface CreateBugModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

interface UserOption {
    id: number;
    username: string;
    name: string;
}

export const CreateBugModal: React.FC<CreateBugModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<UserOption[]>([]);

    // Form fields mapped to backend DTO
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [stepsToReproduce, setStepsToReproduce] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [issueType, setIssueType] = useState('BUG');
    const [assigneeId, setAssigneeId] = useState('');

    // Fetch users for assignee dropdown when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/api/bugs', {
                title,
                description,
                stepsToReproduce,
                priority,
                issueType,
                ...(assigneeId ? { assigneeId: parseInt(assigneeId) } : {})
            });

            setTitle('');
            setDescription('');
            setStepsToReproduce('');
            setPriority('MEDIUM');
            setIssueType('BUG');
            setAssigneeId('');

            if (onCreated) onCreated();
            onClose();
        } catch (err: any) {
            const data = err.response?.data;
            if (typeof data === 'string') {
                setError(data);
            } else if (data?.message) {
                setError(data.message);
            } else {
                setError('Failed to create issue.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create issue">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        label="Summary"
                        placeholder="e.g. Broken link on landing page"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        required
                    />

                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Description</label>
                        <textarea
                            className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary hover:border-white/20 min-h-[120px] resize-y"
                            placeholder="Add details about the issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Steps to Reproduce</label>
                        <textarea
                            className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary hover:border-white/20 min-h-[80px] resize-y"
                            placeholder={"1. Go to...\n2. Click on...\n3. Observe..."}
                            value={stepsToReproduce}
                            onChange={(e) => setStepsToReproduce(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Type</label>
                            <select
                                className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary hover:border-white/20 appearance-none cursor-pointer"
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                            >
                                <option value="BUG">Bug</option>
                                <option value="TASK">Task</option>
                                <option value="STORY">Story</option>
                                <option value="EPIC">Epic</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Priority</label>
                            <select
                                className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary hover:border-white/20 appearance-none cursor-pointer"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="HIGH">Highest</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Lowest</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Assignee</label>
                            <select
                                className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary hover:border-white/20 appearance-none cursor-pointer"
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.username})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={loading}>
                        Create
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
