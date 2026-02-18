import { useState } from 'react';
import { MoveRight, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🧠 INTELLIGENT REDIRECT: 
  // If they tried to visit a protected page (like /enroll/123), send them back there.
  // Otherwise, go to dashboard.
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      // Navigate to where they wanted to go, replacing the login page in history
      navigate(from, { replace: true }); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-10">
          
          {/* Brand Header */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-olg-blue border border-blue-100 rounded-2xl mb-6 shadow-sm hover:scale-105 transition-transform">
              <span className="font-black text-2xl">ol.</span>
            </Link>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2 font-medium">Continue your journey to impact.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 p-4 flex items-start gap-3 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm font-bold text-red-600 leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-olg-blue transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-olg-blue focus:ring-4 focus:ring-olg-blue/5 transition-all"
                  placeholder="student@olg.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <a href="#" className="text-xs font-bold text-olg-blue hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-olg-blue transition-colors" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-olg-blue focus:ring-4 focus:ring-olg-blue/5 transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-olg-blue text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-olg-dark transition-all shadow-xl shadow-olg-blue/20 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>Sign In <MoveRight size={20} /></>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-olg-blue font-bold hover:underline">
              Join for Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;