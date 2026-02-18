import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, CheckCircle, XCircle, ShieldCheck, 
  User, CreditCard, Clock, RefreshCw, Mail
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // 1. Fetch Pending Enrollments
  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/pending-enrollments'); 
      setEnrollments(res.data.data);
    } catch (err) {
      console.error("Admin Load Error:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
          alert("Access Denied: Admins Only");
          navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPending();
  }, [user]);

  // 2. Approve Action
  const handleApprove = async (enrollmentId, studentEmail, courseId) => {
    const confirmText = `Confirm payment for ${studentEmail}?\n\nThis will unlock the course and send an automated activation email.`;
    if (!window.confirm(confirmText)) return;

    setProcessingId(enrollmentId);
    try {
      await api.post('/admin/approve-enrollment', { 
        email: studentEmail, 
        courseId: courseId 
      });
      
      // Remove approved item from local state list
      setEnrollments(prev => prev.filter(e => e._id !== enrollmentId));
      alert(`Access granted to ${studentEmail} successfully!`);
    } catch (err) {
      console.error("Approval Failed:", err);
      alert(err.response?.data?.message || "Failed to approve. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#457B9D] mb-4" size={40}/>
        <p className="text-slate-500 font-medium animate-pulse">Loading secure dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-[#457B9D]" size={32}/> Admin Control
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-1">
                    Verify bank transfers and grant institutional access.
                </p>
            </div>
            <button 
                onClick={fetchPending} 
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
            >
                <RefreshCw size={16} /> Refresh List
            </button>
        </div>

        {/* Stats Summary (Optional Visual) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Verifications</p>
                <h2 className="text-3xl font-black text-amber-500">{enrollments.length}</h2>
            </div>
        </div>

        {/* Main List Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Waiting for Approval</h3>
                </div>
            </div>
            
            {enrollments.length === 0 ? (
                <div className="p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-slate-200" size={40}/>
                    </div>
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs italic">Queue is currently empty</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {enrollments.map((enrollment) => (
                        <div key={enrollment._id} className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:bg-slate-50/80 transition-all duration-300">
                            
                            {/* Student & Course Info */}
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black text-[#457B9D] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest">
                                        Manual Transfer
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                                        REF: {enrollment._id.slice(-8).toUpperCase()}
                                    </span>
                                </div>

                                <h4 className="font-black text-slate-900 text-xl tracking-tight leading-tight">
                                    {enrollment.course?.title || "Unknown Course"}
                                </h4>

                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                    <div className="flex items-center gap-2 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                        <Mail size={14} className="text-slate-400"/>
                                        <span className="text-sm font-bold">{enrollment.confirmedEmail || enrollment.student?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-600 font-black">
                                        <CreditCard size={16}/>
                                        <span className="text-lg">₦{enrollment.course?.price?.toLocaleString() || '0'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 shrink-0">
                                <button 
                                    onClick={() => handleApprove(
                                        enrollment._id, 
                                        enrollment.confirmedEmail || enrollment.student?.email, 
                                        enrollment.course?._id
                                    )}
                                    disabled={processingId === enrollment._id}
                                    className="flex-1 lg:flex-none px-8 py-4 bg-[#457B9D] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#345d77] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/10 active:scale-95 disabled:opacity-50"
                                >
                                    {processingId === enrollment._id ? (
                                        <Loader2 className="animate-spin" size={18}/>
                                    ) : (
                                        <CheckCircle size={18} strokeWidth={3}/>
                                    )}
                                    {processingId === enrollment._id ? "Activating..." : "Approve Access"}
                                </button>

                                <button 
                                    title="Reject Payment"
                                    className="p-4 bg-white border border-slate-200 text-red-400 rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-95"
                                    onClick={() => alert("To reject, please contact the student via the email provided.")}
                                >
                                    <XCircle size={20}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <Clock size={12}/> Last updated: {new Date().toLocaleTimeString()}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;