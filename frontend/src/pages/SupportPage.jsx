import React, { useState } from 'react';
import { HelpCircle, Phone, Mail, MessageSquare, AlertCircle, Server, CheckCircle } from 'lucide-react';

const SupportPage = () => {
    const [ticketSent, setTicketSent] = useState(false);
    const [ticketData, setTicketData] = useState({ title: '', desc: '' });

    const contacts = [
        {
            role: "Hỗ trợ Kỹ thuật (IT Support)",
            name: "Trần Diễm Quỳnh",
            phone: "0901.234.567",
            email: "support.rd@company.com",
            available: "24/7"
        },
        {
            role: "Quản lý Phòng R&D (Admin)",
            name: "Đoàn Phương Ninh",
            phone: "0902.345.678",
            email: "admin.rd@company.com",
            available: "Giờ hành chính"
        },
        {
            role: "An ninh Khu vực (Security)",
            name: "Đội An Ninh",
            phone: "Nội bộ: 113",
            email: "security@company.com",
            available: "24/7"
        }
    ];

    const handleSendTicket = (e) => {
        e.preventDefault();
        if (!ticketData.title || !ticketData.desc) return;
        setTicketSent(true);
        setTicketData({ title: '', desc: '' });
        setTimeout(() => setTicketSent(false), 3000);
    };

    return (
        <div className="px-6 md:px-12 py-8 w-full relative z-10 animate-in fade-in duration-700">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center justify-center md:justify-start">
                    <HelpCircle className="text-[#0F5FDC] dark:text-blue-400 mr-3" size={36} /> Hỗ Trợ Kỹ Thuật
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Liên hệ với chúng tôi khi gặp sự cố về hệ thống hoặc thiết bị.</p>
            </div>

            {/* System Status Widget */}
            <div className="mb-10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                    <div className="p-3 bg-blue-500/10 text-[#0F5FDC] dark:text-blue-400 rounded-xl mr-4 flex-shrink-0">
                        <Server size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Trạng thái hệ thống</h3>
                        <p className="text-base text-slate-500 dark:text-slate-400">Tất cả các dịch vụ đang hoạt động bình thường.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-2" />
                        <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Server: Online</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-2" />
                        <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Database: Connected</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                {contacts.map((contact, idx) => (
                    <div key={idx} className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50 transition-all duration-300 hover:border-blue-500/30">
                        <p className="text-sm font-bold text-[#0F5FDC] dark:text-blue-400 uppercase tracking-widest mb-1">{contact.role}</p>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{contact.name}</h2>

                        <div className="space-y-3 mt-4 text-base text-slate-600 dark:text-slate-300">
                            <div className="flex items-center">
                                <Phone size={16} className="mr-3 text-slate-400" />
                                <span>{contact.phone}</span>
                            </div>
                            <div className="flex items-center">
                                <Mail size={16} className="mr-3 text-slate-400" />
                                <span>{contact.email}</span>
                            </div>
                            <div className="flex items-center">
                                <MessageSquare size={16} className="mr-3 text-slate-400" />
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold">{contact.available}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50">
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-500/10 text-[#0F5FDC] dark:text-blue-400 rounded-xl mr-4 flex-shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Bạn gặp lỗi phần mềm?</h3>
                        <p className="text-base text-slate-500 dark:text-slate-400">Gửi Ticket yêu cầu hỗ trợ trực tiếp đến đội ngũ IT.</p>
                    </div>
                </div>

                {ticketSent ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center justify-center font-bold text-base">
                        <CheckCircle size={20} className="mr-2 animate-bounce" /> Gửi Ticket thành công! Chúng tôi sẽ liên hệ lại sớm nhất.
                    </div>
                ) : (
                    <form onSubmit={handleSendTicket} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tiêu đề sự cố</label>
                            <input
                                type="text"
                                value={ticketData.title}
                                onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
                                placeholder="Ví dụ: Không thể quét mã QR thiết bị..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0F5FDC] outline-none transition font-medium"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mô tả chi tiết</label>
                            <textarea
                                rows="4"
                                value={ticketData.desc}
                                onChange={(e) => setTicketData({ ...ticketData, desc: e.target.value })}
                                placeholder="Mô tả các bước xảy ra lỗi, thiết bị đang dùng..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-[#0F5FDC] outline-none transition font-medium resize-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#0F5FDC] hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            Gửi Ticket Hỗ Trợ
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SupportPage;
