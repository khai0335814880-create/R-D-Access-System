import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceStore } from '../store/deviceStore';
import { useAuthStore } from '../store/authStore';
import { accessService } from '../services/accessService';
import Alert from '../components/Alert';
import QRScanner from '../components/QRScanner';
import CameraCapture from '../components/CameraCapture';
import { User, ShieldCheck, LogOut, ArrowRight, Laptop, Smartphone, AlertTriangle, MonitorSmartphone, QrCode, ScanFace, Camera, Trash2, Plus, X, Zap, Shield, Globe, CheckCircle } from 'lucide-react';
export const CheckInPage = () => {
  const { approvedDevices, fetchApprovedDevices, isLoading: loadingDevices } = useDeviceStore();
  const { user, logout, qrLogin, socket, connectSocket } = useAuthStore();
  const navigate = useNavigate();

  const [selectedDevices, setSelectedDevices] = useState([]);
  const [verifiedDevices, setVerifiedDevices] = useState([]); // Track which devices are physically scanned
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [showScanner, setShowScanner] = useState(true);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [fallbackId, setFallbackId] = useState('');
  const [entryPhoto, setEntryPhoto] = useState(null);

  // Trạng thái Success Lock màn hình trong 4s
  const [actionSuccess, setActionSuccess] = useState(null); // 'checkin' | 'checkout' | null

  // Security Pledge state
  const [agreedToPledge, setAgreedToPledge] = useState(false);

  const supabaseChannelRef = useRef(null);

  const [showQuickReg, setShowQuickReg] = useState(false);
  const [quickRegData, setQuickRegData] = useState({
    device_type: 'Laptop',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    description: '',
  });
  const [quickRegPhoto, setQuickRegPhoto] = useState(null);
  const [quickRegStatus, setQuickRegStatus] = useState('idle'); // idle, pending, approved, rejected

  const quickRegDataRef = useRef(quickRegData);
  useEffect(() => {
    quickRegDataRef.current = quickRegData;
  }, [quickRegData]);


  useEffect(() => {
    connectSocket();

    if (socket) {
      socket.on('quick_register_confirm_update', (payload) => {
        if (payload.serial_number === quickRegDataRef.current.serial_number) {
          setQuickRegStatus('approved');
          setSelectedDevices(prev => [...prev, payload.device.id]);
          setVerifiedDevices(prev => [...prev, payload.device.id]);
          setShowQuickReg(false);
          setMessage('Đăng ký nhanh thành công! Thiết bị đã được thêm vào danh sách.');
          setMessageType('success');
        }
      });

      socket.on('quick_register_reject_update', (payload) => {
        if (payload.serial_number === quickRegDataRef.current.serial_number) {
          setQuickRegStatus('rejected');
          setMessage('Đăng ký nhanh bị Bảo vệ từ chối.');
          setMessageType('error');
        }
      });
    }

    if (user && user.role === 'engineer') {
      fetchApprovedDevices();
      checkCurrentStatus();
    }

    return () => {
      if (socket) {
        socket.off('quick_register_confirm_update');
        socket.off('quick_register_reject_update');
      }
    };
  }, [user, fetchApprovedDevices, connectSocket]);

  const broadcastKioskScan = (data) => {
    // Socket.io
    socket?.emit('kiosk_scan', data);
  };

  const handleQuickRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!quickRegPhoto) {
      setMessage('Vui lòng chụp ảnh thiết bị!');
      setMessageType('error');
      return;
    }

    setQuickRegStatus('pending');
    setMessage('Đang gửi thông tin lên Bảo vệ. Vui lòng đợi...');
    setMessageType('info');

    // Socket.io emit
    socket?.emit('quick_register_request', {
      user_id: user?.id,
      full_name: user?.full_name,
      ...quickRegData,
      device_photo: quickRegPhoto
    });
  };

  const checkCurrentStatus = async () => {

    try {
      const { status } = await accessService.getCurrentStatus();
      if (status === 'checked_in') {
        setCheckedIn(true);
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  };

  const handleDeviceToggle = (deviceId) => {
    setSelectedDevices((prev) => {
      const newSelected = prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId];

      // If we unselect a device, also remove it from verified list
      if (prev.includes(deviceId)) {
        setVerifiedDevices(v => v.filter(id => id !== deviceId));
      }
      return newSelected;
    });
  };

  const handleEmployeeQRSuccess = async (decodedText) => {
    setLoading(true);
    setMessage('');
    try {
      await qrLogin(decodedText);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Thẻ không hợp lệ. Vui lòng liên hệ Bảo vệ.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (!fallbackId.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      // Simulate qrLogin using just the username/ID as stringified JSON 
      const mockQrData = JSON.stringify({ userId: null, username: fallbackId });
      await qrLogin(mockQrData);
    } catch (err) {
      setMessage('Mã số không hợp lệ hoặc tài khoản bị khóa.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceQRSuccess = async (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      if (data && data.deviceId) {
        // String conversion ensure robust comparison
        const scannedId = String(data.deviceId);
        const matchedDevice = approvedDevices.find(d => String(d.id) === scannedId);

        if (matchedDevice) {
          // Tự động thêm vào danh sách đã chọn
          setSelectedDevices((prev) => {
            if (!prev.includes(matchedDevice.id)) {
              return [...prev, matchedDevice.id];
            }
            return prev;
          });

          setVerifiedDevices((prev) => {
            if (!prev.includes(matchedDevice.id)) {
              setMessage(`✅ ĐÃ QUÉT: ${matchedDevice.brand} ${matchedDevice.model} thành công.`);
              setMessageType('success');

              broadcastKioskScan({
                user: user?.full_name || 'Unknown',
                device: `${matchedDevice.brand} ${matchedDevice.model}`,
                device_photo: matchedDevice.device_photo,
                status: 'valid'
              });
              return [...prev, matchedDevice.id];
            } else {
              setMessage('Thông báo: Thiết bị này đã quét rồi.');
              setMessageType('info');
              return prev;
            }
          });
        } else {
          setMessage('🚨 CẢNH BÁO: Thiết bị không thuộc quyền sở hữu của bạn!');
          setMessageType('error');
          broadcastKioskScan({
            user: user?.full_name || 'Unknown',
            device: 'CẢNH BÁO: MANG THIẾT BỊ NGƯỜI KHÁC',
            status: 'mismatch'
          });
        }
      } else {
        throw new Error('Invalid format');
      }
    } catch (e) {
      setMessage('🚨 CẢNH BÁO: QR KHÔNG HỢP LỆ!');
      setMessageType('error');
      broadcastKioskScan({
        user: user?.full_name || 'Unknown',
        device: 'QUÉT MÃ LẠ',
        status: 'mismatch'
      });
    }
  };

  const handleEndSession = () => {
    logout();
    setAgreedToPledge(false);
    setSelectedDevices([]);
    setVerifiedDevices([]);
    setCheckedIn(false);
    setMessage('');
    setEntryPhoto(null);
  };

  const handleCheckIn = async () => {
    if (!agreedToPledge) {
      setMessage('Vui lòng đồng ý với Cam kết Bảo mật trước khi Check-in!');
      setMessageType('error');
      return;
    }
    if (!entryPhoto) {
      setMessage('Vui lòng chụp ảnh xác thực gương mặt trước khi Check-in!');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await accessService.checkIn(selectedDevices, entryPhoto);
      setActionSuccess('checkin');
      setCheckedIn(true);
      setSelectedDevices([]);
      setVerifiedDevices([]);

      // Notify guard that check-in is COMPLETE
      broadcastKioskScan({
        user: user?.full_name || 'Engineer',
        device: `VỪA CHECK-IN (${selectedDevices.length} máy)`,
        status: 'success'
      });

      // Tự động log out màn hình Kiosk sau 4 giây để nhường cho người tiếp theo
      setTimeout(() => {
        setActionSuccess(null);
        handleEndSession();
      }, 4000);

    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-in thất bại. Vui lòng thử lại.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await accessService.checkOut();
      setActionSuccess('checkout'); // KHÓA GIAO DIỆN Ở CHẾ ĐỘ SUCCESS
      setCheckedIn(false);
      setSelectedDevices([]);

      // Notify guard that check-out is COMPLETE
      broadcastKioskScan({
        user: user?.full_name || 'Engineer',
        device: 'VỪA CHECK-OUT',
        status: 'success'
      });

      // Tự động thoát sau 4 giây khi checkout thành công tại kiosk
      setTimeout(() => {
        setActionSuccess(null);
        handleEndSession();
      }, 4000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Check-out thất bại.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'laptop': return <Laptop size={32} />;
      case 'phone': return <Smartphone size={32} />;
      default: return <MonitorSmartphone size={32} />;
    }
  };

  // KIOSK IDLE SCREEN - WHEN NO ONE IS LOGGED IN
  if (!user || user.role !== 'engineer') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-['Inter',sans-serif] relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.4]"
          style={{ backgroundImage: "url('/kiosk_bg.png')" }}
        />
        {/* Dark overlay with the original radial mesh */}
        <div 
          className="absolute inset-0 z-0"
          style={{ background: 'radial-gradient(circle at 20% 20%, rgba(26, 42, 108, 0.8), rgba(11, 15, 26, 0.95) 60%)' }}
        />
        <style>{`
          @keyframes scan {
            0% { top: 0%; }
            100% { top: 100%; }
          }
          @keyframes custom-glow {
            from { box-shadow: 0 0 10px rgba(99,102,241,0.4); }
            to { box-shadow: 0 0 25px rgba(99,102,241,0.8); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-scan-line {
            animation: scan 3s infinite linear;
          }
          .animate-custom-glow {
            animation: custom-glow 2.5s infinite alternate;
          }
          .animate-spin-slow {
            animation: spin-slow 40s linear infinite;
          }
          .animate-spin-mid {
            animation: spin-slow 18s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 25s linear infinite;
          }
        `}</style>

        {/* TECH BACKGROUND LAYERS */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] pointer-events-none z-0">
          {/* Layer 1: Glow (Ánh sáng nền) */}
          <div 
            className="absolute inset-0 rounded-full blur-[100px] opacity-40 animate-pulse"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 60%)' }}
          />
          <div 
            className="absolute inset-20 rounded-full blur-[60px] opacity-30"
            style={{ background: 'radial-gradient(circle, #00f0ff 0%, transparent 60%)' }}
          />

          {/* Layer 2: Ring (Vòng tròn nét) */}
          <svg className="absolute inset-0 w-full h-full animate-spin-slow opacity-30" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#6366f1" strokeWidth="0.4" strokeDasharray="5 15 25 15" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="0.6" strokeDasharray="10 5 2 5" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#00f0ff" strokeWidth="0.2" strokeDasharray="30 20 5 10" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="#6366f1" strokeWidth="0.3" strokeDasharray="4 8" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-spin-reverse opacity-25" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="40 10 10 40" />
            <circle cx="50" cy="50" r="43" fill="none" stroke="#00f0ff" strokeWidth="0.4" strokeDasharray="15 30 10 5" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="0.1" strokeDasharray="2 4" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-spin-mid opacity-20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="49" fill="none" stroke="#ffffff" strokeWidth="0.2" strokeDasharray="1 10 2 10" />
            <circle cx="50" cy="50" r="41" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="5 45 10 5" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#00f0ff" strokeWidth="0.4" strokeDasharray="12 24" />
          </svg>

          {/* Layer 3: Particle / Grid (Chi tiết tech) */}
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{ 
              backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-indigo-500/10 rounded-full animate-pulse flex items-center justify-center">
             <div className="w-[450px] h-[450px] border border-cyan-500/10 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Centralized Card */}
        <div className="z-10 bg-[#060b19]/80 backdrop-blur-[20px] p-10 rounded-[32px] shadow-[0_0_0_1px_rgba(37,99,235,0.3),0_20px_60px_rgba(0,0,0,0.8)] border border-blue-500/20 text-center max-w-[720px] w-full mx-4 relative hover:-translate-y-1 transition-transform duration-300">

          {/* Top Header Row - Center Logo */}
          <div className="relative flex justify-center items-center mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] mb-3">
                <Shield size={24} className="animate-pulse" />
              </div>
              <div className="text-center">
                <span className="text-[#e2e8f0] font-black text-sm tracking-[0.1em]">R&D ACCESS</span>
                <span className="block text-[9px] text-blue-400 tracking-[0.3em] font-bold uppercase mt-1">— SYSTEM —</span>
              </div>
            </div>
            
            {/* Language Selector Dropdown Mock */}
            <div className="absolute right-0 top-0 flex items-center gap-1.5 bg-[#0f172a]/50 border border-slate-700/40 text-slate-300 text-xs px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-800 transition">
              <Globe size={14} className="text-blue-400 mr-0.5" />
              <span>Tiếng Việt</span>
              <span className="text-[8px] ml-1 opacity-50">▼</span>
            </div>
          </div>

          {/* Titles */}
          <h1 className="text-4xl md:text-[48px] font-black text-white tracking-wider uppercase mb-4">R&D KIOSK ACCESS</h1>
          <p className="text-sm md:text-base font-bold text-indigo-400 tracking-[0.1em] uppercase mb-6">
            HỆ THỐNG QUẢN LÝ RA VÀO R&D ACCESS SYSTEM
          </p>
          <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed mb-10">
            Hệ thống quản lý ra vào an ninh nghiêm ngặt.<br />
            Vui lòng quét MÃ QR ĐỊNH DANH để xác thực danh tính.
          </p>

          {message && (
            <div className="mb-6 max-w-md mx-auto">
              <Alert message={message} type={messageType} onClose={() => setMessage('')} duration={5000} />
            </div>
          )}

          {/* Camera Frame */}
          <div className="camera-box my-6 mx-auto relative rounded-2xl overflow-hidden border-2 border-blue-500/50 shadow-[0_0_25px_rgba(37,99,235,0.3)] max-w-lg">

            <div className="bg-[#040817]/80 p-0 shadow-inner overflow-hidden relative">
              {fallbackMode ? (
                <form onSubmit={handleManualLogin} className="py-8 px-4">
                  <p className="text-slate-300 font-semibold mb-4 text-center text-sm">Chế Độ Khẩn Cấp (Fallback)</p>
                  <input
                    type="text"
                    value={fallbackId}
                    onChange={(e) => setFallbackId(e.target.value)}
                    placeholder="Nhập Mã Nhân Viên (vd: engineer1)"
                    className="w-full text-center px-4 py-3 rounded-xl border border-indigo-500/50 bg-[#070d1a] text-white text-lg font-mono mb-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 shadow-inner"
                    autoFocus
                  />
                  <div className="flex space-x-3">
                    <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-95 rounded-xl font-bold text-white text-sm transition disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                      {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
                    </button>
                    <button type="button" onClick={() => setFallbackMode(false)} className="px-5 py-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl font-bold text-slate-300 text-sm transition">HỦY</button>
                  </div>
                </form>
              ) : (
                <div className="relative">
                  {/* Moving Scan Line */}
                  <div className="scan-line absolute left-0 right-0 h-[2.5px] bg-[#00f0ff] animate-scan-line z-20 shadow-[0_0_15px_#00f0ff]"></div>

                  {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center relative z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                      <p className="text-indigo-400 font-bold tracking-widest text-xs uppercase animate-pulse">Đang xác thực thẻ...</p>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] flex items-center justify-center bg-black/40 rounded-xl overflow-hidden relative z-10">
                      <QRScanner onScanSuccess={handleEmployeeQRSuccess} actionText="Đưa MÃ QR THẺ vào khung" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Instruction */}
          <div className="text-center mt-6">
            <p className="instruction text-blue-400 font-bold text-lg md:text-xl flex items-center justify-center gap-2 tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              ĐƯA MÃ QR ĐỊNH DANH VÀO KHUNG
            </p>
            <p className="text-xs md:text-sm text-slate-400 mt-2 tracking-wide font-medium">Hệ thống sẽ tự động đối chiếu thông tin mã QR</p>
            {!fallbackMode && (
              <button
                onClick={() => setFallbackMode(true)}
                className="text-slate-500 hover:text-blue-400 underline text-xs mt-5 transition font-semibold tracking-wider uppercase block mx-auto"
              >
                CAMERA LỖI? NHẬP MÃ THỦ CÔNG
              </button>
            )}
          </div>

          {/* Features Section */}
          <div className="features flex justify-between gap-4 bg-[#0a101f]/60 border border-slate-800/40 p-5 rounded-2xl mt-12">
            <div className="item flex-1 flex items-center gap-3 text-left">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                <Shield size={24} />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-extrabold text-white tracking-wide">BẢO MẬT TUYỆT ĐỐI</span>
                <span className="block text-[11px] text-slate-400 mt-1 leading-tight">Mã QR mã hóa bảo mật</span>
              </div>
            </div>

            <div className="item flex-1 flex items-center gap-3 text-left">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                <Zap size={24} />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-extrabold text-white tracking-wide">NHANH CHÓNG</span>
                <span className="block text-[11px] text-slate-400 mt-1 leading-tight">Xác thực trong 1 giây</span>
              </div>
            </div>

            <div className="item flex-1 flex items-center gap-3 text-left">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                <CheckCircle size={24} />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-extrabold text-white tracking-wide">AN TOÀN</span>
                <span className="block text-[11px] text-slate-400 mt-1 leading-tight">Mã hóa an toàn dữ liệu</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ACTIVE CHECK-IN FORM (When user is scanned and valid)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background Image with overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/kiosk_bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/40 via-slate-900/60 to-slate-950/90" />
      {/* Top Banner - Avatar & Info */}
      <div className="bg-slate-900/80 backdrop-blur-md shadow-xl border-b border-slate-800/80 p-6 flex justify-between items-center z-10 relative">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center border-4 border-blue-400 shadow-lg">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{user?.full_name || 'Engineer'}</h1>
            <p className="text-blue-300 text-lg uppercase tracking-wider font-semibold">
              Kiosk Access Terminal
            </p>
          </div>
        </div>
        <div className="text-right">
          <button
            onClick={handleEndSession}
            className="flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-lg font-semibold transition-colors"
          >
            <LogOut className="mr-3" /> Kết Thúc / Next User
          </button>
        </div>
      </div>

      {/* Main Kiosk Content */}
      <div className="flex-1 container mx-auto p-8 max-w-5xl flex flex-col justify-center z-10 relative">
        {message && (
          <div className="mb-8">
            <Alert
              message={message}
              type={messageType}
              onClose={() => setMessage('')}
              duration={6000}
            />
          </div>
        )}

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-slate-800/50 relative overflow-hidden">

          {/* MÀN HÌNH SUCCESS PHỦ KÍN KHI THAO TÁC THÀNH CÔNG */}
          {actionSuccess && (
            <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col justify-center items-center text-center p-12">
              <div className="w-40 h-40 bg-green-500/20 rounded-full flex flex-col items-center justify-center mb-8 relative">
                <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-30"></div>
                <ShieldCheck size={80} className="text-green-500" />
              </div>
              {actionSuccess === 'checkin' ? (
                <>
                  <h2 className="text-5xl font-extrabold text-white mb-6 uppercase tracking-wider text-green-400">Cửa Đang Mở</h2>
                  <p className="text-2xl text-slate-300">Vui lòng bước vào phòng. Chúc bạn làm việc hiệu quả!</p>
                </>
              ) : (
                <>
                  <h2 className="text-5xl font-extrabold text-white mb-6 uppercase tracking-wider text-blue-400">Tạm Biệt</h2>
                  <p className="text-2xl text-slate-300">Bạn đã Check-out rời phòng. Hẹn gặp lại!</p>
                </>
              )}
              <p className="fixed bottom-10 text-slate-500 font-mono">Phiên của bạn sẽ kết thúc trong giây lát...</p>
            </div>
          )}

          {/* Status Badge */}
          <div className={`absolute top-0 left-0 w-full p-3 text-center font-bold text-xl tracking-widest uppercase ${checkedIn ? 'bg-green-600' : 'bg-blue-600'}`}>
            {checkedIn ? 'TRẠNG THÁI: ĐANG TRONG PHÒNG (CHECKED IN)' : 'TRẠNG THÁI: CHUẨN BỊ VÀO PHÒNG (CHECKED OUT)'}
          </div>

          <div className="mt-8">
            {!checkedIn ? (
              <div className="space-y-10">
                <div className="bg-slate-700/30 p-8 rounded-3xl border border-slate-600/50">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white flex items-center">
                      <QrCode className="text-blue-500 mr-3" size={32} />
                      1. Quét QR Thiết Bị Mang Vào
                    </h2>
                    <span className="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-sm font-bold border border-blue-500/30">
                      {verifiedDevices.length} đã quét
                    </span>
                  </div>

                  <div className="max-w-md mx-auto mb-8">
                    <QRScanner
                      onScanSuccess={handleDeviceQRSuccess}
                      actionText="Đang chờ quét mã hiệu thiết bị..."
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">Thiết bị đã quét:</h3>
                  {verifiedDevices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {verifiedDevices.map((deviceId) => {
                        const device = approvedDevices.find(d => d.id === deviceId);
                        if (!device) return null;
                        return (
                          <div
                            key={device.id}
                            className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 flex items-center justify-between animate-in zoom-in"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-3 rounded-xl bg-blue-600 text-white">
                                {device.device_type === 'Laptop' ? <Laptop size={24} /> : <Smartphone size={24} />}
                              </div>
                              <div>
                                <p className="font-bold text-white text-lg">{device.brand} {device.model}</p>
                                <p className="text-sm text-slate-400 font-mono">SN: {device.serial_number}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">ĐÃ QUÉT</span>
                              <button
                                onClick={() => {
                                  setSelectedDevices(prev => prev.filter(id => id !== device.id));
                                  setVerifiedDevices(prev => prev.filter(id => id !== device.id));
                                }}
                                className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 p-6 rounded-2xl text-center border border-dashed border-slate-700">
                      <MonitorSmartphone size={32} className="mx-auto mb-2 text-slate-600 opacity-30" />
                      <p className="text-slate-400 text-sm">Chưa có thiết bị nào được quét.</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setShowQuickReg(true)}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                    >
                      <Plus className="mr-2" size={20} /> Đăng Ký Nhanh Thiết Bị Mới
                    </button>
                  </div>
                </div>


                {/* Step 2: Facial Recognition */}
                <div className="bg-slate-700/30 p-8 rounded-3xl border border-slate-600/50 mb-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
                        <Camera className="text-blue-500 mr-3" size={32} />
                        2. Xác Thực Gương Mặt (ID Photo)
                      </h2>
                      <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                        Vui lòng nhìn vào Camera và nhấn biểu tượng máy ảnh để chụp ảnh đối chiếu hồ sơ.
                      </p>
                    </div>
                    <div className="w-full md:w-auto">
                      <CameraCapture onCapture={(img) => setEntryPhoto(img)} />
                    </div>
                  </div>
                </div>

                {/* Step 3: Security Pledge */}
                <div className="bg-slate-700/40 p-8 rounded-2xl border border-slate-600 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <ShieldCheck className="text-green-500 mr-3" size={32} />
                    3. Cam Kết Bảo Mật An Ninh Tòa Nhà
                  </h2>
                  <label className="flex items-start space-x-4 cursor-pointer mt-6 p-4 rounded-xl hover:bg-slate-700/80 transition-colors">
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        className="w-8 h-8 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-500 cursor-pointer"
                        checked={agreedToPledge}
                        onChange={(e) => setAgreedToPledge(e.target.checked)}
                      />
                    </div>
                    <div className="text-lg text-slate-300 leading-relaxed">
                      Tôi xác nhận <strong>đã quét xác minh đầy đủ</strong> các thiết bị mang vào. Tôi cam kết tuân thủ tuyệt đối quy định an ninh thông tin, không chụp ảnh/quay phim bên trong.
                    </div>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="space-y-4">
                  {!entryPhoto && <p className="text-amber-500 text-center font-bold animate-pulse text-sm">⚠️ Vui lòng chụp ảnh chân dung (Bước 2)</p>}
                  {!agreedToPledge && <p className="text-amber-500 text-center font-bold text-sm">⚠️ Hãy tích vào ô Cam kết bảo mật (Bước 3)</p>}

                  <button
                    onClick={handleCheckIn}
                    disabled={loading || !agreedToPledge || !entryPhoto}
                    className={`w-full py-6 rounded-2xl text-2xl font-bold tracking-wide transition-all shadow-xl flex items-center justify-center ${agreedToPledge && entryPhoto && !loading
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/40 hover:scale-[1.02]'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                  >
                    {loading ? 'ĐANG XỬ LÝ...' : (
                      <>XÁC NHẬN VÀ CHECK-IN VÀO PHÒNG <ArrowRight className="ml-3" size={32} /></>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                  <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
                  <ShieldCheck size={70} className="text-green-500" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">Bạn Đã Hoàn Thành Công Việc?</h2>
                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Đảm bảo bạn đã mang theo đầy đủ các thiết bị lúc Check-in. Nhấn nút bên dưới để ghi nhận rời khỏi phòng R&D và kết thúc phiên truy cập an toàn.
                </p>

                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="w-full max-w-md mx-auto py-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl text-2xl font-bold tracking-wide transition-all hover:scale-[1.05] shadow-2xl shadow-red-600/30 mb-8"
                >
                  {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN CHECK-OUT'}
                </button>

                <p className="text-slate-500 text-lg flex items-center justify-center">
                  <AlertTriangle className="mr-2" size={24} />
                  Hệ thống bảo vệ sẽ yêu cầu kiểm tra balo tại cửa từ (nếu có).
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Quick Registration Modal */}
        {showQuickReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => quickRegStatus !== 'pending' && setShowQuickReg(false)}></div>
            <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl z-10 overflow-hidden flex flex-col border border-slate-700 max-h-[90vh]">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div>
                  <h2 className="text-2xl font-bold text-white">Đăng Ký Nhanh Thiết Bị Tại Kiosk</h2>
                  <p className="text-slate-400 text-sm mt-1">Vui lòng nhập thông tin và chụp ảnh thiết bị để Bảo vệ xác nhận</p>
                </div>
                {quickRegStatus !== 'pending' && (
                  <button onClick={() => setShowQuickReg(false)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition">
                    <X size={24} />
                  </button>
                )}
              </div>

              <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {/* Form Info */}
                <div>
                  <form id="quickRegForm" onSubmit={handleQuickRegisterSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Loại Thiết Bị <span className="text-red-500">*</span></label>
                      <select
                        name="device_type"
                        value={quickRegData.device_type}
                        onChange={(e) => setQuickRegData({ ...quickRegData, device_type: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition"
                        disabled={quickRegStatus === 'pending'}
                      >
                        <option value="Laptop">Laptop / Máy tính xách tay</option>
                        <option value="Phone">Điện thoại di động</option>
                        <option value="Tablet">Máy tính bảng</option>
                        <option value="Other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Thương Hiệu <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={quickRegData.brand}
                        onChange={(e) => setQuickRegData({ ...quickRegData, brand: e.target.value })}
                        placeholder="VD: Apple, Asus, HP"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition"
                        required
                        disabled={quickRegStatus === 'pending'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Dòng Máy (Model) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={quickRegData.model}
                        onChange={(e) => setQuickRegData({ ...quickRegData, model: e.target.value })}
                        placeholder="VD: Vivobook X15"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition"
                        required
                        disabled={quickRegStatus === 'pending'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Số Serial Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={quickRegData.serial_number}
                        onChange={(e) => setQuickRegData({ ...quickRegData, serial_number: e.target.value })}
                        placeholder="Nhập chính xác Serial Number"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-mono uppercase transition"
                        required
                        disabled={quickRegStatus === 'pending'}
                      />
                    </div>
                  </form>
                </div>

                {/* Camera Capture */}
                <div className="flex flex-col justify-center">
                  <p className="text-sm font-semibold text-slate-300 mb-4 text-center flex items-center justify-center">
                    <Camera size={16} className="mr-2 text-blue-500" /> Chụp Ảnh Thiết Bị <span className="text-red-500 ml-1">*</span>
                  </p>
                  <CameraCapture onCapture={(image) => setQuickRegPhoto(image)} />
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex gap-4 justify-end">
                {quickRegStatus === 'pending' ? (
                  <div className="flex items-center text-amber-500 font-bold animate-pulse text-lg py-3 px-6">
                    <div className="animate-spin w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full mr-3"></div>
                    ĐANG ĐỢI BẢO VỆ XÁC NHẬN TRÊN DASHBOARD...
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowQuickReg(false)}
                      className="px-6 py-3 font-semibold text-slate-300 hover:bg-slate-700 rounded-xl transition"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      form="quickRegForm"
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg shadow-amber-500/20 flex items-center"
                    >
                      Gửi Xác Nhận Đăng Ký
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
