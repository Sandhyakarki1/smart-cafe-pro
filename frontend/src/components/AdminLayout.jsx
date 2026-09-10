import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'; 
import { 
  LayoutDashboard, Users, UtensilsCrossed, 
  ClipboardList, MessageSquare, QrCode, ReceiptText,
  LogOut, ChevronDown, User, Settings, X, Grid3x3
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const adminData = JSON.parse(localStorage.getItem("admin_user")) || {};
  
  const [currentUser, setCurrentUser] = useState({
    username: adminData.username || 'Admin',
    email: adminData.email || 'sandhyakarki506@gmail.com' 
  });

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("admin_user"));
    if (adminData) {
      setCurrentUser({
        username: adminData.username,
        email: adminData.email || 'sandhyakarki506@gmail.com'
      });
    }
  }, []);

    const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Staff', path: '/admin/staff', icon: <Users size={20} /> },
    { name: 'Menu', path: '/admin/menu', icon: <UtensilsCrossed size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ClipboardList size={20} /> },
    { name: 'Feedback', path: '/admin/feedback', icon: <MessageSquare size={20} /> },
    { name: 'QR Code', path: '/admin/qrcode', icon: <QrCode size={20} /> },
    { name: 'Tables', path: '/admin/tables', icon: <Grid3x3 size={20} /> },
    { name: 'Billing', path: '/admin/billing', icon: <ReceiptText size={20} /> },
  ];

  const getPageTitle = () => {
    const current = menuItems.find(item => location.pathname.includes(item.path));
    return current ? current.name : "Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_user"); 
    navigate("/admin/login");
  };

  useEffect(() => {
    const closeDropdown = () => setIsProfileOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col z-40 shadow-2xl text-left">
        <div className="p-8">
          <h2 className="text-2xl font-black tracking-tighter italic border-b border-slate-700 pb-4 flex items-center gap-2">
             <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm not-italic uppercase font-black">{currentUser.username.charAt(0)}</div>
             Smart-cafe
          </h2>
        </div>
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink key={item.name} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-[#22c55e] text-white shadow-lg shadow-green-900/20' : 'text-slate-400 hover:bg-slate-800'}`}>
              {item.icon} <span className="font-semibold text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 h-24 flex items-center justify-between px-10 z-30 shadow-sm">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">{getPageTitle()}</h2>
            <p className="text-[11px] text-indigo-600 font-black uppercase tracking-[0.2em] mt-2 italic">Welcome back, {currentUser.username}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }} className="flex items-center gap-3 p-1.5 pr-4 bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-md transition-all active:scale-95 group text-left">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg uppercase">{currentUser.username.charAt(0)}</div>
                <div className="hidden sm:block">
                  <p className="text-xs font-black text-slate-800 leading-none capitalize">{currentUser.username}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Super Admin</p>
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-50 py-3 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                  <div className="px-5 py-3 border-b border-slate-50 mb-2">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Account Email</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{currentUser.email}</p>
                  </div>
                  <button onClick={() => { setIsModalVisible(true); setIsProfileOpen(false); }} className="flex items-center gap-3 px-5 py-2.5 w-full text-slate-600 hover:bg-indigo-50 text-sm font-bold transition-all"><User size={16}/> Profile</button>
                  <div className="border-t border-slate-50 mt-2 pt-2 px-2">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl text-sm font-black transition-all uppercase tracking-widest"><LogOut size={16} /> Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto"><Outlet /></div>
        </main>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsModalVisible(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button>
            <div className="text-center">
              <div className="w-24 h-24 bg-indigo-600 text-white rounded-[30px] flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-xl uppercase">{currentUser.username.charAt(0)}</div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter capitalize">{currentUser.username}</h2>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-8">Super Admin</p>
              <div className="bg-slate-50 rounded-3xl p-6 text-left space-y-4 mb-8">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Email Address</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Account Security</p>
                  <p className="text-sm font-bold text-emerald-500 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Verified Profile</p>
                </div>
              </div>
              <button onClick={() => setIsModalVisible(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;