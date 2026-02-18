import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, ArrowRight, ShieldCheck, Copy, 
  Building, CheckCircle, Smartphone, Mail, AlertCircle 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const EnrollmentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); 
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null); 
  
  const [confirmEmail, setConfirmEmail] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data.data);
      } catch (err) {
        console.error("Error fetching course", err);
        setError("Could not load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (user?.email) {
      setConfirmEmail(user.email);
    }
  }, [user]);

  const handlePaymentNotification = async () => {
    if (!confirmEmail || !confirmEmail.includes('@')) {
      setError("Please enter a valid email address below.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 🛠️ BUG FIX: Use the correct backend route structure
      await api.post(`/enrollments/${courseId}/enroll`, { 
        paymentMethod: 'manual_transfer',
        confirmedEmail: confirmEmail 
      });
      
      setSubmitted(true);

      const message = `Hello TIO! I have made a transfer of ₦${course?.price.toLocaleString()} for "${course?.title}". My email is ${confirmEmail}. Please verify and activate my access.`;
      window.open(`https://wa.me/2349022815478?text=${encodeURIComponent(message)}`, '_blank');

    } catch (err) {
      console.error("Manual Enrollment Error:", err);
      
      // 💡 LOGIC: If they are already enrolled (pending), just let them proceed to WhatsApp
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
        setSubmitted(true);
        const message = `Hello TIO! I'm following up on my transfer for "${course?.title}". Email: ${confirmEmail}.`;
        window.open(`https://wa.me/2349022815478?text=${encodeURIComponent(message)}`, '_blank');
        return;
      }

      setError(err.response?.data?.message || "Connection error. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#457B9D]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-[#457B9D] selection:text-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-24 px-6 pb-20">
        {submitted ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-green-100 shadow-2xl shadow-green-900/5 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Payment Reported!</h2>
            <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto">
              We are verifying your transaction. You will receive an <strong>activation link</strong> via email at <span className="font-bold text-slate-800">{confirmEmail}</span> within 30 minutes.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">
                Go to Dashboard
              </button>
              <a href="mailto:support@olgnova.com" className="px-8 py-4 bg-[#457B9D] text-white font-bold rounded-xl hover:bg-[#345d77] transition-all text-xs uppercase tracking-widest flex items-center gap-2">
                <Mail size={16}/> Contact Support
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-black text-[#A8D5BA] uppercase tracking-[0.3em] mb-2 block">Secure Transfer</span>
                <h1 className="text-4xl font-light text-slate-900 leading-tight">
                  Complete your enrollment for <br/> <span className="font-black text-[#457B9D]">{course?.title}</span>
                </h1>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: 1, title: "Make a Transfer", desc: "Send the exact amount to the account details provided." },
                  { step: 2, title: "Confirm Email", desc: "Verify where we should send your login access." },
                  { step: 3, title: "Notify Us", desc: "We'll verify your payment and activate your portal." }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#457B9D] flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-[#457B9D] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Amount Due</p>
                      <h2 className="text-4xl font-black">₦{course?.price.toLocaleString()}</h2>
                    </div>
                    <Building className="text-[#A8D5BA]" size={32} />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Bank Name</p>
                      <p className="text-xl font-bold">GTBank</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Account Number</p>
                      <div className="flex items-center gap-4">
                        <p className="text-3xl font-mono font-bold tracking-widest">0123 456 789</p>
                        <button onClick={() => copyToClipboard("0123456789")} className="text-white/60 hover:text-white transition-colors">
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl mb-4 border border-slate-200 flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-[#457B9D]/20 transition-all">
                 <Mail className="text-[#457B9D]" size={20} />
                 <div className="flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Activation Email</label>
                    <input 
                        type="email" 
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        placeholder="yourname@email.com"
                        className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none"
                    />
                 </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button 
                onClick={handlePaymentNotification}
                disabled={processing}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#457B9D] transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : <Smartphone size={18} />}
                {processing ? "Sending Notification..." : "I have sent the money"}
              </button>
              
              <p className="text-center text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={14} /> Secure Enrollment
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentPage;