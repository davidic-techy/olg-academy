import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, ShieldCheck, ArrowLeft, 
  Loader2, Ticket, Lock, MessageCircle 
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../auth/AuthContext';

const EnrollmentSummary = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form & UI State
  const [accessCode, setAccessCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Course Details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Could not load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  // 2. Handle Free Enrollment
  const handleFreeEnrollment = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await api.post(`/enrollments/${courseId}/enroll`);
      navigate('/dashboard', { state: { justEnrolled: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Handle Access Code Redemption (For Paid Courses)
  const handleRedeemCode = async (e) => {
    e.preventDefault();
    if (!accessCode) return;

    setIsProcessing(true);
    setError('');
    try {
      await api.post('/enrollments/redeem-code', { 
        code: accessCode, 
        courseId 
      });
      navigate('/dashboard', { state: { justEnrolled: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired access code.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-olg-blue h-10 w-10" />
    </div>
  );

  const isFree = course?.price === 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-olg-blue mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Catalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT: Enrollment Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">Confirm Enrollment</h1>
              
              {/* Course Identity Card */}
              <div className="flex gap-6 items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-10">
                <img 
                  src={course?.image || 'https://placehold.co/600x400/2D6A9F/FFF?text=Course'} 
                  className="w-32 h-24 object-cover rounded-xl shadow-sm" 
                  alt={course?.title} 
                />
                <div>
                  <div className="text-xs font-bold text-olg-blue uppercase tracking-widest mb-1">
                    {course?.category}
                  </div>
                  <h2 className="font-bold text-xl text-slate-800 leading-tight">{course?.title}</h2>
                  <p className="text-slate-500 text-sm mt-1">Instructor: {course?.instructor || 'TIO'}</p>
                </div>
              </div>

              {/* Student Info Grid */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-lg">Student Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Full Name</p>
                    <p className="font-bold text-slate-700">{user?.name}</p>
                  </div>
                  <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Email Address</p>
                    <p className="font-bold text-slate-700">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-center">
              <ShieldCheck className="text-olg-blue shrink-0" size={24} />
              <p className="text-sm text-slate-600 leading-relaxed">
                By completing this enrollment, you get lifetime access to the 2026 curriculum updates for this course.
              </p>
            </div>
          </div>

          {/* RIGHT: Payment/Redemption Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-6 text-xl">Order Summary</h3>
              
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>List Price</span>
                  <span className={isFree ? 'line-through' : ''}>
                    ₦{course?.price?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium tracking-tight">Access Fee</span>
                  <span className="text-olg-green font-extrabold text-sm px-2 py-0.5 bg-green-50 rounded-md">FREE</span>
                </div>
              </div>

              <div className="flex justify-between py-6 text-2xl font-black text-slate-900">
                <span>Total</span>
                <span>₦{isFree ? '0' : course?.price?.toLocaleString()}</span>
              </div>

              {/* DYNAMIC ACTION SECTION */}
              <div className="mt-4 space-y-6">
                {isFree ? (
                  /* FREE COURSE BUTTON */
                  <button 
                    onClick={handleFreeEnrollment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-olg-btn text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-olg-dark hover:-translate-y-1 transition-all shadow-lg shadow-olg-blue/20 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <>Get Instant Access <CheckCircle size={20} /></>}
                  </button>
                ) : (
                  /* PAID COURSE - ACCESS CODE FORM */
                  <form onSubmit={handleRedeemCode} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                        Redeem Access Code
                      </label>
                      <div className="relative group">
                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-olg-blue transition-colors" size={18} />
                        <input 
                          type="text"
                          placeholder="e.g. TIO-ACAD-2026"
                          className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none font-mono font-bold transition-all ${error ? 'border-red-500 ring-2 ring-red-50' : 'border-slate-200 focus:border-olg-blue focus:ring-4 focus:ring-olg-blue/5'}`}
                          value={accessCode}
                          onChange={(e) => {
                            setAccessCode(e.target.value.toUpperCase());
                            setError('');
                          }}
                        />
                      </div>
                      {error && (
                        <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-2 ml-1">
                          <Lock size={12} /> {error}
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      disabled={!accessCode || isProcessing}
                      className="w-full py-4 bg-olg-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-olg-dark hover:shadow-lg transition-all disabled:opacity-50 disabled:bg-slate-300"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" /> : "Unlock Course"}
                    </button>

                    <a 
                      href="https://wa.me/2340000000000" // Replace with your WhatsApp
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 border-2 border-slate-100 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm"
                    >
                      <MessageCircle size={18} className="text-green-500" /> 
                      Contact TIO for Code
                    </a>
                  </form>
                )}
              </div>

              <p className="text-center text-[10px] text-slate-400 mt-8 px-4 uppercase tracking-widest font-bold opacity-60">
                Authorized Secure Enrollment
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default EnrollmentSummary;