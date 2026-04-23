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
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const Profile = () => {
  const { user, login } = useAuth();
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
    } catch (error) {
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
      login({ ...user, name: data.user.name });
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
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-8 text-center space-y-6">
              {/* Avatar */}
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto bg-surface flex items-center justify-center">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-primary" />
                  )}
                </div>

                {/* Hidden file input */}
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
                  className="absolute bottom-0 right-0 p-2 bg-dark text-white rounded-full border-2 border-white hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar 
                    ? <Loader2 size={16} className="animate-spin" /> 
                    : <Camera size={16} />
                  }
                </button>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-black text-dark">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <Badge className="bg-primary/10 text-primary border-none uppercase tracking-widest text-[10px] font-bold mt-2">
                    {user.role}
                  </Badge>
                )}
              </div>

              <Separator className="bg-border/10" />

              <div className="space-y-2 text-left">
                <Link to="/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors group">
                  <div className="flex items-center gap-3 text-medium font-bold">
                    <Package size={18} />
                    <span>My Orders</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/wishlist" className="flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors group">
                  <div className="flex items-center gap-3 text-medium font-bold">
                    <Heart size={18} />
                    <span>Wishlist</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="bg-dark rounded-[2.5rem] p-8 text-white space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={20} />
              <h3 className="font-serif font-bold text-footer-text">Security Note</h3>
            </div>
            <p className="text-xs text-white/50 leading-relaxed uppercase tracking-wider font-bold">
              Your data is encrypted and secure with Perfect Pick.
            </p>
          </div>
        </div>

        {/* Forms */}
        <div className="flex-1 space-y-8">
          <h1 className="text-4xl font-serif font-black text-dark">My Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
            {/* Personal Info */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <div className="bg-surface px-8 py-5 border-b border-border/10">
                <h3 className="font-serif font-bold text-lg">Personal Information</h3>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handleInfoUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                          className="h-12 pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                          value={personalInfo.email}
                          disabled
                          className="h-12 pl-10 rounded-xl bg-bg/50 text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Email cannot be changed for security.</p>
                    </div>
                  </div>
                  <Button type="submit" className="btn-primary rounded-xl h-12 px-8" disabled={updatingInfo}>
                    {updatingInfo ? <Loader2 className="animate-spin" /> : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <div className="bg-surface px-8 py-5 border-b border-border/10">
                <h3 className="font-serif font-bold text-lg">Update Password</h3>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input 
                        type="password"
                        placeholder="••••••••"
                        className="h-12 pl-10 rounded-xl"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          className="h-12 pl-10 rounded-xl"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          className="h-12 pl-10 rounded-xl"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="btn-primary rounded-xl h-12 px-8" disabled={updatingPassword}>
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