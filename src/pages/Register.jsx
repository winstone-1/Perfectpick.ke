import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      return toast.error('Please fill in all fields');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      login(data.data); // Backend response contains user in 'data' field
      toast.success('Account created successfully! Welcome.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast.success('Account created with Google!');
        navigate('/');
      } else {
        toast.error(result.error || 'Google sign-up failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-[80vh] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-surface pt-10 pb-8 text-center space-y-2">
            <h1 className="text-3xl font-serif font-black text-dark">Create Account</h1>
            <p className="text-muted-foreground text-sm">Join our luxury fashion community</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    name="name"
                    placeholder="John Doe" 
                    className="pl-10 h-11 rounded-xl focus:ring-primary"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    name="email"
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-11 rounded-xl focus:ring-primary"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 rounded-xl focus:ring-primary"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    name="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 rounded-xl focus:ring-primary"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary h-12 rounded-xl text-md"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <>Create Account <ArrowRight className="ml-2" size={18} /></>
                )}
              </Button>
            </form>

            <div className="relative py-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">or</span>
            </div>

            <Button 
              type="button" 
              variant="outline"
              className="w-full h-12 rounded-xl text-md border-border/20 hover:bg-surface transition-all gap-3"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <><FaGoogle className="text-red-500" /> Continue with Google</>
              )}
            </Button>
          </CardContent>

          <CardFooter className="bg-bg/50 p-6 text-center border-t border-border/10">
            <p className="text-sm text-muted-foreground w-full">
              Already have an account? {' '}
              <Link to="/login" className="font-bold text-primary hover:underline transition-all">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
