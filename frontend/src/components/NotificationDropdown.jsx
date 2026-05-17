import React, { useEffect } from 'react';
import { Bell, Info, CheckCircle, AlertTriangle, X, Terminal, Clock, CheckCheck, ShieldAlert, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

const NotificationDropdown = ({ socket }) => {
    const { user } = useAuthStore();
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        addNotification, 
        markAsRead, 
        markAllAsRead 
    } = useNotificationStore();
    const [isOpen, setIsOpen] = React.useState(false);

    useEffect(() => {
        fetchNotifications();

        if (socket) {
            socket.on('notification', (newNotif) => {
                const formattedNotif = { ...newNotif, read: false };
                addNotification(formattedNotif);
                
                if (newNotif.type === 'error' || newNotif.type === 'warning' || newNotif.type === 'success') {
                    const audio = new Audio('/alert.mp3');
                    audio.play().catch(() => {});
                }
            });

            socket.on('security_incident', (data) => {
                const alertNotif = {
                    id: Date.now(),
                    title: 'SECURITY INCIDENT ALERT',
                    message: data.message || 'Anomalous facility access detected.',
                    type: 'error',
                    created_at: new Date().toISOString(),
                    read: false
                };
                addNotification(alertNotif);
            });
        }

        return () => {
            if (socket) {
                socket.off('notification');
                socket.off('security_incident');
            }
        };
    }, [socket, fetchNotifications, addNotification]);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={16} />;
            case 'error': return <AlertTriangle className="text-red-500" size={16} />;
            case 'warning': return <Info className="text-primary" size={16} />;
            default: return <Bell className="text-primary" size={16} />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-graphite hover:bg-cloud rounded-md transition-all focus:outline-none border border-transparent hover:border-fog group"
            >
                <Bell size={20} className="group-hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-on-ink text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-canvas shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-md w-80 md:w-[400px] bg-paper rounded-xl shadow-floating border border-fog z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-xl py-md border-b border-fog flex justify-between items-center bg-cloud">
                            <h3 className="text-caption-bold text-ink uppercase tracking-widest flex items-center gap-sm">
                                <Activity size={16} className="text-primary" /> Command Response Hub
                            </h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold uppercase text-primary bg-primary/5 px-sm py-xxs rounded border border-primary/10">
                                    {unreadCount} New Signals
                                </span>
                            )}
                        </div>

                        <div className="max-h-[450px] overflow-y-auto divide-y divide-fog">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-xl hover:bg-cloud/50 transition-colors relative group cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                                        onClick={() => !notif.read && markAsRead(notif.id)}
                                    >
                                        <div className="flex gap-xl">
                                            <div className="mt-xs flex-shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-caption-bold uppercase tracking-wide ${!notif.read ? 'text-ink' : 'text-graphite'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-caption-md text-charcoal mt-xxs leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                <div className="text-[10px] text-graphite mt-md font-bold flex items-center gap-xs uppercase tracking-widest">
                                                    <Clock size={10} />
                                                    {new Date(notif.created_at).toLocaleString('en-GB', { hour12: false })}
                                                </div>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-xs"></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-xxl text-center px-xl">
                                    <div className="w-16 h-16 bg-cloud rounded-full flex items-center justify-center mx-auto mb-xl border border-fog shadow-inner">
                                        <ShieldAlert className="text-fog" size={32} />
                                    </div>
                                    <p className="text-caption-bold text-graphite uppercase tracking-widest">System parameters nominal</p>
                                    <p className="text-caption-md text-steel mt-xs max-w-[200px] mx-auto">No pending administrative signals or security alerts at this time.</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-md bg-cloud border-t border-fog flex justify-between items-center px-xl">
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold text-graphite hover:text-primary transition uppercase tracking-widest flex items-center gap-xs"
                                >
                                    <CheckCheck size={14} /> Clear Active Alerts
                                </button>
                                <button className="text-[10px] font-bold text-graphite hover:text-primary transition uppercase tracking-widest">
                                    Full Ledger
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
