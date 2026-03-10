import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { api } from '../utils/api';

interface CreateBugModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void; // Optional callback to refresh dashboard
}

export const CreateBugModal: React.FC<CreateBugModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form fields mapped to backend DTO
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [stepsToReproduce, setStepsToReproduce] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [assigneeId, setAssigneeId] = useState('');

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
                // Only send assigneeId if one is selected
                ...(assigneeId ? { assigneeId: parseInt(assigneeId) } : {})
            });

            // Reset form
            setTitle('');
            setDescription('');
            setStepsToReproduce('');
            setPriority('MEDIUM');
            setAssigneeId('');

            if (onCreated) onCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create issue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create issue">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="text-[#bf2600] text-sm bg-[#ffebe6] p-2 rounded-[3px]">
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

                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-semibold text-jira-gray-subtext">Description</label>
                        <textarea
                            className="w-full bg-[#fafbfc] border border-[#dfe1e6] hover:bg-[#ebecf0] focus:bg-white focus:border-jira-blue focus:ring-2 focus:ring-jira-blue focus:ring-opacity-20 rounded-[3px] px-3 py-2 text-sm text-jira-gray-text placeholder:text-[#8993a4] outline-none transition-colors min-h-[120px] resize-y"
                            placeholder="Add details about the issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-sm font-semibold text-jira-gray-subtext">Steps to Reproduce</label>
                        <textarea
                            className="w-full bg-[#fafbfc] border border-[#dfe1e6] hover:bg-[#ebecf0] focus:bg-white focus:border-jira-blue focus:ring-2 focus:ring-jira-blue focus:ring-opacity-20 rounded-[3px] px-3 py-2 text-sm text-jira-gray-text placeholder:text-[#8993a4] outline-none transition-colors min-h-[80px] resize-y"
                            placeholder="1. Go to...\n2. Click on...\n3. Observe..."
                            value={stepsToReproduce}
                            onChange={(e) => setStepsToReproduce(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-semibold text-jira-gray-subtext">Priority</label>
                            <select
                                className="w-full bg-[#fafbfc] border border-[#dfe1e6] hover:bg-[#ebecf0] focus:bg-white focus:border-jira-blue focus:ring-2 focus:ring-jira-blue focus:ring-opacity-20 rounded-[3px] px-3 py-2 text-sm text-jira-gray-text outline-none transition-colors appearance-none"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="HIGH">Highest</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Lowest</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-semibold text-jira-gray-subtext">Assignee</label>
                            <select
                                className="w-full bg-[#fafbfc] border border-[#dfe1e6] hover:bg-[#ebecf0] focus:bg-white focus:border-jira-blue focus:ring-2 focus:ring-jira-blue focus:ring-opacity-20 rounded-[3px] px-3 py-2 text-sm text-jira-gray-text outline-none transition-colors appearance-none"
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                <option value="1">Rajesh Kanna</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#dfe1e6] mt-6">
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
