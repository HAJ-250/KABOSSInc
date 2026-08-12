import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        navigate(decodeURIComponent(redirect));
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-premium-dark via-premium-navy to-premium-dark">
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(43,143,255,0.3) 0%, transparent 50%)` }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
<div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-14 w-14 rounded-2xl overflow-hidden ring-2 ring-kaboss-500/40 shadow-lg shadow-kaboss-500/30">
                <img
                  src="/images/kabossinc%20logo.jpg"
                  alt="KABOSS Inc"
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-400 mt-2">Sign in to your KABOSS account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 bottom-[10px] text-gray-400 hover:text-white"
              >
                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input type="checkbox" className="rounded border-gray-600" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-kaboss-400 hover:text-kaboss-300">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <><LogIn className="mr-2 h-5 w-5" /> Sign In</>
              )}
            </Button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-kaboss-400 hover:text-kaboss-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
