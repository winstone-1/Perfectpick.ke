import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
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
      login(data.user);
      toast.success('Account created successfully! Welcome.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
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
            <p className="text-muted-foreground text-sm">Join our luxury boutique community</p>
          </CardHeader>
          
          <CardContent className="p-8">
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
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <>Create Account <ArrowRight className="ml-2" size={18} /></>
                )}
              </Button>
            </form>
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
