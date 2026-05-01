import React, { useState } from 'react';
import { Settings, User, Lock, Bell, Shield, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const SettingsPage = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [pwdSuccess, setPwdSuccess] = useState(false);

    const tabs = [
        { id: 'profile', name: 'Hồ Sơ', icon: User },
        { id: 'security', name: 'Bảo Mật', icon: Lock },
        { id: 'notifications', name: 'Thông Báo', icon: Bell },
    ];

    const handleUpdatePwd = (e) => {
        e.preventDefault();
        setPwdSuccess(true);
        setTimeout(() => setPwdSuccess(false), 3000);
    };

    const loginHistory = [
        { time: "2026-04-26 20:15:22", device: "Chrome / Windows 11", ip: "192.168.1.15", status: "Thành công" },
        { time: "2026-04-25 08:30:45", device: "Chrome / Windows 11", ip: "192.168.1.15", status: "Thành công" },
        { time: "2026-04-24 17:05:10", device: "Firefox / macOS", ip: "10.0.0.42", status: "Thành công" },
    ];

    return (
        <div className="px-6 md:px-12 py-8 w-full relative z-10 animate-in fade-in duration-700">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center justify-center md:justify-start">
                    <Settings className="text-[#0F5FDC] dark:text-blue-400 mr-3 animate-spin-slow" size={36} /> Cài Đặt
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Quản lý thông tin tài khoản và cấu hình hệ thống.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-[#0F5FDC] text-white shadow-lg shadow-blue-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50">
                    {activeTab === 'profile' && (
                        <div>
                            <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/60 mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#0F5FDC] to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/30">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{user?.full_name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">@{user?.username} • {user?.role?.toUpperCase()}</p>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                                <User size={20} className="mr-2 text-[#0F5FDC] dark:text-blue-400" /> Thông Tin Hồ Sơ
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tên Đăng Nhập</label>
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Họ Và Tên</label>
                                    <input
                                        type="text"
                                        value={user?.full_name || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mã Nhân Viên</label>
                                    <input
                                        type="text"
                                        value={user?.employee_id || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-xl text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vai Trò</label>
                                    <span className="inline-block px-4 py-3 bg-blue-500/10 text-[#0F5FDC] dark:text-blue-400 font-bold rounded-xl border border-blue-500/20 text-sm uppercase">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                                <Lock size={20} className="mr-2 text-[#0F5FDC] dark:text-blue-400" /> Đổi Mật Khẩu
                            </h2>
                            {pwdSuccess && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center justify-center font-bold text-sm mb-6">
                                    <CheckCircle size={20} className="mr-2 animate-bounce" /> Cập nhật mật khẩu thành công!
                                </div>
                            )}
                            <form onSubmit={handleUpdatePwd} className="space-y-4 max-w-md mb-10">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mật Khẩu Hiện Tại</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0F5FDC] outline-none transition font-medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mật Khẩu Mới</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0F5FDC] outline-none transition font-medium"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Xác Nhận Mật Khẩu Mới</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0F5FDC] outline-none transition font-medium"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#0F5FDC] hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-2"
                                >
                                    Cập Nhật Mật Khẩu
                                </button>
                            </form>

                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                                <ShieldAlert size={20} className="mr-2 text-[#0F5FDC] dark:text-blue-400" /> Lịch sử đăng nhập
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/60">
                                        <tr>
                                            <th className="py-3 px-4">Thời gian</th>
                                            <th className="py-3 px-4">Thiết bị</th>
                                            <th className="py-3 px-4">IP</th>
                                            <th className="py-3 px-4">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                        {loginHistory.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.time}</td>
                                                <td className="py-3 px-4">{item.device}</td>
                                                <td className="py-3 px-4 font-mono">{item.ip}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold border border-emerald-500/20">
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                                <Bell size={20} className="mr-2 text-[#0F5FDC] dark:text-blue-400" /> Cấu Hình Thông Báo
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">Thông báo phê duyệt</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">Nhận thông báo khi thiết bị được duyệt.</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#0F5FDC] bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-[#0F5FDC]" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">Cảnh báo bảo mật</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">Nhận cảnh báo về các sự cố bảo mật.</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#0F5FDC] bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-[#0F5FDC]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
