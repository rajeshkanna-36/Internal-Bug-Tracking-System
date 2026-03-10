import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bug, LogOut, Search, Plus, Bell, HelpCircle, ChevronDown, User } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils/cn';
import { CreateBugModal } from './CreateBugModal';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user, logout } = useAuth();
    const initials = user?.username?.substring(0, 2).toUpperCase() || 'U';
    const profileRef = useRef<HTMLDivElement>(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans bg-bg-base text-text-primary">
            {/* Top Navigation Bar - Glassmorphism */}
            <header className="h-16 glass-panel flex items-center justify-between px-6 shrink-0 z-30 relative border-b-0 border-white/10">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all">
                            BT
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">Nexus</span>
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-2 font-medium text-sm">
                        <Link to="/dashboard" className={cn("px-4 py-2 rounded-lg transition-all", location.pathname === '/dashboard' ? "bg-white/10 text-white" : "text-text-secondary hover:text-white hover:bg-white/5")}>Dashboards</Link>
                        <Link to="/bugs" className={cn("px-4 py-2 rounded-lg transition-all", location.pathname === '/bugs' ? "bg-white/10 text-white" : "text-text-secondary hover:text-white hover:bg-white/5")}>Your Work</Link>

                        <Button
                            variant="primary"
                            size="sm"
                            className="ml-4 gap-2 px-4 shadow-[0_0_10px_rgba(139,92,246,0.4)] hover:shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={16} /> Create Issue
                        </Button>
                    </nav>
                </div>

                {/* Right Side Icons & Profile */}
                <div className="flex items-center gap-4">
                    {/* Global Search */}
                    <div className="relative hidden lg:block">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search bugs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 h-9 pl-9 pr-4 rounded-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm transition-all text-white placeholder-text-muted"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-mono bg-white/10 px-1.5 py-0.5 rounded cursor-pointer">/</div>
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

                    <button className="p-2 rounded-full text-text-secondary hover:bg-white/10 transition-colors relative">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-secondary shadow-[0_0_5px_rgba(236,72,153,0.8)]"></span>
                    </button>

                    <button className="p-2 rounded-full text-text-secondary hover:bg-white/10 transition-colors">
                        <HelpCircle size={18} />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative ml-2" ref={profileRef}>
                        <button
                            className="flex items-center gap-2 focus:outline-none group"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 to-brand-secondary text-white flex items-center justify-center font-bold text-sm border-2 border-transparent group-hover:border-white/20 transition-all shadow-md">
                                {initials}
                            </div>
                            <ChevronDown size={14} className="text-text-muted group-hover:text-white transition-colors" />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-56 glass-panel rounded-xl py-2 z-50 border border-white/10 shadow-2xl origin-top-right animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-3 border-b border-white/10 mb-2">
                                    <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <p className="text-xs text-text-muted capitalize">{user?.role?.toLowerCase()}</p>
                                    </div>
                                </div>
                                <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                    <User size={16} /> Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 mt-1"
                                >
                                    <LogOut size={16} /> Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Slim Ultra-Modern Sidebar */}
                <aside className="w-[240px] glass-panel border-r border-y-0 border-l-0 border-white/10 flex flex-col shrink-0 z-20">
                    <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/80 to-purple-500/80 shrink-0 shadow-inner flex items-center justify-center flex-col gap-0.5 border border-white/10">
                            <div className="w-4 h-1 bg-white/80 rounded-full"></div>
                            <div className="w-4 h-1 bg-white/80 rounded-full"></div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-sm text-white truncate">Project Nexus</span>
                            <span className="text-[11px] text-brand-accent tracking-wider font-mono truncate uppercase mt-0.5">Active Sprint</span>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
                        <Link
                            to="/dashboard"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group relative overflow-hidden",
                                location.pathname === '/dashboard' ? "text-white" : "text-text-secondary hover:text-white hover:bg-white/5"
                            )}
                        >
                            {location.pathname === '/dashboard' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-transparent -z-10"></div>
                            )}
                            {location.pathname === '/dashboard' && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-primary rounded-r-md shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                            )}
                            <LayoutDashboard size={18} className={location.pathname === '/dashboard' ? "text-brand-primary" : "text-text-muted group-hover:text-text-secondary transition-colors"} />
                            <span>Board</span>
                        </Link>

                        <div className="my-5 flex items-center gap-2 px-3">
                            <div className="h-px bg-white/5 flex-1"></div>
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">Focus</div>
                            <div className="h-px bg-white/5 flex-1"></div>
                        </div>

                        <Link
                            to="/bugs"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group relative overflow-hidden",
                                location.pathname === '/bugs' ? "text-white" : "text-text-secondary hover:text-white hover:bg-white/5"
                            )}
                        >
                            {location.pathname === '/bugs' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary/20 to-transparent -z-10"></div>
                            )}
                            {location.pathname === '/bugs' && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-secondary rounded-r-md shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
                            )}
                            <Bug size={18} className={location.pathname === '/bugs' ? "text-brand-secondary" : "text-text-muted group-hover:text-text-secondary transition-colors"} />
                            <span>My Assigned</span>
                            <span className="ml-auto bg-white/10 text-xs py-0.5 px-2 rounded-full text-text-secondary">3</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10">
                    <Outlet context={{ searchTerm }} />
                </main>
            </div>

            <CreateBugModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
};
