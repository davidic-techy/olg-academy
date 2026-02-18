import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { 
  User, Mail, Lock, Eye, EyeOff, 
  ArrowRight, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  // 🧠 INTELLIGENT REDIRECT: Where should they go after signing up?
  const from = location.state?.from?.pathname || "/dashboard";

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Handle Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Client-Side Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // 2. API Call
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // 3. Smart Redirect (Back to Course or Dashboard)
      navigate(from, { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-olg-green selection:text-olg-blue">
      
      {/* 🟦 LEFT SIDE: Brand Experience (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-olg-blue relative overflow-hidden flex-col justify-between p-16 text-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center font-bold text-lg">ol.</div>
          <span className="font-bold tracking-tight text-xl">Academy</span>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-olg-green text-xs font-bold mb-8 backdrop-blur-sm">
            <CheckCircle size={14} /> Join 1,200+ Scholars
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6 tracking-tight">
            Start your journey from <br/> Research to <span className="text-olg-green">Impact</span>.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed font-medium">
            "The OLG Nova Academy gave me the exact technical skills I needed to transition from the lab bench to industry leadership."
          </p>
          
          {/* Social Proof Avatars */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-olg-blue bg-cover shadow-md" style={{backgroundImage: `url(https://i.pravatar.cc/100?img=${i+10})`}}></div>
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-sm">Community Verified</p>
              <div className="flex text-olg-green text-xs">
                 ★★★★★
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-blue-200 opacity-60 font-medium">
          © {new Date().getFullYear()} OLG Nova. All rights reserved.
        </div>
      </div>

      {/* ⬜ RIGHT SIDE: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create your account</h2>
            <p className="mt-2 text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-olg-blue hover:text-olg-dark hover:underline transition-all">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-bold leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-olg-blue transition-colors">
                  <User size={18} />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Itunuoluwa Olamide"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 placeholder-slate-400 focus:ring-4 focus:ring-olg-blue/5 focus:border-olg-blue transition-all outline-none"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-olg-blue transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="scholar@olgnova.org"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 placeholder-slate-400 focus:ring-4 focus:ring-olg-blue/5 focus:border-olg-blue transition-all outline-none"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-olg-blue transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 placeholder-slate-400 focus:ring-4 focus:ring-olg-blue/5 focus:border-olg-blue transition-all outline-none"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-olg-blue cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-olg-blue transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 placeholder-slate-400 focus:ring-4 focus:ring-olg-blue/5 focus:border-olg-blue transition-all outline-none"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input 
                id="terms" 
                type="checkbox" 
                required
                className="w-5 h-5 text-olg-blue border-slate-300 rounded focus:ring-olg-blue cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-slate-500 font-medium cursor-pointer leading-tight">
                I agree to the <span className="text-olg-blue font-bold hover:underline">Terms of Service</span> and <span className="text-olg-blue font-bold hover:underline">Privacy Policy</span>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-olg-blue text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-olg-dark transition-all transform hover:-translate-y-1 shadow-xl shadow-olg-blue/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
              ) : (
                <>Get Started <ArrowRight size={18} /></>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;