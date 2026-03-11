import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Sparkles, ArrowRight, Lock, User, Mail, ExternalLink } from 'lucide-react';
import { cn } from '../utils/cn';

export const SignupPage = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('DEVELOPER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !username || !password) {
            setError('Please fill out all fields.');
            return;
        }

        setLoading(true);
        try {
            // Register
            await api.post('/api/auth/register', { name, username, password, role });

            // Auto-login after successful registration
            const loginResponse = await api.post('/api/auth/login', { username, password });
            const { token, role: loggedInRole, username: loggedInUser, id, name: loggedInName } = loginResponse.data;

            login(token, { id, username: loggedInUser, name: loggedInName, role: loggedInRole });
            navigate('/dashboard');

        } catch (err: any) {
            // Handle both JSON {message: ...} and plain string error responses
            const data = err.response?.data;
            if (typeof data === 'string') {
                setError(data);
            } else if (data?.message) {
                setError(data.message);
            } else {
                setError('Failed to register account. Username may be taken.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-bg-base">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen -z-10"></div>

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(139,92,246,0.5)] mb-4">
                        BT
                    </div>
                    <div className="flex items-center gap-2 text-brand-accent font-mono text-xs uppercase tracking-widest opacity-80 mb-1">
                        <Sparkles size={14} />
                        <span>Project Nexus</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">Create an account</h1>
                </div>

                {/* Glassmorphic Form Card */}
                <div className="glass-panel p-8 sm:p-10 rounded-3xl w-full border border-white/10 shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                                <span className="mt-0.5 shrink-0 bg-red-500/20 p-1 rounded-full"><Lock size={12} /></span>
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-text-muted outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="Username / Email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-text-muted outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Create password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-text-muted outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm"
                                    required
                                />
                            </div>

                            {/* Role selector */}
                            <div className="relative">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-bg-surface/50 border border-border-subtle rounded-xl px-4 py-3.5 text-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="DEVELOPER">Developer</option>
                                    <option value="TESTER">Tester</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-3.5 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary hover:to-brand-primary text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] disabled:opacity-70 mt-4",
                                loading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {loading ? 'Creating...' : 'Sign up'}
                            {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/10 pt-6 relative z-10">
                        <Link to="/login" className="text-sm font-medium text-brand-accent hover:text-white transition-colors flex items-center justify-center gap-2 group cursor-pointer inline-flex">
                            <span className="text-text-muted group-hover:text-white transition-colors">Already have an account?</span> Log in <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-xs text-text-muted text-center space-x-4">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    );
};
