import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../utils/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { User, Briefcase, Building, FileText, Camera } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    jobTitle: '',
    bio: '',
    avatarUrl: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        department: data.department || '',
        jobTitle: data.jobTitle || '',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="p-8 text-text-muted">Loading profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Profile</h1>
        <p className="text-text-secondary mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Quick Info */}
        <div className="col-span-1 space-y-6">
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name || profile.username} className="w-full h-full object-cover" />
                ) : (
                  (profile.name || profile.username || 'U').substring(0, 2).toUpperCase()
                )}
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{profile.name || profile.username}</h2>
            <p className="text-text-muted font-mono text-sm mt-1">@{profile.username}</p>
            <div className="mt-4 px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider">
              {profile.role}
            </div>
          </Card>
        </div>

        {/* Right Column - Details Form */}
        <div className="col-span-1 md:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Profile Details</h3>
              {!isEditing ? (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profile.name || '',
                      department: profile.department || '',
                      jobTitle: profile.jobTitle || '',
                      bio: profile.bio || '',
                      avatarUrl: profile.avatarUrl || ''
                    });
                  }}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  icon={<User size={18} />}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                />
                <Input
                  label="Avatar URL"
                  icon={<Camera size={18} />}
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                  disabled={!isEditing}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  icon={<Briefcase size={18} />}
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Software Engineer"
                />
                <Input
                  label="Department"
                  icon={<Building size={18} />}
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Engineering"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">Bio</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-text-muted" />
                  <textarea
                    className="w-full min-h-[100px] pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-white placeholder-text-muted/50 disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
