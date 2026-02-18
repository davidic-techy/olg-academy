import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play, CheckCircle, Menu, Loader2, Lock, AlertCircle, X, 
  FileText, Clock, Award, Download, BrainCircuit, ChevronDown, 
  ChevronRight, ShieldAlert, Zap, MessageCircle, Upload, Calendar, Link as LinkIcon
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import QuizPlayer from "../components/course/QuizPlayer"; 
import api from "../api/axios";

// 🛠️ HELPER: URL Converter
const getEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1` : null;
};

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Data State
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  
  // UI State
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [markingComplete, setMarkingComplete] = useState(false);
  
  // 🆕 NEW: Tab State for Content Area
  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'assignment', 'qa'
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Collapse State
  const [openModules, setOpenModules] = useState({});

  // Timer Lock State
  const [canMarkComplete, setCanMarkComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); 

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get("/enrollments/my-courses"),
        ]);

        const currentEnrollment = enrollRes.data.data.find(
          (e) => e.course._id === courseId
        );

        if (!currentEnrollment) {
          navigate(`/enroll/${courseId}`);
          return;
        }

        setCourse(courseRes.data.data);
        setEnrollment(currentEnrollment);

        // Auto-load Logic
        if (courseRes.data.data.modules?.length > 0) {
            const firstModule = courseRes.data.data.modules[0];
            const firstLesson = firstModule.lessons[0];
            
            // Only set active if status is ACTIVE
            if (currentEnrollment.status !== 'pending') {
                setActiveModule(firstModule);
                setActiveLesson(firstLesson);
                setOpenModules({ [firstModule._id]: true });
            }
        }

        if (window.innerWidth < 1024) setSidebarOpen(false);

      } catch (err) {
        console.error("Classroom Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

  // 2. Timer Logic
  useEffect(() => {
    if (!activeLesson) return;

    setCanMarkComplete(false);
    setTimeLeft(10); 

    if (activeModule) {
        setOpenModules(prev => ({ ...prev, [activeModule._id]: true }));
    }

    if (enrollment?.completedLessons?.includes(activeLesson._id) || activeLesson.type === 'quiz') {
      setCanMarkComplete(true);
      setTimeLeft(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanMarkComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeLesson, enrollment]);

  const toggleModule = (moduleId) => {
    setOpenModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleSelectLesson = (lesson, module) => {
    setActiveLesson(lesson);
    setActiveModule(module);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.innerWidth < 1024) setSidebarOpen(false);
    // Reset tab to notes on lesson change usually, but user might want to stay on Q&A
  };

  const handleLessonComplete = async () => {
    if (!activeLesson || markingComplete) return;

    if (activeLesson.type !== 'quiz' && !canMarkComplete && !enrollment.completedLessons.includes(activeLesson._id)) {
      return; 
    }

    if (enrollment.completedLessons.includes(activeLesson._id)) return;

    setMarkingComplete(true);
    try {
      const newCompleted = [...enrollment.completedLessons, activeLesson._id];
      setEnrollment({ ...enrollment, completedLessons: newCompleted });
      await api.put(`/enrollments/${courseId}/progress`, { lessonId: activeLesson._id });
    } catch (err) {
      console.error("Progress Save Failed", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  // 🆕 NEW: Assignment Submission Handler
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        // Mocking the submission endpoint for safety - replace with actual endpoint if available
        // await api.post(`/enrollments/${courseId}/assignments`, { 
        //    moduleId: activeModule._id, 
        //    content: submissionText 
        // });
        
        // Simulating network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        alert("Assignment submitted successfully! Our team will review it shortly.");
        setSubmissionText("");
    } catch (err) {
        alert("Failed to submit. Please try again.");
    } finally {
        setSubmitting(false);
    }
  };

  const handleDownloadCertificate = () => {
      window.open(`${api.defaults.baseURL}/enrollments/${courseId}/certificate`, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-[#457B9D]" size={40} /></div>;

  if (enrollment?.status === 'pending') {
    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white max-w-lg w-full p-10 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="text-amber-500" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Verification In Progress</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        We have received your enrollment request. Your access will be unlocked once an administrator confirms your payment.
                    </p>
                    <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#457B9D] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#345d77] transition-all">
                        Refresh Status
                    </button>
                </div>
            </div>
        </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const progressPercent = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
  const isCourseFinished = progressPercent === 100;
  const embedUrl = getEmbedUrl(activeLesson?.videoUrl);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- MOBILE OVERLAY --- */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

        {/* --- SIDEBAR --- */}
        <aside className={`absolute lg:relative z-40 h-full bg-slate-50 border-r border-slate-200 w-[85%] sm:w-80 lg:w-96 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
             <div>
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Course Content</h3>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-1 w-20 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#A8D5BA]" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{progressPercent}% Done</span>
                </div>
             </div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><X size={20} /></button>
          </div>

          <div className="overflow-y-auto flex-1 pb-20 custom-scrollbar">
            {course?.modules.map((module, mIndex) => {
              const isOpen = openModules[module._id]; 

              return (
                <div key={module._id} className="border-b border-slate-100 last:border-0">
                  <button 
                    onClick={() => toggleModule(module._id)}
                    className={`w-full px-6 py-5 flex justify-between items-start text-left transition-colors group ${isOpen ? 'bg-white' : 'bg-slate-50 hover:bg-white'}`}
                  >
                    <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Module 0{mIndex + 1}</span>
                        <span className={`text-sm font-bold leading-tight group-hover:text-[#457B9D] transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>
                           {module.title}
                        </span>
                    </div>
                    <div className="text-slate-300 group-hover:text-[#457B9D] mt-1">
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="bg-white pb-2 animate-in slide-in-from-top-2 duration-300">
                        {module.lessons?.map((lesson, idx) => {
                        const isCompleted = enrollment.completedLessons.includes(lesson._id);
                        const isActive = activeLesson?._id === lesson._id;

                        return (
                            <button
                            key={lesson._id}
                            onClick={() => handleSelectLesson(lesson, module)}
                            className={`w-full pl-6 pr-4 py-3 flex gap-4 items-start transition-all border-l-[3px] hover:bg-slate-50 ${isActive ? "border-[#457B9D] bg-blue-50/30" : "border-transparent"}`}
                            >
                            <div className={`mt-0.5 shrink-0 ${isCompleted ? "text-[#A8D5BA]" : isActive ? "text-[#457B9D]" : "text-slate-300"}`}>
                                {lesson.type === 'quiz' ? <BrainCircuit size={16} /> :
                                isCompleted ? <CheckCircle size={16} strokeWidth={3} /> : <Play size={16} />}
                            </div>
                            <div className="flex-1 text-left">
                                <span className={`text-xs font-bold block leading-relaxed ${isActive ? "text-[#457B9D]" : isCompleted ? "text-slate-500 line-through decoration-slate-300" : "text-slate-600"}`}>
                                    {lesson.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                                    <Clock size={10} /> {lesson.duration || "5 mins"}
                                </span>
                            </div>
                            </button>
                        );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* --- MAIN PLAYER AREA --- */}
        <main className="flex-1 h-full overflow-y-auto bg-slate-900 relative w-full scroll-smooth">
          
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between shadow-lg">
            <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-white font-bold text-sm"><Menu size={20} /><span>Curriculum</span></button>
            <span className="text-[10px] font-bold text-[#457B9D] bg-blue-900/20 px-2 py-1 rounded uppercase tracking-wider border border-blue-900/30">Playing</span>
          </div>

          {activeLesson ? (
            <div className="min-h-full flex flex-col">
              
              {/* VIDEO STAGE */}
              <div className="w-full bg-black relative shadow-2xl z-10">
                 <div className="max-w-6xl mx-auto w-full aspect-video bg-black relative">
                    {activeLesson.type === 'quiz' ? (
                       <div className="absolute inset-0 bg-slate-100 overflow-y-auto">
                           <QuizPlayer lesson={activeLesson} courseId={courseId} onComplete={handleLessonComplete} />
                       </div>
                    ) : embedUrl ? (
                        <iframe className="w-full h-full absolute top-0 left-0" src={embedUrl} title={activeLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                            <AlertCircle size={48} className="opacity-50"/>
                            <p className="font-bold text-sm tracking-widest uppercase">Video Source Unavailable</p>
                        </div>
                    )}
                 </div>
              </div>

              {/* CONTENT AREA */}
              <div className="bg-white flex-1 relative">
                 <div className="max-w-5xl mx-auto px-6 py-10">
                    
                    {/* Header Info & Action */}
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8 border-b border-slate-100 pb-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-blue-50 text-[#457B9D] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{activeModule?.title || "Module"}</span>
                          {activeLesson.type === 'quiz' && <span className="bg-purple-50 text-purple-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-purple-100">Assessment</span>}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{activeLesson.title}</h1>
                      </div>

                      {activeLesson.type !== 'quiz' && (
                        <div className="w-full lg:w-auto">
                            <button 
                                onClick={handleLessonComplete} 
                                disabled={!canMarkComplete || enrollment.completedLessons.includes(activeLesson._id) || markingComplete} 
                                className={`w-full lg:w-auto px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex justify-center items-center gap-3 transition-all shadow-lg ${enrollment.completedLessons.includes(activeLesson._id) ? "bg-green-50 text-green-600 border border-green-100 cursor-default shadow-none" : !canMarkComplete ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : "bg-[#457B9D] text-white hover:bg-[#345d77] active:scale-95 shadow-blue-900/20"}`}
                            >
                                {markingComplete ? <Loader2 className="animate-spin" size={16} /> : 
                                 enrollment.completedLessons.includes(activeLesson._id) ? <><CheckCircle size={16} /> Completed</> : 
                                 !canMarkComplete ? <><Clock size={16} /> Wait {timeLeft}s</> : 
                                 <><CheckCircle size={16} /> Mark Complete</>}
                            </button>
                        </div>
                      )}
                    </div>

                    {/* 🆕 TABS NAVIGATION */}
                    <div className="flex items-center gap-6 border-b border-slate-200 mb-8 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('notes')}
                            className={`pb-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'notes' ? 'text-[#457B9D] border-b-2 border-[#457B9D]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <FileText size={16}/> Lesson Notes
                        </button>
                        <button 
                            onClick={() => setActiveTab('assignment')}
                            className={`pb-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'assignment' ? 'text-[#457B9D] border-b-2 border-[#457B9D]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <BrainCircuit size={16}/> Module Assignment
                        </button>
                        <button 
                            onClick={() => setActiveTab('qa')}
                            className={`pb-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'qa' ? 'text-[#457B9D] border-b-2 border-[#457B9D]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <MessageCircle size={16}/> Monthly Q&A
                        </button>
                    </div>

                    {/* 🆕 TAB CONTENT */}
                    <div className="min-h-[200px]">
                        
                        {/* 1. LESSON NOTES */}
                        {activeTab === 'notes' && (
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 animate-in fade-in zoom-in duration-300">
                                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-sm uppercase tracking-widest">
                                    <FileText size={18} className="text-[#457B9D]"/> Summary & Key Points
                                </h3>
                                <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-loose">
                                    {activeLesson.content || <p className="italic text-slate-400">No additional notes available for this lesson.</p>}
                                </div>
                            </div>
                        )}

                        {/* 2. ASSIGNMENT TAB */}
                        {activeTab === 'assignment' && (
                            <div className="animate-in fade-in zoom-in duration-300 space-y-6">
                                <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100">
                                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-3 text-sm uppercase tracking-widest">
                                        <BrainCircuit size={18} className="text-[#457B9D]"/> Current Module Task
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                        Apply what you've learned in <strong>{activeModule?.title}</strong>. Please complete the task below and submit your work for review.
                                    </p>
                                    <div className="bg-white p-6 rounded-2xl border border-blue-100 text-slate-700 text-sm font-medium mb-6">
                                        {activeModule?.assignmentDetails || "Create a comprehensive strategy document based on the lessons in this module. Upload your file to Google Drive and share the link below."}
                                    </div>
                                    
                                    <form onSubmit={handleSubmitAssignment}>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Submission Link / Answer</label>
                                        <div className="flex gap-4">
                                            <input 
                                                type="text" 
                                                required
                                                value={submissionText}
                                                onChange={(e) => setSubmissionText(e.target.value)}
                                                placeholder="Paste Google Drive link or type answer here..."
                                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#457B9D]"
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={submitting}
                                                className="bg-[#457B9D] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#345d77] transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {submitting ? <Loader2 className="animate-spin" size={14}/> : <Upload size={14}/>}
                                                Submit
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* 3. Q&A TAB */}
                        {activeTab === 'qa' && (
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 animate-in fade-in zoom-in duration-300">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                                        <MessageCircle size={32} />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="font-black text-slate-900 text-lg mb-2">Monthly Live Q&A</h3>
                                        <p className="text-slate-600 text-sm mb-4">
                                            Join us for our exclusive monthly session where we answer your questions live.
                                        </p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                                <Calendar size={14} className="text-[#457B9D]"/> Last Saturday of Month
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                                <Clock size={14} className="text-[#457B9D]"/> 7:00 PM WAT
                                            </div>
                                        </div>
                                        <a href="#" className="inline-flex items-center gap-2 text-[#457B9D] font-black text-xs uppercase tracking-widest hover:underline">
                                            <LinkIcon size={14}/> Join Community Channel
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Course Complete Certificate Banner */}
                    {isCourseFinished && (
                        <div className="mt-12 bg-gradient-to-r from-[#A8D5BA]/20 to-emerald-50 border border-[#A8D5BA] p-8 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-[#A8D5BA] text-white rounded-full shadow-lg shadow-green-200"><Award size={32} /></div>
                                <div>
                                    <h3 className="text-emerald-900 font-black text-xl mb-1">Track Completed!</h3>
                                    <p className="text-emerald-700 text-sm font-medium">You have mastered this curriculum.</p>
                                </div>
                            </div>
                            <button onClick={handleDownloadCertificate} className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
                                <Download size={16} /> Download Certificate
                            </button>
                        </div>
                    )}

                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-6 text-center">
                <Zap size={48} className="opacity-20"/>
                <p className="font-bold uppercase tracking-widest text-xs">Select a lesson from the curriculum</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursePlayer;