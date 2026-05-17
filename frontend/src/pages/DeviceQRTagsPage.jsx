import React, { useEffect, useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { deviceService } from '../services/deviceService';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguageStore } from '../store/languageStore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QrCode, Printer, Download, Laptop, Smartphone, User, Contact, FileText, ShieldCheck, ChevronRight } from 'lucide-react';

const DeviceQRTagsPage = () => {
    const { t } = useLanguageStore();
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
                scale: 3,
                useCORS: true,
                logging: false,
                borderRadius: 16
            });
            const link = document.createElement('a');
            link.download = `RD_Access_Credential_${user?.username || 'user'}.png`;
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
                format: [85.6, 54] 
            });
            pdf.addImage(imgData, 'PNG', 0, 0, 54, 85.6);
            pdf.save(`RD_Access_Credential_${user?.username || 'user'}.pdf`);
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
                const data = await deviceService.getDeviceQR(device.device_id);
                images[device.device_id] = data.qrImage;
            } catch (err) {
                console.error(`Failed to load QR for device ${device.device_id}`, err);
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
        link.download = `TAG_${device.brand}_${device.serial_number}.png`;
        link.href = qrData;
        link.click();
    };

    const approvedDevices = devices.filter(d => d.status === 'approved');

    if (isLoading) return <div className="min-h-screen bg-canvas flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-xl mb-xxl print:hidden">
                <div>
                    <h1 className="text-display-md tracking-tight mb-xs">{t('qr_tags.credential_management')}</h1>
                    <p className="text-body-md text-charcoal">{t('qr_tags.credential_management_desc')}</p>
                </div>
                <button 
                    onClick={handlePrint}
                    className="bg-ink text-on-ink px-xl py-sm rounded-md font-bold hover:bg-charcoal transition flex items-center gap-sm shadow-soft-lift"
                >
                    <Printer size={18} /> {t('qr_tags.print_all_tags')}
                </button>
            </div>

            {/* EMPLOYEE CREDENTIAL SECTION */}
            <div className="mb-xxxl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-xl mb-xl pb-xl border-b border-fog">
                    <div className="flex items-center gap-xs text-primary">
                        <Contact size={24} />
                        <h2 className="text-display-xs text-ink">{t('qr_tags.personnel_credential')}</h2>
                    </div>
                    <div className="flex gap-sm print:hidden">
                        <button onClick={handleDownloadBadge} className="px-md py-sm bg-cloud text-ink font-bold rounded-md border border-fog hover:bg-fog transition text-caption-bold flex items-center gap-xs">
                            <Download size={16} /> PNG
                        </button>
                        <button 
                            onClick={handleDownloadPDF} disabled={isGeneratingPDF}
                            className="bg-primary text-on-ink px-xl py-sm rounded-md font-bold hover:bg-primary-deep transition shadow-soft-lift flex items-center gap-xs text-caption-bold"
                        >
                            {isGeneratingPDF ? <div className="animate-spin w-4 h-4 border-2 border-on-ink/30 border-t-on-ink rounded-full"></div> : <FileText size={16} />}
                            {t('qr_tags.export_pdf_credential')}
                        </button>
                    </div>
                </div>
                
                <div id="personal-badge" className="max-w-md mx-auto bg-paper border border-fog rounded-xl shadow-floating overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                    <div className="p-xl pt-xxl flex flex-col items-center text-center">
                        <div className="w-full flex justify-between items-start mb-xxl text-left">
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-xxs">{t('qr_tags.secure_ingress_credential')}</p>
                                <h3 className="text-display-xs text-ink leading-tight">{user?.full_name}</h3>
                                <p className="text-caption-md text-charcoal mt-xs font-mono uppercase tracking-widest">{user?.role} / {user?.username}</p>
                            </div>
                            <div className="w-12 h-12 bg-cloud rounded-full flex items-center justify-center border border-fog">
                                <User size={24} className="text-primary" />
                            </div>
                        </div>

                        <div className="w-full bg-cloud border border-fog p-xl rounded-md mb-xl flex items-center justify-center aspect-square max-w-[220px] mx-auto shadow-sm">
                            {personalQR ? (
                                <img src={personalQR} alt={t('qr_tags.personnel_identity_qr')} className="w-full h-auto object-contain" />
                            ) : (
                                <div className="flex flex-col items-center text-graphite opacity-30 italic">
                                    <QrCode size={48} className="animate-pulse" />
                                    <span className="text-[10px] font-bold mt-sm uppercase tracking-widest">{t('qr_tags.initializing')}</span>
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-md">
                            <div className="py-sm px-md bg-ink text-on-ink rounded flex justify-between items-center font-mono">
                                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t('qr_tags.directory_id')}</span>
                                <span className="text-caption-bold tracking-widest text-primary">{user?.employee_id || 'HCL_RD_01'}</span>
                            </div>
                            <p className="text-[10px] text-charcoal font-bold uppercase tracking-widest leading-relaxed border-t border-fog pt-md">
                                {t('qr_tags.authorized_lab_level')} {user?.role?.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-xl pb-xl border-b border-fog flex items-center gap-xs text-primary print:hidden">
                <QrCode size={24} />
                <h2 className="text-display-xs text-ink">{t('qr_tags.hardware_asset_identifiers')}</h2>
            </div>

            {approvedDevices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
                    {approvedDevices.map((device) => (
                        <div key={device.device_id} className="bg-paper border border-fog rounded-xl p-xl flex flex-col items-center text-center relative overflow-hidden group hover:border-primary transition-all shadow-soft-lift print:shadow-none print:border-ink print:m-md">
                            <div className="absolute top-0 right-0 bg-ink text-on-ink text-[8px] font-bold px-sm py-xxs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                {t('qr_tags.rd_verified_asset')}
                            </div>

                            <div className="w-full mb-xl flex justify-between items-start text-left">
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-xxs">{t('qr_tags.physical_asset')}</p>
                                    <h3 className="text-body-emphasis text-ink leading-tight">{device.brand} {device.model_name}</h3>
                                </div>
                                <div className="w-10 h-10 bg-cloud rounded flex items-center justify-center border border-fog">
                                    {device.device_type === 'Laptop' ? <Laptop size={18} className="text-graphite" /> : <Smartphone size={18} className="text-graphite" />}
                                </div>
                            </div>
                            
                            <div className="w-full bg-white border border-fog p-md rounded-md mb-xl flex items-center justify-center min-h-[180px] shadow-sm">
                                {qrImages[device.device_id] ? (
                                    <img src={qrImages[device.device_id]} alt={device.model_name} className="w-full h-auto aspect-square object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center text-graphite opacity-30 italic">
                                        <QrCode size={32} className="animate-pulse" />
                                        <span className="text-[10px] font-bold mt-sm uppercase tracking-widest">{t('qr_tags.generating')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="w-full text-left space-y-xxs">
                                <p className="text-[10px] font-bold text-graphite uppercase tracking-widest">{t('qr_tags.chassis_serial')}</p>
                                <p className="font-mono text-caption-bold text-ink bg-cloud px-md py-sm rounded border border-fog truncate">
                                    {device.serial_number}
                                </p>
                            </div>

                            <div className="mt-xl w-full flex items-center justify-between border-t border-fog pt-md print:hidden">
                                <p className="text-[10px] font-bold text-graphite uppercase tracking-widest">UID: #{device.device_id}</p>
                                <button 
                                    onClick={() => handleDownloadDeviceQR(device, qrImages[device.device_id])}
                                    className="text-primary hover:text-primary-deep font-bold text-caption-bold flex items-center gap-xxs"
                                >
                                    <Download size={14} /> {t('qr_tags.download_tag')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-cloud rounded-xl border-2 border-dashed border-fog p-xxxl text-center">
                    <QrCode size={48} className="text-graphite opacity-20 mx-auto mb-xl" />
                    <h3 className="text-body-emphasis text-ink mb-xs">{t('qr_tags.no_verified_assets')}</h3>
                    <p className="text-caption-md text-charcoal">{t('qr_tags.no_verified_assets_desc')}</p>
                </div>
            )}

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
