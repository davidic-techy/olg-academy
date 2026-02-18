import { useState, useRef, useEffect } from 'react';
import { 
  MoveRight, LogOut, User, Settings, 
  Menu, X, ChevronDown, LayoutDashboard, BookOpen 
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // To highlight active link
  
  // UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Ref for clicking outside dropdown to close it
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check active link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1️⃣ LOGO AREA */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl flex items-center justify-center group-hover:border-olg-blue group-hover:shadow-md transition-all duration-300">
              <span className="text-olg-blue font-black text-xl tracking-tighter">ol.</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 tracking-tight leading-none group-hover:text-olg-blue transition-colors">OLG Nova</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Academy</span>
            </div>
          </Link>

          {/* 2️⃣ DESKTOP NAVIGATION (Center) */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="https://olgnova.org" 
              target="_blank" 
              rel="noreferrer"
              className="text-sm font-bold text-slate-500 hover:text-olg-blue transition-colors"
            >
              Main Site
            </a>
            <Link 
              to="/" 
              className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${isActive('/') ? 'text-olg-blue bg-blue-50 px-3 py-1.5 rounded-lg' : 'text-slate-500 hover:text-olg-blue'}`}
            >
              <BookOpen size={16} /> Browse Courses
            </Link>
          </div>

          {/* 3️⃣ ACTION AREA (Right) */}
          <div className="flex items-center gap-4">
            
            {user ? (
              // === LOGGED IN STATE ===
              <div className="relative" ref={dropdownRef}>
                {/* Profile Toggle Button */}
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-200 hover:border-olg-blue hover:shadow-md transition-all bg-white"
                >
                  <div className="w-8 h-8 bg-olg-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:block text-xs font-bold text-slate-700 max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 mr-2 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-50 mb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                    </div>

                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-olg-blue transition-colors text-sm font-medium">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-olg-blue transition-colors text-sm font-medium">
                      <Settings size={16} /> Account Settings
                    </Link>
                    
                    <div className="h-px bg-slate-100 my-2 mx-4"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-sm font-bold"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // === GUEST STATE ===
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-olg-blue transition-colors">
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-olg-blue text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-olg-dark transition-all font-bold text-sm shadow-lg shadow-olg-blue/20 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Start Learning <MoveRight size={16} />
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4️⃣ MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <Link to="/" className="flex items-center gap-3 py-2 text-slate-600 font-bold">
            <BookOpen size={18} /> Browse Courses
          </Link>
          <a href="https://olgnova.org" className="flex items-center gap-3 py-2 text-slate-600 font-bold">
            <MoveRight size={18} /> Main Site
          </a>
          
          <div className="h-px bg-slate-100 my-1"></div>

          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 py-2 text-slate-600 font-bold">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/settings" className="flex items-center gap-3 py-2 text-slate-600 font-bold">
                <Settings size={18} /> Settings
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 py-2 text-red-500 font-bold text-left w-full">
                <LogOut size={18} /> Log Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" className="w-full py-3 text-center border border-slate-200 rounded-xl font-bold text-slate-600">
                Log in
              </Link>
              <Link to="/register" className="w-full py-3 text-center bg-olg-blue text-white rounded-xl font-bold shadow-lg shadow-olg-blue/20">
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;