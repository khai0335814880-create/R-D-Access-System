import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { useDeviceStore } from '../store/deviceStore';
import { accessService } from '../services/accessService';
import { Users, LogOut, Settings, User, Sun, Moon, Shield, Laptop, Handshake } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const GlobalLayout = ({ children }) => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [occupancy, setOccupancy] = useState(0);
  const { user, socket, connectSocket, logout } = useAuthStore();
  const { devices, fetchMyDevices } = useDeviceStore();
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');
  const navigate = useNavigate();

  const approvedDevices = devices.filter(d => d.status?.toLowerCase() === 'approved').length;
  const pendingDevices = devices.filter(d => d.status?.toLowerCase() === 'pending').length;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Connect socket on mount if user exists
    connectSocket();
    fetchOccupancy();

    if (socket) {
      // Listen for global occupancy updates
      socket.on('occupancy_update', () => {
        fetchOccupancy();
      });
    }

    return () => {
      if (socket) {
        socket.off('occupancy_update');
      }
    };
  }, [user, socket, connectSocket]);

  useEffect(() => {
    if (user?.role === 'engineer') {
      fetchMyDevices();
    }
  }, [user, fetchMyDevices]);

  const fetchOccupancy = async () => {
    try {
      const data = await accessService.getCurrentOccupancy();
      setOccupancy(data.occupancy || 0);
    } catch (err) {
      console.error('Failed to fetch occupancy', err);
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Header - Glassmorphism style */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 h-20 flex items-center justify-between px-8 z-30 relative shadow-sm">
        {/* Cột 1: Đối tác chiến lược HCL và ANZ */}
        <div className="flex flex-col items-start space-y-1">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
            <Shield size={10} className="mr-1 text-indigo-500" /> ĐỐI TÁC CHIẾN LƯỢC
          </span>
          <div className="flex items-center space-x-3">
            {/* Logo HCL */}
            <div className="flex items-center bg-gradient-to-r from-[#6A1B9A] via-[#4A148C] to-[#1E88E5] px-3 py-1.5 rounded-xl shadow-sm border border-[#6A1B9A]/30">
              <div className="flex items-center space-x-2 text-white">
                <span className="font-sans font-black text-lg tracking-tight">HCLTech</span>
                <div className="h-4 w-[1px] bg-white/40"></div>
                <span className="text-[7px] font-bold tracking-wider leading-tight">Supercharging<br/>Progress™</span>
              </div>
            </div>

            <Handshake size={20} className="text-indigo-500 animate-pulse flex-shrink-0" />

            {/* Logo ANZ */}
            <div className="flex items-center bg-[#004165] px-3 py-1 rounded-xl shadow-sm border border-[#005282]">
              <svg viewBox="0 0 140 40" className="h-7 w-28">
                {/* ANZ Text */}
                <text x="5" y="30" className="font-sans font-black text-3xl tracking-tighter" fill="white" style={{ fontStyle: 'italic' }}>ANZ</text>
                {/* Horizontal cut line */}
                <line x1="4" y1="20" x2="65" y2="20" stroke="#004165" strokeWidth="2.5" />
                
                {/* Lotus Icon */}
                <g transform="translate(80, -2)">
                  {/* Center Petal (Top Circle) */}
                  <circle cx="22" cy="15" r="9" fill="#00A3E0" />
                  {/* Center Petal (Curved Body) */}
                  <path d="M12,22 C12,33 32,33 32,22 C32,20 12,20 12,22" fill="#00A3E0" />
                  {/* Left Petal */}
                  <path d="M10,26 C-2,23 -2,35 10,36 C16,36 15,28 10,26" fill="#00B4D8" />
                  {/* Right Petal */}
                  <path d="M34,26 C46,23 46,35 34,36 C28,36 29,28 34,26" fill="#00B4D8" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Cột 2: Trạng thái và các tiện ích */}
        <div className="flex-1 flex justify-center max-w-2xl px-6">
          {user?.role === 'engineer' ? (
            <div className="flex items-center space-x-4 animate-in fade-in duration-500">
              {/* Cấp quyền Ra/Vào */}
              <div className="flex items-center bg-emerald-500/5 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-3 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Trạng thái ra/vào</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-tight">ĐÃ CẤP QUYỀN TRUY CẬP</span>
                </div>
              </div>

              {/* Thống kê thiết bị cá nhân */}
              <div className="flex items-center bg-[#0F5FDC]/5 dark:bg-[#0F5FDC]/10 px-4 py-2 rounded-xl border border-[#0F5FDC]/20 shadow-sm">
                <Laptop size={18} className="text-[#0F5FDC] dark:text-blue-400 mr-3" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Thiết bị mang theo</span>
                  <span className="text-sm font-black text-[#0F5FDC] dark:text-blue-400 mt-1 uppercase tracking-tight">{devices.length} Thiết bị hợp lệ</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block mr-6">
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                  Xin chào, {user?.full_name?.split(' ')[0] || 'User'} 👋
                </h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">R&D Access Server</p>
              </div>

              {/* Occupancy Widget - Pulse effect */}
              <div className="flex items-center bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2 rounded-none border border-indigo-100/50 dark:border-indigo-500/20 group hover:bg-indigo-100/50 transition-all duration-300">
                <Users size={18} className="text-indigo-600 dark:text-indigo-400 mr-3 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 leading-none">{occupancy} NHÂN VIÊN</span>
                  <span className="text-[9px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-tighter mt-1">Hiện diện trong phòng</span>
                </div>
                <div className="ml-4 flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cột 3: Phải */}
        <div className="flex items-center justify-end space-x-3">
          {/* Real-time Notification System */}
          <NotificationDropdown socket={socket} />

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center"
            title={isDarkMode ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-blue-600" />}
          </button>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* User Profile Action Center */}
          <div className="flex items-center group cursor-pointer relative">
            <div className="text-right mr-3 hidden md:block">
              <p className="text-sm font-black text-slate-800 dark:text-white leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tighter">{user?.full_name}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{user?.role}</p>
            </div>
            <div className="w-12 h-12 rounded-none bg-gradient-to-br from-indigo-500 to-blue-600 p-[2px] shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-all duration-300">
              <div className="w-full h-full bg-white rounded-none flex items-center justify-center text-indigo-600 font-black text-lg">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Simple Tooltip on Hover */}
            <div className="absolute right-0 top-full mt-2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-2xl p-2 w-48 overflow-hidden">
                <button onClick={() => navigate('/profile')} className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition">
                  <User size={16} className="mr-3 text-slate-400 dark:text-slate-500" /> Tài khoản của tôi
                </button>
                <button onClick={() => navigate('/settings')} className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-none transition">
                  <Settings size={16} className="mr-3 text-slate-400 dark:text-slate-500" /> Cài đặt hệ thống
                </button>
                <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1"></div>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-none transition"
                >
                  <LogOut size={16} className="mr-3" /> Đăng xuất máy chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content wrapper below header */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Page Content Backdrop */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/40 relative">
            {/* Background glow effects for premium dark mode */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
             {children}
          </div>
        </main>
      </div>
     </div>
    </div>
  );
};

export default GlobalLayout;
