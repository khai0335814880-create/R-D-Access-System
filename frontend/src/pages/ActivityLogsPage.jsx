import React, { useEffect, useState } from 'react';
import { activityService } from '../services/activityService';
import LoadingSpinner from '../components/LoadingSpinner';
import { History, Search, Download, Laptop, Calendar, User, Shield, Users, DoorOpen, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import * as XLSX from 'xlsx';

const ActivityLogsPage = () => {
    const { user } = useAuthStore();
    const [auditLogs, setAuditLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        loadAuditLogs();
    }, []);

    const loadAuditLogs = async () => {
        setIsLoading(true);
        try {
            const data = await activityService.getRecentActivity(500); // Tăng giới hạn lên 500 cho nhiều dữ liệu hơn
            setAuditLogs(data.activity || []);
        } catch (err) {
            console.error("Failed to load audit logs", err);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: 'Tất cả', icon: <LayoutDashboard size={18} /> },
        { id: 'access', label: 'Ra / Vào', icon: <DoorOpen size={18} /> },
        { id: 'users', label: 'Tài khoản', icon: <Users size={18} /> },
        { id: 'devices', label: 'Thiết bị', icon: <Laptop size={18} /> },
        { id: 'security', label: 'An ninh', icon: <Shield size={18} /> },
    ];

    const filteredLogs = auditLogs.filter(log => {
        const type = log.activity_type?.toLowerCase() || '';
        const desc = log.description?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        const matchesSearch = 
            desc.includes(searchLower) ||
            (log.full_name && log.full_name.toLowerCase().includes(searchLower)) ||
            (log.username && log.username.toLowerCase().includes(searchLower)) ||
            type.includes(searchLower);
        
        let matchesType = true;
        if (filterType === 'access') {
            matchesType = type.includes('check_in') || type.includes('check_out');
        } else if (filterType === 'users') {
            matchesType = type.includes('user') || type.includes('profile') || type.includes('login');
        } else if (filterType === 'devices') {
            matchesType = type.includes('device') && log.role !== 'security';
        } else if (filterType === 'security') {
            matchesType = type.includes('security') || desc.includes('cảnh báo') || (type.includes('device') && log.role === 'security');
        }
            
        return matchesSearch && matchesType;
    });

    const exportToExcel = () => {
        const wsData = filteredLogs.map(log => ({
            'Thời Gian': new Date(log.created_at).toLocaleString('vi-VN'),
            'Người Thực Hiện': log.full_name || 'Hệ Thống',
            'Username': log.username || '-',
            'Hành Động': log.activity_type.toUpperCase(),
            'Nội Dung Chi Tiết': log.description
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Nhat_Ky_He_Thong");
        XLSX.writeFile(wb, `RD_Activity_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const getActionStyle = (type, desc) => {
        if (type.includes('check_in')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (type.includes('check_out')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        if (type.includes('login')) return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        if (type.includes('security') || (desc && desc.toLowerCase().includes('cảnh báo'))) return 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse';
        if (type.includes('delete') || type.includes('reject')) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        if (type.includes('update')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (type.includes('create') || type.includes('register') || type.includes('approv')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    return (
        <div className="w-full min-h-[calc(100vh-6rem)] p-4 md:p-8 relative z-10 flex flex-col space-y-8">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center">
                        <History className="text-[#0F5FDC] dark:text-indigo-400 mr-3" size={28} />
                        {user?.role === 'admin' ? 'Nhật Ký Hoạt Động Hệ Thống' : 'Lịch Sử Ra Vào & Hoạt Động'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        {user?.role === 'admin' 
                            ? 'Hồ sơ ghi nhận toàn vẹn các hành vi cấu hình, tương tác và ra vào phòng R&D.' 
                            : 'Truy xuất dữ liệu tức thời và giám sát hoạt động cá nhân tại phòng R&D.'}
                    </p>
                </div>
                <button 
                    onClick={exportToExcel}
                    className="flex items-center px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition shadow-sm"
                >
                    <Download size={20} className="mr-2" /> XUẤT BÁO CÁO (.XLSX)
                </button>
            </div>

            {/* Filter & Categories Panel */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên người thực hiện, hành động, thiết bị..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/50 rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-sm text-slate-800 dark:text-white"
                        />
                    </div>
                    
                    <div className="flex items-center bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-500/20 w-full md:w-auto justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{filteredLogs.length}</span>
                        <span className="text-indigo-500 dark:text-indigo-500/80 text-xs font-bold uppercase ml-2">Kết quả</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setFilterType(cat.id)}
                            className={`flex items-center justify-center px-4 py-3 rounded-xl font-bold text-base transition-all duration-200 ${
                                filterType === cat.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <span className="mr-2">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Log Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-800/50 overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="py-32 flex flex-col items-center">
                            <LoadingSpinner />
                            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Đang tải dữ liệu nhật ký...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Thời Gian</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Người Thực Hiện</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chức Danh</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hành Động</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nội Dung Chi Tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                                    const time = new Date(log.created_at);
                                    
                                    return (
                                        <tr key={log.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shadow-sm">
                                                        <Calendar size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-bold text-slate-700 dark:text-slate-200">{time.toLocaleDateString('vi-VN')}</p>
                                                        <p className="text-sm text-slate-400 dark:text-slate-500 font-mono mt-0.5">{time.toLocaleTimeString('vi-VN')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm ${log.full_name ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{log.full_name || 'Hệ thống tự động'}</p>
                                                        {log.username && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">@{log.username}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {log.role ? (
                                                    <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${
                                                        log.role === 'admin' ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' :
                                                        log.role === 'manager' ? 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                        log.role === 'security' ? 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                                                        'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    }`}>
                                                        {log.role}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3.5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase border ${getActionStyle(log.activity_type.toLowerCase(), log.description)}`}>
                                                    {log.activity_type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="max-w-md">
                                                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                        {log.description}
                                                    </p>
                                                    {log.metadata && log.metadata.device_ids && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {log.metadata.device_ids.map((dId, idx) => (
                                                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                                    <Laptop size={12} className="mr-1.5" /> #{dId}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 font-medium">
                                            Không có lịch sử hoạt động nào phù hợp với bộ lọc hiện tại.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogsPage;
