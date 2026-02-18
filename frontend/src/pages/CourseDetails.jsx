import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Play, CheckCircle, Clock, BookOpen, Users, Star, 
  ArrowRight, Loader2, Lock, ShieldCheck, Award, Globe,
  Zap, BarChart
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

const CourseDetails = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Specific Course Details
        const { data: courseRes } = await api.get(`/courses/${courseId}`);
        setCourse(courseRes.data);

        // 2. Check Enrollment Status if logged in
        if (user) {
          const { data: enrollRes } = await api.get("/enrollments/my-courses");
          const found = enrollRes.data.find(e => e.course._id === courseId);
          setIsEnrolled(!!found);
        }
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#457B9D]" size={40} />
    </div>
  );

  if (!course) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-3xl font-black text-slate-800">Course Not Found</h2>
      <Link to="/courses" className="px-8 py-3 bg-[#457B9D] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#345d77] transition-all">
        Return to Catalog
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-[#457B9D] selection:text-white">
      <Navbar />

      {/* --- HERO SECTION: ELITE & BRANDED --- */}
      <header className="bg-[#457B9D] text-white pt-28 pb-32 relative overflow-hidden">
        {/* Abstract Brand Decor */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-white/5 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#A8D5BA]/20 blur-[100px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-10"></div>
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="bg-white/10 text-white border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                {course.category || "Specialized Track"}
              </span>
              {isEnrolled && (
                <span className="bg-[#A8D5BA] text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#A8D5BA]/20">
                  <CheckCircle size={14} /> Enrolled
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-light mb-8 leading-[1.1] tracking-tight">
              {course.title}
            </h1>
            
            <p className="text-lg md:text-xl text-blue-50/80 mb-12 max-w-3xl leading-relaxed font-medium">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-8 text-xs font-bold text-blue-100/70 uppercase tracking-widest mb-12">
              <div className="flex items-center gap-2"><Clock size={16} className="text-[#A8D5BA]"/> {course.duration || "Self-paced"}</div>
              <div className="flex items-center gap-2"><BookOpen size={16} className="text-[#A8D5BA]"/> {course.modules?.length || 0} Modules</div>
              <div className="flex items-center gap-2"><Users size={16} className="text-[#A8D5BA]"/> {course.studentsCount || 0} enrolled</div>
              <div className="flex items-center gap-2"><Globe size={16} className="text-[#A8D5BA]"/> English</div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <section className="py-24 container mx-auto px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Side: Details & Curriculum */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Learning Outcomes */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-sm font-black text-slate-400 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#457B9D]" /> Learning Outcomes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(course.learningOutcomes || ["Data Visualization Mastery", "Advanced Research Methods", "Statistical Reporting", "Impact Analysis"]).map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="mt-0.5 p-1 bg-[#A8D5BA]/20 rounded-full text-[#457B9D] group-hover:bg-[#457B9D] group-hover:text-white transition-colors"><CheckCircle size={14} strokeWidth={3} /></div>
                    <p className="text-slate-700 font-bold text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CURRICULUM SECTION */}
            <div>
                <h3 className="text-sm font-black text-slate-400 mb-8 uppercase tracking-[0.3em] flex items-center gap-3 ml-4">
                    <BarChart size={20} className="text-[#457B9D]" /> Program Syllabus
                </h3>
                <div className="space-y-6">
                {course.modules?.map((module, i) => (
                    <div key={module._id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:border-[#457B9D] transition-colors group shadow-sm">
                    <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div>
                        <span className="text-[10px] font-black text-[#457B9D] uppercase tracking-[0.2em] block mb-2">Module 0{i+1}</span>
                        <h4 className="text-lg font-bold text-slate-900">{module.title}</h4>
                        </div>
                        <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-slate-100">
                        {module.lessons?.length || 0} UNITS
                        </span>
                    </div>
                    <div className="p-6 md:p-8 space-y-4">
                        {module.lessons?.map((lesson, j) => (
                        <div key={lesson._id} className="flex items-center justify-between group/lesson py-2 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${isEnrolled ? 'bg-[#A8D5BA]/20 text-slate-800' : 'bg-slate-100 text-slate-400'}`}>
                                {isEnrolled ? <Play size={12} fill="currentColor" /> : <Lock size={12} />}
                            </div>
                            <span className={`text-sm font-bold ${isEnrolled ? 'text-slate-700' : 'text-slate-500'}`}>
                                {lesson.title}
                            </span>
                            </div>
                            {isEnrolled && (
                            <Link 
                                to={`/classroom/${course._id}`} 
                                className="text-[9px] font-black text-[#457B9D] uppercase tracking-widest hover:underline opacity-0 group-hover/lesson:opacity-100 transition-opacity"
                            >
                                Play Video
                            </Link>
                            )}
                        </div>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            </div>
          </div>

          {/* Right Side: Sticky Pricing & Action */}
          <div className="lg:col-span-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 sticky top-28">
              <div className="text-center mb-10">
                <span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Total Investment</span>
                <div className="text-5xl font-black text-slate-900 mt-4 flex justify-center items-start gap-1">
                  {course.price === 0 ? "FREE" : (
                    <>
                      <span className="text-2xl mt-2 font-bold text-[#457B9D]">₦</span>
                      {course.price?.toLocaleString()}
                    </>
                  )}
                </div>
              </div>
              
              {isEnrolled ? (
                <div className="bg-[#A8D5BA]/10 border border-[#A8D5BA]/20 rounded-[2rem] p-6 text-center mb-8">
                  <p className="text-slate-800 font-bold text-xs mb-4 flex items-center justify-center gap-2 uppercase tracking-wide">
                    <CheckCircle size={16} className="text-[#457B9D]" /> Access Granted
                  </p>
                  <Link 
                    to={`/classroom/${course._id}`} 
                    className="flex w-full py-4 bg-[#457B9D] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#345d77] transition-all shadow-lg shadow-blue-900/20 items-center justify-center gap-3"
                  >
                    Enter Classroom <ArrowRight size={16}/>
                  </Link>
                </div>
              ) : (
                <Link 
                  to={`/enroll/${course._id}`} 
                  className="flex w-full py-5 bg-[#457B9D] text-white text-center rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#345d77] transition-all shadow-xl shadow-blue-900/20 mb-8 items-center justify-center gap-2 group"
                >
                  Secure Access <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
              )}

              <div className="space-y-5 border-t border-slate-50 pt-8">
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Award className="text-[#457B9D]" size={18}/> Professional Certificate
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Clock className="text-[#457B9D]" size={18}/> Lifetime Portal Access
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Zap className="text-[#457B9D]" size={18}/> Premium Support
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                 <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                    OLG Nova Academy <br/> Global Standard Verification
                 </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 py-16 text-center mt-20">
        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em]">
          Empowering The Next Generation of Researchers
        </p>
      </footer>
    </div>
  );
};

export default CourseDetails;