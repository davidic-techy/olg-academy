import { useState } from 'react';
import { User, Lock, Save, Loader2, ShieldCheck, Mail, Edit3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Settings = () => {
  const { user, login } = useAuth(); // We use login() to update the local user state
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form Data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/users/profile', profileData);
      
      // Update local auth context with new data
      // (We re-use the login function to save the new user object to state/localStorage)
      // Note: You might need to adjust your AuthContext to have a specific 'updateUser' function, 
      // but for now, re-saving the token/user works if the structure matches.
      const updatedUser = res.data.data;
      const token = localStorage.getItem('token'); // Keep existing token
      login(updatedUser, token); 

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Password update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-slate-500">Manage your personal details and security.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'profile' 
                  ? 'bg-olg-blue text-white shadow-lg shadow-olg-blue/20' 
                  : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
              <User size={18} /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'security' 
                  ? 'bg-olg-blue text-white shadow-lg shadow-olg-blue/20' 
                  : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck size={18} /> Security
            </button>
          </div>

          {/* Main Content Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-10">
              
              {/* Feedback Message */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${
                  message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}>
                  {message.type === 'success' ? <ShieldCheck size={18} /> : <Loader2 size={18} />}
                  {message.text}
                </div>
              )}

              {/* === PROFILE TAB === */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 bg-olg-blue/10 text-olg-blue rounded-full flex items-center justify-center font-black text-2xl">
                      {user?.name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Profile Photo</h3>
                      <p className="text-xs text-slate-400">Your avatar is generated from your initials.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-700 outline-none focus:border-olg-blue focus:ring-4 focus:ring-olg-blue/5 transition-all"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="email" 
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-700 outline-none focus:border-olg-blue focus:ring-4 focus:ring-olg-blue/5 transition-all"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-8 py-4 bg-olg-blue text-white rounded-2xl font-bold hover:bg-olg-dark transition-all shadow-xl shadow-olg-blue/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              )}

              {/* === SECURITY TAB === */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-sm mb-6 flex gap-3">
                    <Lock className="shrink-0" size={20} />
                    <p>Ensure your account is using a long, random password to stay secure.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-olg-blue focus:ring-4 focus:ring-olg-blue/5 transition-all"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">New Password</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-olg-blue focus:ring-4 focus:ring-olg-blue/5 transition-all"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-olg-blue focus:ring-4 focus:ring-olg-blue/5 transition-all"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-8 py-4 bg-olg-blue text-white rounded-2xl font-bold hover:bg-olg-dark transition-all shadow-xl shadow-olg-blue/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} /> Update Password</>}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;