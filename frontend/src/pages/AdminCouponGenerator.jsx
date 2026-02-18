import { useState, useEffect } from 'react';
import { 
  Ticket, Copy, Check, Download, Loader2, 
  Plus, Trash2, Filter, History, User, ExternalLink 
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/layout/Navbar';

const AdminCouponGenerator = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('TIO');
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Fetch Courses and Coupon History on load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetchingHistory(true);
    try {
      const [courseRes, couponRes] = await Promise.all([
        api.get('/courses'),
        api.get('/coupons') // Ensure your backend route is /api/coupons
      ]);
      setCourses(courseRes.data.data);
      setHistory(couponRes.data.data);
    } catch (err) {
      console.error("Data fetch failed", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCourse) return alert("Select a course first!");
    setLoading(true);
    try {
      const res = await api.post('/coupons/generate', {
        courseId: selectedCourse,
        count: parseInt(count),
        prefix
      });
      setGeneratedCodes(res.data.data);
      // Refresh history to include new codes
      fetchInitialData();
    } catch (err) {
      alert("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this access code?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access Code Factory</h1>
            <p className="text-slate-500 mt-1 font-medium">Generate and manage secure offline enrollment keys.</p>
          </div>
          <div className="bg-olg-blue text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-olg-blue/20">
            <Ticket size={18} /> Admin Control
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* ⚙️ CONFIGURATION PANEL */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                <Plus size={20} className="text-olg-blue" /> Setup Batch
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Target Course</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-olg-blue/5 focus:border-olg-blue transition-all font-semibold text-slate-700"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Choose Course...</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Quantity</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Prefix</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 bg-olg-blue text-white rounded-2xl font-bold hover:bg-olg-dark transition-all flex items-center justify-center gap-3 mt-4 shadow-xl shadow-olg-blue/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> Create Batch</>}
                </button>
              </div>
            </div>
          </div>

          {/* 📋 CURRENT GENERATED CODES */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                   New Batch <span className="px-2 py-0.5 bg-olg-blue/10 text-olg-blue rounded text-xs">{generatedCodes.length}</span>
                </h2>
              </div>

              <div className="flex-1 p-8 overflow-y-auto max-h-[400px]">
                {generatedCodes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-10 opacity-50">
                    <Ticket size={48} strokeWidth={1.5} />
                    <p className="font-medium">No new codes generated in this session.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {generatedCodes.map((item) => (
                      <div key={item._id} className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-olg-blue hover:shadow-md transition-all">
                        <code className="font-mono font-bold text-lg text-olg-blue tracking-tighter">{item.code}</code>
                        <button 
                          onClick={() => copyToClipboard(item.code, item._id)}
                          className="p-2 hover:bg-olg-blue/5 rounded-xl text-slate-400 hover:text-olg-blue transition-all"
                        >
                          {copiedIndex === item._id ? <Check size={18} className="text-olg-green" /> : <Copy size={18} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 📜 HISTORICAL LOGS */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><History size={20}/></div>
               <h2 className="text-xl font-bold text-slate-800">Master Coupon Log</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">Code</th>
                  <th className="px-8 py-4">Course</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Redeemed By</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fetchingHistory ? (
                  <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300"/></td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-medium">No history found.</td></tr>
                ) : (
                  history.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="font-mono font-bold text-slate-700">{item.code}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-semibold text-slate-600">{item.course?.title}</span>
                      </td>
                      <td className="px-8 py-5">
                        {item.isUsed ? (
                          <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">REDEEMED</span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">AVAILABLE</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm">
                        {item.userWhoUsed ? (
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-olg-blue/10 flex items-center justify-center text-olg-blue text-[10px] font-bold">
                                {item.userWhoUsed.name[0]}
                             </div>
                             <span className="font-medium text-slate-600">{item.userWhoUsed.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => copyToClipboard(item.code, item._id)}
                            className="p-2 text-slate-400 hover:text-olg-blue transition-colors"
                          >
                            {copiedIndex === item._id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                          {!item.isUsed && (
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminCouponGenerator;