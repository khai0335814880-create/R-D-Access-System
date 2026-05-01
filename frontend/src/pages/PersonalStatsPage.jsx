import React, { useEffect, useState } from 'react';
import { accessService } from '../services/accessService';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PieChart, Clock, Calendar, TrendingUp, Monitor, ShieldCheck, History, ChevronLeft, ChevronRight } from 'lucide-react';

const PersonalStatsPage = () => {
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));

    const { socket, user } = useAuthStore();

    useEffect(() => {
        Promise.all([fetchStats(), fetchHistory()]).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (socket) {
            const handleUpdate = () => {
                fetchStats();
                fetchHistory();
            };

            socket.on('occupancy_update', handleUpdate);

            return () => {
                socket.off('occupancy_update', handleUpdate);
            };
        }
    }, [socket]);

    const fetchStats = async () => {
        try {
            const data = await accessService.getPersonalStats();
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch personal stats", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const data = await accessService.getAccessHistory();
            setHistory(data.history || []);
        } catch (err) {
            console.error("Failed to fetch access history", err);
        }
    };

    const getDuration = (checkIn, checkOut) => {
        if (!checkOut) return null;
        const diff = new Date(checkOut) - new Date(checkIn);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        if (hours === 0) return `${minutes}p`;
        return `${hours}h ${minutes}p`;
    };

    const groupHistoryByDate = (historyList) => {
        if (!historyList) return {};
        const grouped = {};
        historyList.forEach(log => {
            const dateStr = new Date(log.check_in_time).toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(log);
        });
        return grouped;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner message="Đang tổng hợp dữ liệu toàn cảnh..." /></div>;

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    const filteredHistory = history.filter(log => {
        const logDate = new Date(log.check_in_time);
        return logDate >= currentWeekStart && logDate <= currentWeekEnd;
    });

    const prevWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const chartData = stats?.durations?.map(d => ({
        date: new Date(d.check_in_time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        hours: parseFloat(d.duration_hours).toFixed(1)
    })).reverse() || [];

    const isCurrentlyInRoom = history.length > 0 && history[0].status === 'checked_in';

    return (
        <div className="w-full min-h-[calc(100vh-6rem)] p-4 md:p-8 relative z-10 flex flex-col space-y-8">
            {/* Background elements to fill space gracefully */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center">
                        <PieChart className="text-[#0F5FDC] dark:text-blue-400 mr-3" size={28} /> Tổng Quan Hoạt Động
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Bảng điều khiển theo dõi lịch sử và thời gian làm việc tại R&D Lab.</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.full_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.employee_id || 'ID: N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Top Metric Cards - Grid of 4 to fill width better */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-800/50 transition-all hover:-translate-y-1 hover:shadow-blue-500/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <Calendar size={24} className="text-[#0F5FDC] dark:text-blue-400" />
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">Tổng cộng</span>
                    </div>
                    <p className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">{stats?.totalStays || 0}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Lượt truy cập phòng R&D</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-800/50 transition-all hover:-translate-y-1 hover:shadow-indigo-500/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                            <Clock size={24} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">Trung bình</span>
                    </div>
                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">{stats?.avgDurationHours || 0} <span className="text-xl">h</span></p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Thời gian mỗi phiên</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-800/50 transition-all hover:-translate-y-1 hover:shadow-emerald-500/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                            <TrendingUp size={24} className="text-emerald-500" />
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">Tần suất</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">Ổn định</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Dựa trên 30 ngày qua</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-800/50 transition-all hover:-translate-y-1 hover:shadow-purple-500/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                            <ShieldCheck size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full">Hiện tại</span>
                    </div>
                    {isCurrentlyInRoom ? (
                        <div className="relative z-10">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 tracking-tight mt-2 flex items-center">
                                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2 shadow-purple-500/50 shadow-sm"></span>
                                Đang trong Lab
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Bạn chưa Check-out</p>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 tracking-tight mt-2">Bên ngoài</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Đã Check-out an toàn</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Chart and Activity Feed side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Duration Chart (Spans 2 columns on XL) */}
                <div className="xl:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-800/50 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center tracking-tight">
                            <TrendingUp size={24} className="mr-3 text-[#0F5FDC] dark:text-blue-400" /> Xu hướng làm việc (Giờ)
                        </h2>
                        <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-500/20">7 ngày gần nhất</span>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0F5FDC" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0F5FDC" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.1} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    itemStyle={{ color: '#0F5FDC', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="hours" fill="url(#colorHours)" radius={[8, 8, 0, 0]} barSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed (Spans 1 column on XL) */}
                <div className="xl:col-span-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-800/50 flex flex-col h-[400px] xl:h-auto overflow-hidden">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center tracking-tight">
                        <Monitor size={24} className="mr-3 text-[#0F5FDC] dark:text-blue-400" /> Hoạt động mới nhất
                    </h2>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {stats?.recentActivity?.map((activity) => (
                            <div key={activity.id} className="relative pl-6 pb-4 border-l-2 border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${activity.status === 'checked_in' ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}></div>
                                <div className="bg-slate-50/80 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                                            {activity.status === 'checked_in' ? 'Tiến vào R&D Lab' : 'Rời khỏi R&D Lab'}
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-0.5 rounded">#{activity.id}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center">
                                        <Clock size={12} className="mr-1" />
                                        {new Date(activity.created_at).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {!stats?.recentActivity?.length && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <History size={32} className="mb-2 opacity-50" />
                                <p className="text-sm font-medium">Chưa có hoạt động</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed History Grid - Filling the bottom space */}
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center tracking-tight">
                        <History size={28} className="mr-3 text-[#0F5FDC] dark:text-blue-400" /> Lịch Sử Ra Vào Chi Tiết
                    </h2>

                    {/* Week Navigation controls */}
                    <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50">
                        <button
                            onClick={prevWeek}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 hover:text-[#0F5FDC] dark:text-slate-400 dark:hover:text-blue-400"
                            title="Tuần trước"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="px-4 font-bold text-sm text-slate-700 dark:text-slate-200 tracking-wide min-w-[200px] text-center">
                            Tuần: {currentWeekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {currentWeekEnd.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>

                        <button
                            onClick={nextWeek}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 hover:text-[#0F5FDC] dark:text-slate-400 dark:hover:text-blue-400"
                            title="Tuần sau"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {filteredHistory.length === 0 ? (
                    <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
                        <Clock size={48} className="text-slate-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Chưa có dữ liệu</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Không có lượt ra vào nào trong tuần này.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(groupHistoryByDate(filteredHistory)).map(([date, logs]) => (
                            <div key={date} className="relative">
                                {/* Date Divider */}
                                <div className="flex items-center mb-6">
                                    <div className="bg-blue-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-blue-100 dark:border-slate-700 text-blue-700 dark:text-blue-400 font-bold text-sm uppercase tracking-wider flex items-center shadow-sm">
                                        <Calendar size={16} className="mr-2" /> {date}
                                    </div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-100 dark:from-slate-700 to-transparent ml-4"></div>
                                </div>

                                {/* Full-width Row Layout for Cards */}
                                <div className="space-y-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group">

                                            {/* Section 1: ID and Status */}
                                            <div className="flex flex-row md:flex-col items-center md:items-start justify-between w-full md:w-48 mb-4 md:mb-0 space-y-0 md:space-y-3">
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                                    PHIÊN #{log.id}
                                                </span>
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${log.status === 'checked_in'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    }`}>
                                                    {log.status === 'checked_in' ? 'ĐANG Ở TRONG' : 'ĐÃ RA'}
                                                </span>
                                            </div>

                                            {/* Section 2: Time Details */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full md:w-auto flex-1 md:px-8 justify-center">
                                                <div className="flex flex-col w-full sm:w-auto flex-1 max-w-[240px]">
                                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center mb-2">
                                                        <Clock size={14} className="mr-1.5 text-emerald-500" /> Vào lúc
                                                    </span>
                                                    <span className="text-base font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 text-center shadow-sm">
                                                        {new Date(log.check_in_time).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="hidden sm:flex text-slate-300 dark:text-slate-600 items-center justify-center">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                </div>

                                                <div className="flex flex-col w-full sm:w-auto flex-1 max-w-[240px]">
                                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center mb-2">
                                                        <Clock size={14} className="mr-1.5 text-rose-500" /> Ra lúc
                                                    </span>
                                                    <span className={`text-base font-bold p-3 rounded-xl border text-center shadow-sm ${log.check_out_time ? 'text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50' : 'text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/20 border-slate-100/50 dark:border-slate-800/30 border-dashed'}`}>
                                                        {log.check_out_time
                                                            ? new Date(log.check_out_time).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                            : '--/--/---- --:--:--'
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Section 3: Duration */}
                                            <div className="w-full md:w-48 mt-5 md:mt-0 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700/50 pt-5 md:pt-0 md:pl-6 group-hover:border-blue-100 dark:group-hover:border-blue-900/30 transition-colors">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0 md:mb-3">Thời lượng</span>
                                                {log.check_out_time ? (
                                                    <span className="text-xl font-bold text-[#0F5FDC] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl">
                                                        {getDuration(log.check_in_time, log.check_out_time)}
                                                    </span>
                                                ) : (
                                                    <span className="text-lg font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl animate-pulse text-center">
                                                        Đang đếm...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonalStatsPage;
