import React, { useEffect, useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { deviceService } from '../services/deviceService';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QrCode, Printer, Download, Laptop, Smartphone, User, Contact, FileText } from 'lucide-react';

const DeviceQRTagsPage = () => {
    const { devices, fetchMyDevices, isLoading } = useDeviceStore();
    const { user } = useAuthStore();
    const [qrImages, setQrImages] = useState({});
    const [personalQR, setPersonalQR] = useState('');
    const [loadingQRs, setLoadingQRs] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        fetchMyDevices();
        fetchPersonalQR();
    }, [fetchMyDevices]);

    const fetchPersonalQR = async () => {
        try {
            const data = await authService.getMyQR();
            setPersonalQR(data.qrImage);
        } catch (err) {
            console.error("Failed to fetch personal QR", err);
        }
    };

    const handleDownloadBadge = async () => {
        const badgeElement = document.getElementById('personal-badge');
        if (!badgeElement) return;

        try {
            const canvas = await html2canvas(badgeElement, {
                backgroundColor: null,
                scale: 3, // Higher quality
                useCORS: true,
                logging: false,
                borderRadius: 40
            });
            
            const link = document.createElement('a');
            link.download = `RD_Badge_${user?.username || 'user'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to download badge", err);
        }
    };

    const handleDownloadPDF = async () => {
        const badgeElement = document.getElementById('personal-badge');
        if (!badgeElement || !personalQR) return;

        setIsGeneratingPDF(true);
        try {
            const canvas = await html2canvas(badgeElement, {
                scale: 4,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [85.6, 54] // Standard ID card size CR80 (Credit Card)
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 54, 85.6);
            pdf.save(`RD_Access_Badge_${user?.username || 'user'}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF badge", err);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    useEffect(() => {
        const approvedDevices = devices.filter(d => d.status === 'approved');
        if (approvedDevices.length > 0) {
            loadAllQRs(approvedDevices);
        }
    }, [devices]);

    const loadAllQRs = async (approvedDevices) => {
        setLoadingQRs(true);
        const images = {};
        for (const device of approvedDevices) {
            try {
                const data = await deviceService.getDeviceQR(device.id);
                images[device.id] = data.qrImage;
            } catch (err) {
                console.error(`Failed to load QR for device ${device.id}`, err);
            }
        }
        setQrImages(images);
        setLoadingQRs(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadDeviceQR = (device, qrData) => {
        if (!qrData) return;
        const link = document.createElement('a');
        link.download = `QR_${device.brand}_${device.model}_${device.serial_number}.png`;
        link.href = qrData;
        link.click();
    };

    const approvedDevices = devices.filter(d => d.status === 'approved');

    if (isLoading) return <div className="py-20"><LoadingSpinner message="Đang tải danh sách thiết bị..." /></div>;

    return (
        <div className="px-6 md:px-12 py-8 w-full min-h-screen relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 print:hidden">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center">
                        <QrCode className="text-[#0F5FDC] dark:text-blue-400 mr-3 animate-pulse" size={36} /> Mã Định Danh Thiết Bị
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Tải xuống hoặc in mã QR để dán lên thiết bị cá nhân của bạn.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handlePrint}
                        className="bg-[#0F5FDC] hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition flex items-center shadow-lg shadow-blue-500/20 text-base"
                    >
                        <Printer size={20} className="mr-2" /> In Tất Cả Nhãn
                    </button>
                </div>
            </div>

            {/* PERSONAL BADGE SECTION */}
            <div className="mb-12">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 flex items-center">
                            <Contact className="mr-2 text-[#0F5FDC] dark:text-blue-400" size={24} /> Thẻ Định Danh Nhân Viên (My Digital Badge)
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownloadBadge}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white font-bold text-base flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl transition print:hidden border border-transparent dark:border-slate-700"
                        >
                            <Download size={18} className="mr-2" /> PNG
                        </button>
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            className="text-white hover:bg-blue-600 font-bold text-base flex items-center bg-[#0F5FDC] px-4 py-2 rounded-xl transition print:hidden shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            {isGeneratingPDF ? (
                                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                            ) : (
                                <FileText size={18} className="mr-2" />
                            )}
                            Tải về Thẻ (.PDF)
                        </button>
                    </div>
                </div>
                
                <div id="personal-badge" className="max-w-md mx-auto bg-gradient-to-br from-[#0F5FDC] to-indigo-700 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden group">
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
                    
                    <div className="bg-white dark:bg-slate-950 rounded-[2.3rem] p-8 flex flex-col items-center text-center transition-colors duration-300">
                        <div className="w-full flex justify-between items-start mb-6">
                            <div className="text-left">
                                <p className="text-xs font-black text-[#0F5FDC] dark:text-blue-400 uppercase tracking-widest mb-1">R&D ACCESS PASS</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{user?.full_name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-base font-medium">@{user?.username} • {user?.role?.toUpperCase()}</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-slate-900 p-3 rounded-2xl border border-transparent dark:border-slate-800">
                                <User size={24} className="text-[#0F5FDC] dark:text-blue-400" />
                            </div>
                        </div>

                        <div className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800/50 p-6 rounded-3xl mb-6 shadow-inner flex items-center justify-center aspect-square max-w-[240px] mx-auto">
                            {personalQR ? (
                                <img src={personalQR} alt="Personal Badge" className="w-full h-auto object-contain" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-300 dark:text-slate-700">
                                    <QrCode size={48} className="animate-pulse" />
                                    <span className="text-sm font-bold mt-2">ĐANG KHỞI TẠO...</span>
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-4">
                            <div className="py-3 px-6 bg-slate-900 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl flex justify-between items-center text-white">
                                <span className="text-xs font-bold opacity-60 uppercase tracking-wider">Employee ID</span>
                                <span className="font-mono font-bold tracking-widest text-blue-400 text-base">{user?.employee_id || 'RD-USR-99'}</span>
                            </div>
                            
                            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium px-4 leading-relaxed">
                                Sử dụng mã này để quét tại trạm Kiosk khi bắt đầu hoặc kết thúc ca làm việc tại phòng thí nghiệm R&D.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/50 pt-10 mb-8">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center">
                    <QrCode className="mr-2 text-[#0F5FDC] dark:text-blue-400" size={24} /> Danh Mục Mã QR Thiết Bị Đã Duyệt
                </h2>
            </div>

            {approvedDevices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {approvedDevices.map((device) => (
                        <div key={device.id} className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800/50 p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-sm hover:shadow-xl print:shadow-none print:border-slate-300 print:m-4">
                            {/* Decorative badge for print context */}
                            <div className="absolute top-0 right-0 bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity print:hidden border-l border-b border-transparent dark:border-slate-800">
                                RD-ACCESS-VERIFIED
                            </div>

                            <div className="w-full mb-6 flex justify-between items-start">
                                <div className="text-left">
                                    <p className="text-xs font-bold text-[#0F5FDC] dark:text-blue-400 uppercase tracking-widest mb-1">Thiết bị R&D</p>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{device.brand} {device.model}</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-transparent dark:border-slate-800">
                                    {device.device_type === 'Laptop' ? <Laptop size={20} className="text-slate-400" /> : <Smartphone size={20} className="text-slate-400" />}
                                </div>
                            </div>
                            
                            <div className="w-full bg-white dark:bg-white border-2 border-slate-50 dark:border-slate-950 p-4 rounded-2xl mb-6 shadow-inner flex items-center justify-center min-h-[200px]">
                                {qrImages[device.id] ? (
                                    <img src={qrImages[device.id]} alt={device.model} className="w-full h-auto aspect-square object-contain" />
                                ) : (
                                    <div className="animate-pulse text-slate-300 flex flex-col items-center">
                                        <QrCode size={48} />
                                        <span className="text-sm font-semibold mt-2">Đang tạo...</span>
                                    </div>
                                )}
                            </div>

                            <div className="w-full text-left space-y-1">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mã định danh (S/N)</p>
                                <p className="font-mono text-base font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/40 truncate">
                                    {device.serial_number}
                                </p>
                            </div>

                            <div className="mt-8 w-full flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-4 print:hidden">
                                <p className="text-sm text-slate-400 dark:text-slate-500">ID: #{device.id}</p>
                                <button 
                                    onClick={() => handleDownloadDeviceQR(device, qrImages[device.id])}
                                    className="text-[#0F5FDC] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-base flex items-center"
                                >
                                    <Download size={16} className="mr-1" /> Tải về (.PNG)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/60 p-20 text-center">
                    <QrCode size={64} className="text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">Chưa có thiết bị nào được duyệt</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Mã QR chỉ hiển thị sau khi thiết bị của bạn được Quản lý phê duyệt.</p>
                </div>
            )}

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, header, aside, .print\\:hidden { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; background: white !important; }
                    body { background: white !important; }
                }
            ` }} />
        </div>
    );
};

export default DeviceQRTagsPage;
