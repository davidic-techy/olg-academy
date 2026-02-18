import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Save, Trash2, Video, FileText, 
  ChevronRight, Layout, PlayCircle, Loader2, AlertCircle 
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/layout/Navbar';

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeItem, setActiveItem] = useState({ type: 'course', data: null });

  // Fetch Course Data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data.data);
        setActiveItem({ type: 'course', data: res.data.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // Handlers for adding Structure
  const addModule = () => {
    const newModule = {
      _id: `temp-${Date.now()}`,
      title: 'New Module',
      lessons: []
    };
    setCourse({ ...course, modules: [...(course.modules || []), newModule] });
    setActiveItem({ type: 'module', data: newModule });
  };

  const addLesson = (moduleId) => {
    const newLesson = {
      _id: `temp-l-${Date.now()}`,
      title: 'New Lesson',
      videoUrl: '',
      description: ''
    };
    const updatedModules = course.modules.map(mod => {
      if (mod._id === moduleId) {
        return { ...mod, lessons: [...mod.lessons, newLesson] };
      }
      return mod;
    });
    setCourse({ ...course, modules: updatedModules });
    setActiveItem({ type: 'lesson', data: newLesson });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Logic: You would send the entire 'course' object to your update endpoint
      await api.put(`/courses/${courseId}`, course);
      alert("Course structure updated successfully!");
    } catch (err) {
      alert("Error saving course structure");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* 🛠️ ACTION BAR */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-16 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-olg-blue/10 text-olg-blue rounded-lg">
            <Layout size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">Course Builder</h1>
            <p className="text-xs text-slate-500">{course?.title}</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-olg-blue text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-olg-dark transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* 📑 LEFT: CURRICULUM OUTLINE */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Curriculum</h3>
            <button onClick={addModule} className="text-olg-blue hover:bg-blue-50 p-1 rounded-md transition-colors">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {course.modules?.map((module, mIdx) => (
              <div key={module._id} className="space-y-2">
                <button 
                  onClick={() => setActiveItem({ type: 'module', data: module })}
                  className={`w-full text-left p-3 rounded-lg flex justify-between items-center group transition-colors ${activeItem.data?._id === module._id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}
                >
                  <span className="font-bold text-sm text-slate-700">M{mIdx + 1}: {module.title}</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>

                <div className="ml-4 space-y-1 border-l-2 border-slate-100 pl-4">
                  {module.lessons?.map((lesson) => (
                    <button 
                      key={lesson._id}
                      onClick={() => setActiveItem({ type: 'lesson', data: lesson, moduleId: module._id })}
                      className={`w-full text-left p-2 rounded-md text-sm flex items-center gap-2 transition-colors ${activeItem.data?._id === lesson._id ? 'text-olg-blue font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Video size={14} /> {lesson.title}
                    </button>
                  ))}
                  <button 
                    onClick={() => addLesson(module._id)}
                    className="text-xs text-olg-blue font-medium flex items-center gap-1 p-2 hover:underline"
                  >
                    <Plus size={14} /> Add Lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ✍️ RIGHT: EDITOR AREA */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-12">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-10">
            
            {activeItem.type === 'lesson' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-olg-blue mb-4">
                  <PlayCircle size={24} />
                  <h2 className="text-xl font-bold text-slate-800">Edit Lesson Details</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Lesson Title</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-olg-blue outline-none"
                    value={activeItem.data.title}
                    onChange={(e) => {
                       const val = e.target.value;
                       // This local update logic needs to be deep-copied back to 'course' state
                       setCourse(prev => {
                          const newMods = prev.modules.map(m => {
                             if(m._id === activeItem.moduleId) {
                                m.lessons = m.lessons.map(l => l._id === activeItem.data._id ? {...l, title: val} : l);
                             }
                             return m;
                          });
                          return {...prev, modules: newMods};
                       });
                       setActiveItem({...activeItem, data: {...activeItem.data, title: val}});
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">YouTube Video URL</label>
                  <div className="relative">
                    <Video className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-olg-blue outline-none"
                      value={activeItem.data.videoUrl}
                      onChange={(e) => {
                         const val = e.target.value;
                         setCourse(prev => {
                            const newMods = prev.modules.map(m => {
                               if(m._id === activeItem.moduleId) {
                                  m.lessons = m.lessons.map(l => l._id === activeItem.data._id ? {...l, videoUrl: val} : l);
                               }
                               return m;
                            });
                            return {...prev, modules: newMods};
                         });
                         setActiveItem({...activeItem, data: {...activeItem.data, videoUrl: val}});
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={10} /> Paste the full link. We'll handle the embedding automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description / Notes</label>
                  <textarea 
                    rows="5"
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-olg-blue outline-none"
                    placeholder="Briefly explain what students will learn in this video..."
                    value={activeItem.data.description}
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-slate-300" />
                 </div>
                 <h2 className="font-bold text-slate-800">Select an item to edit</h2>
                 <p className="text-slate-500 text-sm">Click on a module or lesson from the sidebar.</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseBuilder;