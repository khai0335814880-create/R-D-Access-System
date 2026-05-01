import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Lock, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const RulesPage = () => {
    const [agreed, setAgreed] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const rules = [
        {
            category: "Thiết bị cá nhân",
            icon: Lock,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            items: [
                "Tất cả thiết bị mang vào phải được đăng ký và phê duyệt trước.",
                "Mã QR định danh phải được dán hoặc hiển thị khi có yêu cầu.",
                "Không mang các thiết bị lưu trữ ngoài chưa qua kiểm duyệt (USB, Ổ cứng)."
            ]
        },
        {
            category: "Bảo mật thông tin",
            icon: ShieldAlert,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            items: [
                "Tuyệt đối không chụp ảnh, quay phim khu vực làm việc.",
                "Không chia sẻ thông tin dự án ra bên ngoài.",
                "Khóa màn hình máy tính (Win + L) khi rời khỏi vị trí."
            ]
        },
        {
            category: "Quy định chung",
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            items: [
                "Quẹt thẻ/Quét mã QR khi ra vào phòng.",
                "Không dẫn người lạ vào khu vực R&D.",
                "Tuân thủ hướng dẫn của nhân viên an ninh."
            ]
        }
    ];

    const faqs = [
        {
            q: "Làm thế nào để đăng ký thiết bị mới?",
            a: "Bạn truy cập vào Tab 'Đăng ký thiết bị' trên Sidebar, điền đầy đủ thông tin (Hãng, Model, Số Serial) và gửi yêu cầu. Quản lý sẽ phê duyệt trong vòng 24h."
        },
        {
            q: "Tôi có thể mang Laptop cá nhân vào phòng R&D không?",
            a: "Có, nhưng Laptop đó bắt buộc phải được dán mã QR định danh đã được hệ thống phê duyệt."
        },
        {
            q: "Mất mã QR dán trên thiết bị thì làm sao?",
            a: "Bạn vào Tab 'Tải mã QR' để tải lại hình ảnh mã QR và tiến hành in/dán lại lên thiết bị."
        }
    ];

    return (
        <div className="px-6 md:px-12 py-8 w-full relative z-10 animate-in fade-in duration-700">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center justify-center md:justify-start">
                    <ShieldAlert className="text-[#0F5FDC] dark:text-blue-400 mr-3 animate-pulse" size={36} /> Quy Định Phòng R&D
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Các quy tắc an toàn và bảo mật bắt buộc phải tuân thủ.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {rules.map((section, idx) => (
                    <div key={idx} className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50 transition-all duration-300 hover:border-blue-500/30">
                        <div className="flex items-center mb-6">
                            <div className={`p-3 ${section.bg} ${section.color} rounded-xl mr-4`}>
                                <section.icon size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{section.category}</h2>
                        </div>
                        <ul className="space-y-4">
                            {section.items.map((item, i) => (
                                <li key={i} className="flex items-start text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                                    <span className="w-1.5 h-1.5 bg-[#0F5FDC] dark:bg-blue-400 rounded-full mt-2.5 mr-3 flex-shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-12 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                    <HelpCircle className="text-[#0F5FDC] dark:text-blue-400 mr-2" size={24} /> Câu hỏi thường gặp (FAQ)
                </h2>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full flex justify-between items-center text-left font-bold text-slate-700 dark:text-slate-300 hover:text-[#0F5FDC] dark:hover:text-blue-400 transition-colors py-2 text-lg"
                            >
                                <span>{faq.q}</span>
                                {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {openFaq === idx && (
                                <p className="mt-2 text-base text-slate-500 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-[#0F5FDC] dark:border-blue-500">
                                    {faq.a}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                <p className="text-sm font-bold text-red-500 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center justify-center">
                    <AlertTriangle size={16} className="mr-2 animate-bounce" /> CẢNH BÁO VI PHẠM
                </p>
                <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                    Mọi hành vi vi phạm quy định sẽ bị lập biên bản, đình chỉ quyền truy cập và xử lý theo quy chế bảo mật của công ty.
                </p>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={() => setAgreed(!agreed)}
                    className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center ${
                        agreed
                            ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                            : 'bg-[#0F5FDC] hover:bg-blue-500 text-white shadow-blue-500/20'
                    }`}
                >
                    {agreed ? <CheckCircle size={20} className="mr-2" /> : null}
                    {agreed ? 'Đã Cam Kết Tuân Thủ' : 'Tôi Đã Đọc Và Cam Kết Tuân Thủ'}
                </button>
            </div>
        </div>
    );
};

export default RulesPage;
