import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Award, Clock, Play, CheckCircle, 
  ChevronRight, Loader2, Zap, BookCheck, ExternalLink, 
  Flame, Sparkles 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to capitalize first letter
  const getFirstName = () => {
    if (!user?.name) return 'Friend';
    const first = user.name.split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/enrollments/my-courses');
        setEnrollments(res.data.data);
      } catch (err) {
        console.error("Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const completedCount = enrollments.filter(e => e.isCompleted).length;
  const inProgressCount = enrollments.filter(e => !e.isCompleted).length;

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#457B9D]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        
        {/* --- HEADER: COMPACT & PERSONAL --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Hey, <span className="text-[#457B9D]">{getFirstName()}</span>
              
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Let's get back to your learning goals.
            </p>
          </div>
          <Link 
            to="/courses" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#457B9D] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#345d77] transition-all shadow-lg active:scale-95"
          >
            Explore Courses <ChevronRight size={16} />
          </Link>
        </div>

        {/* --- STATS: PUNCHY & VISUAL --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                <div className="w-10 h-10 bg-blue-50 text-[#457B9D] rounded-xl flex items-center justify-center shrink-0"><BookOpen size={20} /></div>
                <div>
                    <p className="text-2xl font-black text-slate-900">{enrollments.length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">Enrolled</p>
                </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0"><Flame size={20} fill="currentColor" /></div>
                <div>
                    <p className="text-2xl font-black text-slate-900">{inProgressCount}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">Active</p>
                </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
                <div className="w-10 h-10 bg-emerald-50 text-[#A8D5BA] rounded-xl flex items-center justify-center shrink-0"><Award size={20} /></div>
                <div>
                    <p className="text-2xl font-black text-slate-900">{completedCount}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">Certificates</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- MAIN COLUMN: LEARNING FEED --- */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap size={18} className="text-[#457B9D]" fill="currentColor"/> Continue Learning
            </h3>

            {enrollments.length > 0 ? (
              enrollments.map((e) => (
                <div key={e._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex gap-5 items-center">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 md:w-32 md:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative border border-slate-100">
                        <img src={e.course.thumbnail} className="w-full h-full object-cover" alt="Course" />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all"/>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-slate-900 truncate mb-1">{e.course.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{e.course.category}</span>
                            <span>{Math.round(e.progress)}% Complete</span>
                        </div>
                        
                        {/* Compact Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                            <div className="h-full bg-[#457B9D] rounded-full" style={{ width: `${e.progress}%` }} />
                        </div>
                    </div>

                    {/* Action Button (Desktop) */}
                    <button 
                        onClick={() => navigate(`/classroom/${e.course._id}`)}
                        className="hidden md:flex w-10 h-10 bg-[#457B9D] text-white rounded-full items-center justify-center hover:bg-[#345d77] transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        <Play size={14} fill="currentColor" className="ml-0.5"/>
                    </button>
                  </div>

                  {/* Mobile Action Button */}
                  <button 
                    onClick={() => navigate(`/classroom/${e.course._id}`)}
                    className="md:hidden w-full mt-3 py-3 bg-slate-50 text-[#457B9D] font-bold text-xs rounded-xl border border-slate-200 flex justify-center items-center gap-2"
                  >
                    Resume <Play size={10} fill="currentColor"/>
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-slate-400 font-bold text-sm">You aren't enrolled in any courses yet.</p>
                <Link to="/courses" className="text-[#457B9D] font-bold text-sm hover:underline mt-2 inline-block">Browse the Catalog</Link>
              </div>
            )}
          </div>

          {/* --- SIDEBAR: QUICK ACTIONS --- */}
          <div className="space-y-6">
            
            {/* Certificates Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award size={16} className="text-[#A8D5BA]"/> Your Certificates
                </h3>
                
                {completedCount > 0 ? (
                    <div className="space-y-3">
                        {enrollments.filter(e => e.isCompleted).map(e => (
                            <div key={e._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-[#A8D5BA]/50 transition-colors">
                                <span className="text-xs font-bold text-slate-700 truncate w-32">{e.course.title}</span>
                                <button 
                                    onClick={() => window.open(`${api.defaults.baseURL}/enrollments/${e.course._id}/certificate`, '_blank')}
                                    className="text-[#457B9D] hover:text-[#345d77] p-2 bg-white rounded-lg shadow-sm"
                                >
                                    <BookCheck size={16}/>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                        <Award size={24} className="mx-auto text-slate-300 mb-2"/>
                        <p className="text-xs text-slate-400 font-medium">No certificates yet.</p>
                    </div>
                )}
            </div>

            {/* Help Widget */}
            <div className="bg-[#457B9D] p-6 rounded-2xl text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2"><div className="w-2 h-2 bg-[#A8D5BA] rounded-full animate-pulse"/> Support</h4>
                    <p className="text-xs text-blue-100 mb-4 opacity-90 leading-relaxed">Having trouble with access or codes?</p>
                    <button className="w-full py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold hover:bg-white hover:text-[#457B9D] transition-all flex items-center justify-center gap-2">
                        Contact Support <ExternalLink size={12}/>
                    </button>
                </div>
                {/* Decor */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;