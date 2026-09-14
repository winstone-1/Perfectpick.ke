import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Package,
  Heart,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Camera,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

const Profile = () => {
  const { user, login, logout } = useAuth();
  const avatarInputRef = useRef(null);

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  // Keep derived state in sync when AuthContext refreshes user (e.g. after admin promotion or avatar sync)
  React.useEffect(() => {
    setAvatarPreview(user?.avatar || null);
    if (user?.name || user?.email) {
      setPersonalInfo({ name: user.name || '', email: user.email || '' });
    }
  }, [user?.avatar, user?.name, user?.email]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.put('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      login({ ...user, avatar: data.data.avatar });
      setAvatarPreview(data.data.avatar);
      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to upload image');
      setAvatarPreview(user?.avatar || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    setUpdatingInfo(true);
    try {
      const { data } = await api.put('/auth/profile', { name: personalInfo.name });
      const updated = data.data || data;
      // Preserve existing token/avatar if backend omits them; normalize via login()
      login({ ...user, ...updated, token: updated.token || user?.token });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingInfo(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setUpdatingPassword(true);
    try {
      await api.put('/auth/profile', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center md:text-left pb-4 border-b border-border/40 dark:border-stone-800">
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-dark dark:text-stone-100">My Account</h1>
          <p className="text-xs text-muted-foreground dark:text-stone-400 uppercase font-black tracking-widest mt-1">
            Manage your personal profile, security, and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl bg-card text-card-foreground overflow-hidden">
              <CardContent className="p-6 text-center space-y-5">
                {/* Avatar */}
                <div className="relative inline-block">
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 shadow-md mx-auto bg-surface dark:bg-stone-800 flex items-center justify-center group">
                    {avatarPreview ? (
                      <motion.img
                        key={avatarPreview}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                        src={avatarPreview}
                        alt={user?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <User size={40} className="text-primary dark:text-primary-light" />
                    )}
                  </motion.div>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />

                  <button
                    onClick={() => avatarInputRef.current.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white dark:text-stone-950 rounded-full border-2 border-card hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm"
                    aria-label="Upload profile photo"
                  >
                    {uploadingAvatar
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Camera size={14} />
                    }
                  </button>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-serif font-black text-dark dark:text-stone-100">{user?.name}</h2>
                  <p className="text-xs text-muted-foreground dark:text-stone-400 font-mono truncate">{user?.email}</p>
                    {(user?.isAdmin || user?.role === 'admin' || user?.role === 'manager') && (
                    <Badge className="bg-primary/10 text-primary-deep dark:bg-primary/20 dark:text-primary-light border-none uppercase tracking-widest text-[9px] font-black mt-1">
                      {user?.role || 'admin'}
                    </Badge>
                  )}
                </div>

                <Separator className="bg-border/40 dark:bg-stone-800" />

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary-deep dark:text-primary-light font-bold text-xs">
                    <div className="flex items-center gap-3">
                      <User size={16} />
                      <span>Personal Information</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <Link to="/orders" className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface dark:hover:bg-stone-800 text-medium dark:text-stone-300 hover:text-dark dark:hover:text-stone-100 transition-colors group text-xs font-bold">
                    <div className="flex items-center gap-3">
                      <Package size={16} />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/wishlist" className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface dark:hover:bg-stone-800 text-medium dark:text-stone-300 hover:text-dark dark:hover:text-stone-100 transition-colors group text-xs font-bold">
                    <div className="flex items-center gap-3">
                      <Heart size={16} />
                      <span>My Wishlist</span>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-xs font-bold cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <div className="bg-stone-900 dark:bg-stone-950 rounded-3xl p-6 text-stone-100 space-y-3 border border-stone-800 shadow-xl">
              <div className="flex items-center gap-2 text-primary-light">
                <ShieldCheck size={18} />
                <h3 className="font-serif font-bold text-sm text-stone-100">Encrypted & Secure</h3>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Your account credentials and saved data are protected with 256-bit encryption.
              </p>
            </div>
          </div>

          {/* Form Cards */}
          <div className="flex-1 space-y-8">
            {/* Personal Info */}
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl bg-card text-card-foreground overflow-hidden">
              <div className="bg-surface/50 dark:bg-stone-900/60 px-6 sm:px-8 py-4 border-b border-border/40 dark:border-stone-800">
                <h3 className="font-serif font-bold text-base text-dark dark:text-stone-100">Personal Information</h3>
              </div>
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleInfoUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-stone-300">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-stone-400" size={16} />
                        <Input
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                          className="h-12 pl-10 rounded-2xl border-stone-200 dark:border-stone-700 bg-surface/30 dark:bg-stone-900 text-dark dark:text-stone-100 font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-stone-300">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-stone-400" size={16} />
                        <Input
                          value={personalInfo.email}
                          disabled
                          className="h-12 pl-10 rounded-2xl bg-stone-100 dark:bg-stone-900/60 text-muted-foreground dark:text-stone-400 cursor-not-allowed border-stone-200 dark:border-stone-800 font-medium"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground dark:text-stone-400 italic">Email address cannot be modified for security.</p>
                    </div>
                  </div>
                  <Button type="submit" className="btn-primary rounded-2xl h-12 px-8 font-bold cursor-pointer" disabled={updatingInfo}>
                    {updatingInfo ? <Loader2 className="animate-spin" /> : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="border border-stone-200/70 dark:border-stone-800 shadow-[0_4px_20px_rgba(61,39,26,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-3xl bg-card text-card-foreground overflow-hidden">
              <div className="bg-surface/50 dark:bg-stone-900/60 px-6 sm:px-8 py-4 border-b border-border/40 dark:border-stone-800">
                <h3 className="font-serif font-bold text-base text-dark dark:text-stone-100">Update Password</h3>
              </div>
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-stone-300">Current Password</label>
                    <div className="relative max-w-md">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-stone-400" size={16} />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 pl-10 rounded-2xl border-stone-200 dark:border-stone-700 bg-surface/30 dark:bg-stone-900 text-dark dark:text-stone-100"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-stone-300">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-stone-400" size={16} />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-12 pl-10 rounded-2xl border-stone-200 dark:border-stone-700 bg-surface/30 dark:bg-stone-900 text-dark dark:text-stone-100"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-stone-300">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-stone-400" size={16} />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-12 pl-10 rounded-2xl border-stone-200 dark:border-stone-700 bg-surface/30 dark:bg-stone-900 text-dark dark:text-stone-100"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="btn-primary rounded-2xl h-12 px-8 font-bold cursor-pointer" disabled={updatingPassword}>
                    {updatingPassword ? <Loader2 className="animate-spin" /> : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;