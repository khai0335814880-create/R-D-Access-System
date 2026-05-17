import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { useDeviceStore } from '../store/deviceStore';
import { accessService } from '../services/accessService';
import { Users, LogOut, Settings, User, Sun, Moon, Shield, Laptop, Handshake, Globe, ShoppingCart, LogIn, ShieldCheck } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import NotificationDropdown from './NotificationDropdown';

const GlobalLayout = ({ children }) => {
  const { language, setLanguage, t } = useLanguageStore();
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [occupancy, setOccupancy] = useState(0);
  const { user, socket, connectSocket, logout } = useAuthStore();
  const { devices, fetchMyDevices } = useDeviceStore();
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();

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
    connectSocket();
    fetchOccupancy();
    if (socket) {
      socket.on('occupancy_update', () => fetchOccupancy());
    }
    return () => {
      if (socket) socket.off('occupancy_update');
    };
  }, [user, socket, connectSocket]);

  useEffect(() => {
    if (user?.role === 'engineer') fetchMyDevices();
  }, [user, fetchMyDevices]);

  const fetchOccupancy = async () => {
    try {
      const data = await accessService.getCurrentOccupancy();
      setOccupancy(data.occupancy || 0);
    } catch (err) {
      console.error('Failed to fetch occupancy', err);
    }
  };

  const toggleSidebar = () => setSidebarExpanded(!isSidebarExpanded);

  return (
    <div className="flex flex-col h-screen bg-canvas dark:bg-ink overflow-hidden font-sans text-ink dark:text-on-ink transition-colors duration-300">
      {/* 1. Utility Strip - Dark Navy Slab */}
      <div className="bg-ink text-on-ink h-9 flex items-center justify-between px-xl z-50 text-caption-md font-medium">
        <div className="flex items-center space-x-xl">
          <div className="flex items-center">
            <Globe size={14} className="mr-xs" />
            <div className="flex items-center space-x-xs bg-charcoal/50 rounded px-xxs">
               <button 
                 onClick={() => setLanguage('en')}
                 className={`px-xs py-0.5 rounded transition-all ${language === 'en' ? 'bg-primary text-white font-bold' : 'text-steel hover:text-white'}`}
               >
                 EN
               </button>
               <button 
                 onClick={() => setLanguage('vi')}
                 className={`px-xs py-0.5 rounded transition-all ${language === 'vi' ? 'bg-primary text-white font-bold' : 'text-steel hover:text-white'}`}
               >
                 VI
               </button>
            </div>
          </div>
          <div className="flex items-center space-x-md border-l border-steel/30 pl-md h-4">
            <span className="cursor-pointer hover:text-primary">R&D Lab Access</span>
            <span className="text-steel">|</span>
            <span className="cursor-pointer font-bold text-primary">Secure Access</span>
          </div>
        </div>
        <div className="flex items-center space-x-xl">
          <button onClick={() => navigate('/support')} className="hover:text-primary">{t('common.support')}</button>
          <button className="flex items-center hover:text-primary">
            <ShoppingCart size={14} className="mr-xs" />
            <span>{t('common.inventory')}</span>
          </button>
          <button onClick={logout} className="flex items-center hover:text-primary">
            <LogIn size={14} className="mr-xs" />
            <span>{t('common.sign_out')}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Header - White Commercial Body */}
      <header className="bg-canvas dark:bg-ink-soft border-b border-fog dark:border-charcoal h-16 flex items-center justify-between px-xl z-40 relative">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-xxl">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
             {/* Collaborative Logo Identity */}
             <div className="flex items-center space-x-sm">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="flex flex-col -space-y-1">
                    <span className="font-bold text-xl tracking-tighter">R&D Secure Node</span>
                    <span className="text-[10px] text-graphite uppercase tracking-widest font-bold">Access Management</span>
                </div>
             </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-lg">
             <button onClick={() => navigate('/dashboard')} className="px-md py-xs font-bold text-ink dark:text-on-ink hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">{t('common.dashboard')}</button>
             <button onClick={() => navigate('/devices')} className="px-md py-xs font-bold text-ink dark:text-on-ink hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">{t('common.devices')}</button>
             <button onClick={() => navigate('/rules')} className="px-md py-xs font-bold text-ink dark:text-on-ink hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">{t('common.rules')}</button>
          </nav>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center space-x-lg">
          {/* Occupancy Indicator */}
          <div className="flex items-center bg-cloud dark:bg-charcoal px-md py-xxs rounded-lg border border-fog dark:border-steel/20">
            <Users size={16} className="text-primary mr-sm" />
            <div className="flex flex-col">
              <span className="text-caption-bold leading-none">{occupancy} {t('common.active_in_room')}</span>
              <span className="text-[9px] font-bold text-graphite uppercase tracking-tighter">{t('common.in_room')}</span>
            </div>
          </div>

          <NotificationDropdown socket={socket} />

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-cloud dark:bg-charcoal text-ink dark:text-on-ink rounded-md hover:bg-fog dark:hover:bg-steel/30 transition-all border border-fog dark:border-steel/20"
          >
            {isDarkMode ? <Sun size={18} className="text-bloom-coral" /> : <Moon size={18} className="text-primary" />}
          </button>

          <div className="h-6 w-[1px] bg-fog dark:bg-charcoal mx-xs"></div>

          {/* Profile Circle */}
          <div className="flex items-center group cursor-pointer relative">
            <div className="w-10 h-10 rounded-full border border-steel overflow-hidden hover:border-primary transition-colors">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cloud text-primary font-bold">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Tooltip Dropdown */}
            <div className="absolute right-0 top-full mt-2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-canvas dark:bg-ink border border-fog dark:border-charcoal rounded-xl shadow-floating p-2 w-52">
                <div className="px-md py-sm border-b border-fog dark:border-charcoal mb-xxs">
                   <p className="text-body-emphasis leading-tight">{user?.full_name}</p>
                   <p className="text-caption-sm text-graphite uppercase tracking-widest">{user?.role}</p>
                </div>
                <button onClick={() => navigate('/profile')} className="w-full flex items-center px-md py-sm text-caption-md font-bold text-ink dark:text-on-ink hover:bg-cloud dark:hover:bg-charcoal rounded-md transition">
                  <User size={14} className="mr-md text-graphite" /> {t('common.profile')}
                </button>
                <button onClick={() => navigate('/settings')} className="w-full flex items-center px-md py-sm text-caption-md font-bold text-ink dark:text-on-ink hover:bg-cloud dark:hover:bg-charcoal rounded-md transition">
                  <Settings size={14} className="mr-md text-graphite" /> {t('common.settings')}
                </button>
                <button onClick={logout} className="w-full flex items-center px-md py-sm text-caption-md font-bold text-bloom-deep hover:bg-bloom-rose/20 rounded-md transition mt-xxs">
                  <LogOut size={14} className="mr-md" /> {t('common.sign_out')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Content Wrapper */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-canvas dark:bg-ink">
          {/* Alternating Bands logic could be applied inside children, 
              but we set a base fog/cloud area for the main view */}
          <main className="flex-1 overflow-y-auto bg-canvas dark:bg-ink relative">
            {/* Rhythm: Section padding vertical 80px (spacing.section) */}
            <div className="max-w-[1366px] mx-auto py-section px-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
               {children}
            </div>

            {/* Closing Footer Prelude (Optional/Minimal) */}
            <div className="bg-ink text-on-ink px-xl py-xxl mt-section flex items-center justify-between">
               <div>
                  <h3 className="text-display-xs mb-xxs">Need technical assistance?</h3>
                  <p className="text-caption-md text-steel">Our R&D support team is available 24/7 for security matters.</p>
               </div>
               <button onClick={() => navigate('/support')} className="bg-canvas text-ink px-xl py-sm rounded-md button-label-md hover:bg-cloud transition-colors">
                  Contact Support
               </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default GlobalLayout;
