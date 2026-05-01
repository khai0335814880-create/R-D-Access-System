import React, { useState, useEffect } from 'react';
import { Bell, Info, CheckCircle, AlertTriangle, X, Terminal, Clock } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

const NotificationDropdown = ({ socket }) => {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();

        if (socket) {
            socket.on('notification', (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Play a subtle sound if it's an alert
                if (newNotif.type === 'error' || newNotif.type === 'warning') {
                    const audio = new Audio('/alert.mp3');
                    audio.play().catch(() => {}); // Browser might block autoplay
                }
            });

            // Specific event for security alerts
            socket.on('security_incident', (data) => {
                const alertNotif = {
                    id: Date.now(),
                    title: '🚨 CẢNH BÁO AN NINH',
                    message: data.message || 'Phát hiện truy cập bất thường!',
                    type: 'error',
                    created_at: new Date().toISOString()
                };
                setNotifications(prev => [alertNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        }

        return () => {
            if (socket) {
                socket.off('notification');
                socket.off('security_incident');
            }
        };
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getMyNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-emerald-500" size={18} />;
            case 'error': return <AlertTriangle className="text-rose-500" size={18} />;
            case 'warning': return <Info className="text-amber-500" size={18} />;
            default: return <Bell className="text-blue-500" size={18} />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all focus:outline-none"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-none shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-800 tracking-tight flex items-center">
                                <Terminal size={18} className="mr-2 text-indigo-600" /> TRUNG TÂM PHẢN HỒI
                            </h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    {unreadCount} Mới
                                </span>
                            )}
                        </div>

                        <div className="max-h-[450px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative group ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-bold ${!notif.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center">
                                                    <Clock size={10} className="mr-1" />
                                                    {new Date(notif.created_at).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="text-slate-300" size={32} />
                                    </div>
                                    <p className="text-slate-400 font-bold tracking-tight">Bầu trời hôm nay thật yên bình</p>
                                    <p className="text-xs text-slate-300 mt-1">Chưa có thông báo nào được gửi tới bạn.</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                                <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition tracking-widest uppercase">
                                    Xem tất cả báo cáo
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
