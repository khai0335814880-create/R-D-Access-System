import React, { useState, useEffect, useRef } from 'react';
import QRScanner from '../components/QRScanner';
import { accessService } from '../services/accessService';
import { 
  ShieldCheck, 
  User, 
  Laptop, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  History,
  Info,
  Scan
} from 'lucide-react';
import Alert from '../components/Alert';

const SecurityVerifyPage = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [lastScanned, setLastScanned] = useState(null);

  // Audio effects
  const successAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'));
  const errorAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));

  const handleScan = async (decodedText) => {
    if (loading || decodedText === lastScanned) return;
    
    setLoading(true);
    setLastScanned(decodedText);
    try {
      // identifier is passed as is. If JSON, backend handles it.
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/access/verify/${encodeURIComponent(decodedText)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
      
      const data = await response.json();
      setVerificationData(data);
      
      if (data.verificationResult.deviceMatch === false) {
        errorAudio.current.play();
        setMessage('CẢNH BÁO: Thiết bị KHÔNG KHỚP với nhân viên này!');
        setMessageType('error');
      } else {
        successAudio.current.play();
        setMessage('Thông tin hợp lệ.');
        setMessageType('success');
      }
      
      setIsScanning(false);
    } catch (err) {
      errorAudio.current.play();
      setMessage(err.message || 'Lỗi hệ thống khi đối soát');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setVerificationData(null);
    setIsScanning(true);
    setLastScanned(null);
    setMessage('');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
          <ShieldCheck className="text-indigo-600 mr-3" size={36} /> TRẠM ĐỐI SOÁT AN NINH
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Xác thực nhân viên và thiết bị tại cổng ra vào phòng R&D</p>
      </div>

      {message && (
        <div className="mb-6">
          <Alert message={message} type={messageType} onClose={() => setMessage('')} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Side */}
        <div className="bg-slate-900 rounded-none p-8 shadow-2xl border-4 border-slate-800 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
           {/* Radar decoration */}
           <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-indigo-500/10 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-indigo-500/20 rounded-full"></div>
           </div>

           {isScanning ? (
              <div className="w-full max-w-md z-10">
                <div className="text-center mb-6">
                   <div className="inline-block p-4 bg-indigo-500/10 rounded-full text-indigo-400 mb-4">
                      <Scan size={32} />
                   </div>
                   <h2 className="text-xl font-bold text-white mb-2">Đang Đợi Quét...</h2>
                   <p className="text-slate-500 text-sm">Vui lòng quét Thẻ Nhân Viên hoặc Mã QR Thiết Bị</p>
                </div>
                <div className="rounded-none overflow-hidden border-2 border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                   <QRScanner onScanSuccess={handleScan} />
                </div>
              </div>
           ) : (
              <div className="text-center z-10 w-full animate-in zoom-in-95 duration-300">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${verificationData?.verificationResult.deviceMatch === false ? 'bg-rose-500/20 text-rose-500 border-2 border-rose-500' : 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500'}`}>
                   {verificationData?.verificationResult.deviceMatch === false ? <XCircle size={48} /> : <CheckCircle2 size={48} />}
                </div>
                <h2 className="text-2xl font-black text-white mb-8">KẾT QUẢ ĐỐI SOÁT</h2>
                <button 
                  onClick={resetScanner}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-none font-bold transition shadow-lg shadow-indigo-600/30"
                >
                  QUÉT TIẾP THEO
                </button>
              </div>
           )}
        </div>

        {/* Results Info Side */}
        <div className="space-y-6">
           {verificationData ? (
             <div className="bg-white rounded-none shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-right-8 duration-500">
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200">
                      {verificationData.session?.entry_photo ? (
                        <img src={verificationData.session.entry_photo} className="w-full h-full object-cover" alt="Check-in Face" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                           <User size={32} />
                        </div>
                      )}
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-900">{verificationData.user.full_name}</h3>
                      <p className="text-slate-500 text-sm">@{verificationData.user.username} • {verificationData.user.employee_id}</p>
                   </div>
                   <div className="ml-auto">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${verificationData.verificationResult.isInside ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                         {verificationData.verificationResult.isInside ? 'ĐANG TRONG PHÒNG' : 'CHƯA CHECK-IN'}
                      </span>
                   </div>
                </div>

                <div className="p-8">
                   {/* Context Alert for Device Match */}
                   {verificationData.verificationResult.scannedDevice && (
                     <div className={`mb-8 p-4 rounded-none border flex items-start ${verificationData.verificationResult.deviceMatch ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                        <div className="mr-3 mt-1">
                           {verificationData.verificationResult.deviceMatch ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div>
                           <p className="font-bold uppercase text-[10px] tracking-widest mb-1">Thiết bị vừa quét</p>
                           <p className="text-lg font-black">
                              {verificationData.verificationResult.scannedDevice.brand} {verificationData.verificationResult.scannedDevice.model}
                           </p>
                           <p className="text-xs opacity-70">S/N: {verificationData.verificationResult.scannedDevice.serial_number}</p>
                           {!verificationData.verificationResult.deviceMatch && (
                             <p className="mt-2 font-bold text-sm bg-rose-600 text-white px-3 py-1 rounded-none inline-block">
                                LỖI: THIẾT BỊ NÀY THUỘC VỀ NGƯỜI KHÁC HOẶC CHƯA DUYỆT
                             </p>
                           )}
                        </div>
                     </div>
                   )}

                   <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-4 flex items-center">
                      <Laptop size={14} className="mr-2" /> Danh sách thiết bị được phép mang vào
                   </h4>
                   <div className="space-y-3">
                      {verificationData.approvedDevices.map(device => {
                        const isScanned = verificationData.verificationResult.scannedDevice?.id === device.id;
                        return (
                          <div key={device.id} className={`p-4 rounded-none border flex items-center justify-between transition-all ${isScanned ? 'bg-emerald-50 border-emerald-500 shadow-md scale-[1.02]' : 'bg-white border-slate-100'}`}>
                             <div className="flex items-center">
                                <div className={`p-2 rounded-none mr-4 ${isScanned ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                   {device.device_type === 'Laptop' ? <Laptop size={18} /> : <Smartphone size={18} />}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-800">{device.brand} {device.model}</p>
                                   <p className="text-[10px] font-mono text-slate-400">{device.serial_number}</p>
                                </div>
                             </div>
                             {isScanned ? (
                               <div className="flex items-center text-emerald-600 font-bold text-xs">
                                  <CheckCircle2 size={16} className="mr-1" /> KHỚP
                               </div>
                             ) : (
                               <div className="text-slate-300">
                                  <ChevronRight size={18} />
                               </div>
                             )}
                          </div>
                        )
                      })}
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-white rounded-none border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center h-full">
                <History size={64} className="text-slate-200 mb-6" />
                <h3 className="text-xl font-bold text-slate-400">Đang đợi dữ liệu đối soát...</h3>
                <p className="text-slate-300 mt-2 max-w-xs">Quét mã QR nhân viên hoặc thiết bị để bắt đầu quy trình xác thực</p>
             </div>
           )}

           {/* Quick Stats/Info */}
           <div className="bg-indigo-600 rounded-none p-8 text-white shadow-xl relative overflow-hidden shadow-indigo-600/30">
              <div className="relative z-10 flex items-center gap-6">
                 <div className="bg-white/20 p-4 rounded-none backdrop-blur-md">
                    <ShieldCheck size={32} />
                 </div>
                 <div>
                    <h3 className="font-black text-xl leading-tight">CHẾ ĐỘ AN NINH CAO</h3>
                    <p className="text-indigo-100 text-sm mt-1">Mọi dữ liệu ra vào đều được mã hóa và lưu nhật ký đối soát 24/7.</p>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ping {
          75%, 100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      ` }} />
    </div>
  );
};

export default SecurityVerifyPage;
