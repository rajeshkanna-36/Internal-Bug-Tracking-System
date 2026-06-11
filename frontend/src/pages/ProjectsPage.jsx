import { useState, useEffect } from 'react';
import { getProjects, createProject } from '../utils/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { FolderKanban, Plus, Briefcase, FileText, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', key: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProject(formData);
      await fetchProjects();
      setIsCreating(false);
      setFormData({ name: '', key: '', description: '' });
    } catch (error) {
      console.error('Failed to create project', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="text-brand-primary" size={32} />
            Projects
          </h1>
          <p className="text-text-secondary mt-1">Manage all software projects and workspaces.</p>
        </div>
        {user?.role !== 'VIEWER' && (
          <Button variant="primary" className="gap-2" onClick={() => setIsCreating(true)}>
            <Plus size={18} /> New Project
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="mb-8 p-6 bg-white/5 border border-brand-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Project</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Project Name"
                icon={Briefcase}
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="E.g. iOS App Redesign"
              />
              <Input
                label="Project Key (Max 10 chars)"
                icon={Key}
                required
                maxLength={10}
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value.toUpperCase()})}
                placeholder="E.g. IOS"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-secondary">Description</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3 text-text-muted" />
                <textarea
                  className="w-full min-h-[80px] pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-white placeholder-text-muted/50 resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this project about?"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <FolderKanban size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No Projects Found</h3>
            <p className="text-text-secondary">Create your first project to start organizing bugs.</p>
          </div>
        ) : (
          projects.map(project => (
            <Card key={project.id} className="p-6 hover:border-white/20 transition-all hover:-translate-y-1 group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-brand-primary font-bold text-lg group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                  {project.key}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 truncate" title={project.name}>{project.name}</h3>
              <p className="text-text-secondary text-sm line-clamp-2 mb-4 h-10">{project.description || 'No description provided.'}</p>
              
              <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-[10px] font-bold">
                    {project.owner?.name?.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs text-text-muted">Lead: {project.owner?.name}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
