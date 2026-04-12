import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all fields');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user);
      toast.success('Welcome back to Perfect Pick!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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
            <h1 className="text-3xl font-serif font-black text-dark">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">Sign in to access your picks</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-12 rounded-xl focus:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c08050]">Password</label>
                  <Link to="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 rounded-xl focus:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <>Sign In <ArrowRight className="ml-2" size={18} /></>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-bg/50 p-6 text-center border-t border-border/10">
            <p className="text-sm text-muted-foreground w-full">
              Don't have an account? {' '}
              <Link to="/register" className="font-bold text-primary hover:underline transition-all">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
