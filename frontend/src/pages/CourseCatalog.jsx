import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Clock, MoveRight, Star, 
  BarChart, Database, Cpu, TrendingUp, Loader2, AlertCircle, Play, CheckCircle 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';

const CourseCatalog = () => {
  const { user } = useAuth();
  
  // Data State
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Data with strict brand-aligned error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, enrollmentsRes] = await Promise.all([
          api.get('/courses'),
          user ? api.get("/enrollments/my-courses") : Promise.resolve({ data: { data: [] } })
        ]);

        setCourses(coursesRes.data.data || []);
        
        if (enrollmentsRes.data.data) {
            const myIds = enrollmentsRes.data.data.map(e => e.course._id);
            setEnrolledCourseIds(myIds);
        }
      } catch (err) {
        console.error("Institutional Data Sync Failure:", err);
        setError("Unable to synchronize with the institutional repository. Please verify your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 2. Specialized Filtering Logic
  const filteredCourses = courses.filter(course => {
    const matchesTab = activeTab === 'All' 
      ? true 
      : activeTab === 'Basic' 
        ? ['Beginner', 'Intermediate'].includes(course.level)
        : ['Advanced', 'Expert'].includes(course.level);

    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getCourseIcon = (category) => {
    if (category?.includes('AI')) return <Cpu className="text-white" size={24} />;
    if (category?.includes('Data')) return <Database className="text-white" size={24} />;
    return <BarChart className="text-white" size={24} />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#457B9D] selection:text-white">
      <Navbar />

      {/* --- ELITE BRANDED HERO SECTION --- */}
      <div className="relative bg-white pt-16 pb-24 overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#457B9D]/5 blur-[100px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
                Institutional <br/> 
                <span className="text-[#457B9D] relative inline-block">
                  Research Tracks
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#A8D5BA]/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                  </svg>
                </span>
              </h1>
              <p className="text-slate-600 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
                Access specialized curriculum designed to transform complex data into undeniable research impact.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 flex gap-2 w-full max-w-md group focus-within:border-[#457B9D] transition-colors relative z-30">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#457B9D] transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search curriculum..." 
                      className="w-full pl-12 pr-4 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-lg font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* START LEARNING LOGIC */}
                <Link 
                  to={user ? "/courses" : "/register"}
                  className="w-full sm:w-auto px-8 py-5 bg-[#457B9D] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#345d77] transition-all shadow-lg text-center"
                >
                  Start Learning
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block h-[400px]">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale-[0.3]" alt="OLG Nova Research" />
                </div>
                <div className="absolute top-10 left-0 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/40 flex items-center gap-4 z-20">
                  <div className="w-12 h-12 rounded-full bg-[#A8D5BA]/20 flex items-center justify-center text-[#457B9D]"><TrendingUp size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Impact Velocity</p>
                    <p className="text-lg font-black text-slate-800 tracking-tight">+400% Optimization</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TRACK SELECTOR --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 flex justify-center lg:justify-start">
        <div className="bg-white rounded-2xl shadow-lg p-1.5 inline-flex gap-1 border border-slate-100">
          {['All', 'Basic', 'Advanced'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-[#457B9D] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-[#457B9D]'}`}
            >
              {tab} Track
            </button>
          ))}
        </div>
      </div>

      {/* --- REPOSITORY GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-16 min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <Loader2 className="animate-spin mb-4 text-[#457B9D]" size={40} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Synchronizing Repository...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-red-50 rounded-3xl p-10 border border-red-100">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-bold text-center">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course._id);

              return (
                <div key={course._id} className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col h-full relative">
                  
                  {/* Image Asset Section */}
                  <div className="h-60 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                    <img 
                      src={course.image || 'https://placehold.co/600x400/457B9D/FFF?text=Nova+Trajectory'} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {isEnrolled && (
                        <div className="absolute top-6 right-6 z-20 bg-[#A8D5BA] text-slate-900 text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                            <CheckCircle size={10} strokeWidth={3} /> Verified Access
                        </div>
                    )}

                    <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                      <div className="p-2 rounded-xl backdrop-blur-md border border-white/20 bg-white/10 text-white">
                        {getCourseIcon(course.category)}
                      </div>
                      <div>
                        <span className="text-white/70 text-[9px] font-black uppercase tracking-[0.2em] block">{course.level || 'Standard'}</span>
                        <span className="text-white font-bold text-lg leading-tight">{course.category || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Curated Content Section */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-black text-slate-800 mb-3 line-clamp-1 uppercase tracking-tight">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 font-medium">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-8 mt-auto">
                      <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg border border-slate-100 flex items-center gap-1.5 uppercase tracking-widest">
                        <Clock size={12} /> {course.duration || 'Self-paced'}
                      </span>
                      <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg border border-slate-100 flex items-center gap-1.5 uppercase tracking-widest">
                        <Star size={12} className="text-yellow-500" /> Professional 
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-[0.3em] mb-0.5">Investment</span>
                        <span className={`text-2xl font-black ${isEnrolled ? 'text-[#457B9D]' : 'text-slate-900'}`}>
                          {isEnrolled ? 'ACTIVATED' : (course.price === 0 ? 'FREE' : `₦${course.price.toLocaleString()}`)}
                        </span>
                      </div>

                      {/* --- INTELLIGENT ROUTING LINKS --- */}
                      {isEnrolled ? (
                        <Link 
                            to={`/classroom/${course._id}`}
                            className="px-6 py-3 bg-[#A8D5BA]/20 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#A8D5BA] transition-all flex items-center gap-2 border border-[#A8D5BA]/30"
                        >
                            <Play size={12} fill="currentColor" /> Resume
                        </Link>
                      ) : (
                        <Link 
                            to={`/course/${course._id}`}
                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#457B9D] hover:shadow-xl transition-all flex items-center gap-2 active:scale-95"
                        >
                            Details <MoveRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-slate-100 py-16 text-center">
        <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.5em]">
          OLG Nova Academy &bull; Shaping Research Excellence &bull; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default CourseCatalog;