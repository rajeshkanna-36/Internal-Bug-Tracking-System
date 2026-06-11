import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Layout } from '../components/Layout';
import { BarChart, Activity, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../utils/cn';

const statusColors = {
  'OPEN': 'bg-status-todo',
  'IN_REVIEW': 'bg-status-in-review',
  'TESTING': 'bg-status-testing',
  'CLOSED': 'bg-status-done'
};

const priorityColors = {
  'HIGH': 'bg-priority-high',
  'MEDIUM': 'bg-priority-medium',
  'LOW': 'bg-priority-low'
};

export const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalyticsSummary();
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
            <BarChart className="text-brand-primary" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Reports</h1>
            <p className="text-text-muted text-sm mt-1">System-wide overview of issue tracking metrics</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-sm font-semibold uppercase tracking-wider">Total Issues</span>
                <Activity size={18} />
              </div>
              <span className="text-4xl font-bold text-white">{data?.totalIssues || 0}</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-status-done/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-sm font-semibold uppercase tracking-wider">Completed</span>
                <CheckCircle size={18} />
              </div>
              <span className="text-4xl font-bold text-white">{data?.byStatus?.CLOSED || 0}</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-status-todo/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-sm font-semibold uppercase tracking-wider">Open</span>
                <Clock size={18} />
              </div>
              <span className="text-4xl font-bold text-white">{data?.byStatus?.OPEN || 0}</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Issues by Status</h3>
            <div className="space-y-4">
              {Object.entries(data?.byStatus || {}).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-secondary">{status.replace('_', ' ')}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", statusColors[status] || "bg-brand-primary")} 
                      style={{ width: `${(count / (data?.totalIssues || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Issues by Priority</h3>
            <div className="space-y-4">
              {Object.entries(data?.byPriority || {}).map(([priority, count]) => (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-secondary">{priority}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", priorityColors[priority] || "bg-text-muted")} 
                      style={{ width: `${(count / (data?.totalIssues || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workload */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 md:col-span-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Workload per Assignee</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data?.byAssignee || {}).map(([assignee, count]) => (
                <div key={assignee} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent text-white flex items-center justify-center font-bold shadow-md">
                    {assignee.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{assignee}</p>
                    <p className="text-xs text-text-muted">{count} issues assigned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
