import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error(t('login.fillAllFields'));
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.data);
      toast.success(t('login.welcomeMsg'));
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast.success(t('login.googleSuccess'));
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || t('login.googleFailed'));
      }
    } catch (error) {
      toast.error(t('login.unexpectedError'));
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
        <Card className="border border-stone-200/70 dark:border-stone-800 shadow-2xl overflow-hidden rounded-3xl bg-card text-card-foreground">
          <CardHeader className="bg-surface/50 dark:bg-stone-900/60 pt-10 pb-8 text-center space-y-1.5 border-b border-border/40 dark:border-stone-800">
            <h1 className="text-3xl font-serif font-black text-dark dark:text-stone-100">{t('login.welcomeBack')}</h1>
            <p className="text-muted-foreground dark:text-stone-400 text-xs uppercase tracking-widest font-black">{t('login.signInAccount')}</p>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-stone-300">{t('login.emailAddress')}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-stone-400" size={16} />
                  <Input 
                    type="email" 
                    placeholder={t('login.emailPlaceholder')} 
                    className="pl-10 h-12 rounded-2xl border-stone-200 dark:border-stone-700 bg-surface/30 dark:bg-stone-900 text-dark dark:text-stone-100 placeholder:text-stone-400 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-stone-300">{t('login.password')}</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-stone-400" size={16} />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 rounded-2xl border-stone-200 dark:border-stone-700 bg-surface/30 dark:bg-stone-900 text-dark dark:text-stone-100 placeholder:text-stone-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary h-12 rounded-2xl text-sm font-black shadow-md cursor-pointer"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <>{t('login.signIn')} <ArrowRight className="ml-2" size={16} /></>
                )}
              </Button>
            </form>

            <div className="relative py-2">
              <Separator className="bg-border/40 dark:bg-stone-800" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-[11px] font-black text-muted-foreground dark:text-stone-400 uppercase tracking-widest">{t('login.or')}</span>
            </div>

            <Button 
              type="button" 
              variant="outline"
              className="w-full h-12 rounded-2xl text-xs font-bold uppercase tracking-wider border-stone-200 dark:border-stone-700 hover:bg-surface dark:hover:bg-stone-800 text-dark dark:text-stone-100 transition-all gap-2.5 cursor-pointer shadow-xs"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <><FaGoogle className="text-red-500 text-base" /> {t('login.continueGoogle')}</>
              )}
            </Button>
          </CardContent>

          <CardFooter className="bg-surface/30 dark:bg-stone-900/40 p-6 text-center border-t border-border/40 dark:border-stone-800">
            <p className="text-xs text-muted-foreground dark:text-stone-400 w-full font-medium">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="font-bold text-primary dark:text-amber-300 hover:underline transition-all">
                {t('login.createAccount')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
