import { useState, useEffect } from 'react';
import { api, getProjects, getSprintsByProject, createSprint, assignBugToSprint } from '../utils/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FolderKanban, Plus, Clock, Bug as BugIcon, CheckSquare, BookOpen, ChevronUp, Equal, ChevronDown } from 'lucide-react';

const IssueTypeIcon = ({ type }) => {
  switch (type) {
    case 'BUG': return <BugIcon size={14} className="text-red-400" />;
    case 'TASK': return <CheckSquare size={14} className="text-blue-400" />;
    case 'STORY': return <BookOpen size={14} className="text-green-400" />;
    case 'EPIC': return <BookOpen size={14} className="text-purple-400" />;
    default: return <BugIcon size={14} className="text-brand-primary" />;
  }
};

const PriorityIcon = ({ priority }) => {
  switch (priority) {
    case 'HIGH': return <ChevronUp size={16} className="text-red-500" />;
    case 'MEDIUM': return <Equal size={16} className="text-yellow-500" />;
    case 'LOW': return <ChevronDown size={16} className="text-green-500" />;
    default: return null;
  }
};

export const BacklogPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [sprints, setSprints] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [sprintForm, setSprintForm] = useState({ name: '', goal: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchSprints();
      fetchBugs();
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const fetchSprints = async () => {
    if (!selectedProjectId) return;
    try {
      const { data } = await getSprintsByProject(selectedProjectId);
      setSprints(data);
    } catch (error) {
      console.error('Failed to fetch sprints', error);
    }
  };

  const fetchBugs = async () => {
    try {
      const { data } = await api.get('/api/bugs');
      // In a real app, we'd filter by project on the backend
      const projectBugs = data.filter(b => b.project?.id?.toString() === selectedProjectId);
      setBugs(projectBugs);
    } catch (error) {
      console.error('Failed to fetch bugs', error);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      await createSprint(selectedProjectId, sprintForm);
      setSprintForm({ name: '', goal: '' });
      setIsCreatingSprint(false);
      fetchSprints();
    } catch (error) {
      console.error('Failed to create sprint', error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const bugId = draggableId.replace('bug-', '');
    const sprintId = destination.droppableId.replace('sprint-', '');

    // Optimistic UI update
    const updatedBugs = bugs.map(bug => {
      if (bug.id.toString() === bugId) {
        const targetSprint = sprintId === 'backlog' ? null : sprints.find(s => s.id.toString() === sprintId);
        return { ...bug, sprint: targetSprint };
      }
      return bug;
    });
    setBugs(updatedBugs);

    // Call API (only if moving to a sprint, moving to backlog might need a different API)
    if (sprintId !== 'backlog') {
      try {
        await assignBugToSprint(sprintId, bugId);
      } catch (error) {
        console.error('Failed to assign bug to sprint', error);
        fetchBugs(); // revert
      }
    }
  };

  const getBugsForSprint = (sprintId) => {
    if (sprintId === 'backlog') {
      return bugs.filter(b => !b.sprint);
    }
    return bugs.filter(b => b.sprint?.id?.toString() === sprintId);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Backlog</h1>
          <p className="text-text-secondary mt-1">Plan your sprints and prioritize work.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-brand-primary"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => setIsCreatingSprint(true)}>
            Create Sprint
          </Button>
        </div>
      </div>

      {isCreatingSprint && (
        <Card className="mb-6 p-4 border border-brand-primary/30 shrink-0">
          <form onSubmit={handleCreateSprint} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-text-muted mb-1">Sprint Name</label>
              <input 
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-brand-primary"
                value={sprintForm.name}
                onChange={e => setSprintForm({...sprintForm, name: e.target.value})}
                placeholder="Sprint 1"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-text-muted mb-1">Sprint Goal</label>
              <input 
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-brand-primary"
                value={sprintForm.goal}
                onChange={e => setSprintForm({...sprintForm, goal: e.target.value})}
                placeholder="Launch MVP"
              />
            </div>
            <Button type="button" variant="ghost" onClick={() => setIsCreatingSprint(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </form>
        </Card>
      )}

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20">
        <DragDropContext onDragEnd={onDragEnd}>
          
          {/* Active / Planned Sprints */}
          {sprints.map(sprint => (
            <div key={sprint.id} className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
              <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{sprint.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary font-medium">
                    {sprint.status}
                  </span>
                  {sprint.goal && <span className="text-sm text-text-muted ml-2">- {sprint.goal}</span>}
                </div>
              </div>
              <Droppable droppableId={`sprint-${sprint.id}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[80px] p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                  >
                    {getBugsForSprint(sprint.id.toString()).length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-16 flex items-center justify-center text-sm text-text-muted border border-dashed border-white/10 rounded-xl m-2">
                        Plan a sprint by dragging issues here
                      </div>
                    )}
                    {getBugsForSprint(sprint.id.toString()).map((bug, index) => (
                      <Draggable key={`bug-${bug.id}`} draggableId={`bug-${bug.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 m-2 bg-bg-base/80 border border-white/10 rounded-xl flex items-center justify-between group ${snapshot.isDragging ? 'shadow-xl shadow-brand-primary/20 ring-1 ring-brand-primary' : 'hover:bg-white/5'}`}
                          >
                            <div className="flex items-center gap-3">
                              <IssueTypeIcon type={bug.issueType} />
                              <span className="text-sm font-medium text-white group-hover:text-brand-primary transition-colors cursor-pointer">{bug.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-text-muted font-mono">{bug.project?.key}-{bug.id}</span>
                              <PriorityIcon priority={bug.priority} />
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white" title={bug.assignee?.name || 'Unassigned'}>
                                {bug.assignee ? bug.assignee.name.substring(0, 1) : '?'}
                              </div>
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
          ))}

          {/* Backlog */}
          <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden mt-8">
            <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FolderKanban size={18} className="text-text-muted" />
                <span className="font-semibold text-white">Backlog</span>
                <span className="text-sm text-text-muted ml-2">({getBugsForSprint('backlog').length} issues)</span>
              </div>
            </div>
            <Droppable droppableId="sprint-backlog">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[150px] p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                >
                  {getBugsForSprint('backlog').length === 0 && !snapshot.isDraggingOver && (
                    <div className="p-8 text-center text-text-muted">
                      Your backlog is empty.
                    </div>
                  )}
                  {getBugsForSprint('backlog').map((bug, index) => (
                    <Draggable key={`bug-${bug.id}`} draggableId={`bug-${bug.id}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 m-2 bg-bg-base/80 border border-white/10 rounded-xl flex items-center justify-between group ${snapshot.isDragging ? 'shadow-xl shadow-brand-primary/20 ring-1 ring-brand-primary' : 'hover:bg-white/5'}`}
                        >
                          <div className="flex items-center gap-3">
                            <IssueTypeIcon type={bug.issueType} />
                            <span className="text-sm font-medium text-white group-hover:text-brand-primary transition-colors cursor-pointer">{bug.title}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-text-muted font-mono">{bug.project?.key}-{bug.id}</span>
                            <PriorityIcon priority={bug.priority} />
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white" title={bug.assignee?.name || 'Unassigned'}>
                              {bug.assignee ? bug.assignee.name.substring(0, 1) : '?'}
                            </div>
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

        </DragDropContext>
      </div>
    </div>
  );
};
