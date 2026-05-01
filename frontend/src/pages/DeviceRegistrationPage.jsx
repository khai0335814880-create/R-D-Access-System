import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDeviceStore } from '../store/deviceStore';
import { deviceService } from '../services/deviceService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { Laptop, Smartphone, MonitorSmartphone, Plus, X, QrCode, Shield, Clock, XCircle, CheckCircle2 } from 'lucide-react';

export const DeviceRegistrationPage = () => {
  const { devices, createDevice, fetchMyDevices, isLoading, error } = useDeviceStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    device_type: 'Laptop',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    description: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [activeQRUrl, setActiveQRUrl] = useState('');
  const [activeDeviceName, setActiveDeviceName] = useState('');
  const [saving, setSaving] = useState(false);
  const [committed, setCommitted] = useState(false);


  const handleShowQR = async (device) => {
    try {
      if (device.status !== 'approved') return;
      const data = await deviceService.getDeviceQR(device.id);
      setActiveQRUrl(data.qrImage);
      setActiveDeviceName(`${device.brand} ${device.model}`);
      setShowQR(true);
    } catch (error) {
      console.error("Failed to load device QR", error);
    }
  };

  useEffect(() => {
    fetchMyDevices();
    
    // Automatically open form if coming from /register-device link
    if (location.pathname === '/register-device') {
      setShowForm(true);
    }
  }, [fetchMyDevices, location.pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDevice(formData);
      setSuccessMessage('Đăng ký thiết bị thành công! Thiết bị đã được phê duyệt tự động.');

      setFormData({
        device_type: 'Laptop',
        brand: '',
        model: '',
        serial_number: '',
        mac_address: '',
        description: '',
      });
      setShowForm(false);
      await fetchMyDevices();
    } catch (err) {
      console.error('Failed to create device:', err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 size={18} className="mr-1" />, label: 'Đã Duyệt' };
      case 'pending':
        return { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock size={18} className="mr-1" />, label: 'Chờ Duyệt' };
      case 'rejected':
        return { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: <XCircle size={18} className="mr-1" />, label: 'Từ Chối' };
      default:
        return { color: 'bg-slate-800 text-slate-400 border-slate-700', icon: null, label: 'Unknown' };
    }
  };

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'laptop': return <Laptop size={40} className="text-blue-500" />;
      case 'phone': return <Smartphone size={40} className="text-indigo-500" />;
      default: return <MonitorSmartphone size={40} className="text-slate-500" />;
    }
  };

  const stats = {
    total: devices?.length || 0,
    approved: devices?.filter((d) => d.status === 'approved').length || 0,
    pending: devices?.filter((d) => d.status === 'pending').length || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans relative overflow-hidden p-8 transition-colors duration-300">
      {/* Dynamic Background Image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-5 dark:opacity-20"
        style={{ backgroundImage: "url('/kiosk_bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-100/50 via-slate-50/60 to-slate-100/90 dark:from-slate-950/80 dark:via-slate-900/90 dark:to-slate-950" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header & Stats */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Danh Mục Thiết Bị</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Quản lý các thiết bị cá nhân được phép mang vào phòng R&D</p>
          </div>
          <button
            onClick={() => navigate('/register-device')}
            className="bg-[#0F5FDC] hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center active:scale-[0.98]"
          >
            <Plus size={20} className="mr-2" /> Đăng Ký Thiết Bị Mới
          </button>
        </div>

        {(successMessage || error) && (
          <div className="mb-8">
            {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage('')} />}
            {error && <Alert message={error} type="error" onClose={() => {}} />}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl flex items-center justify-between transition-all duration-300 hover:border-blue-500/30">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-wider">Tổng Thiết Bị</p>
              <p className="text-4xl font-black text-slate-800 dark:text-white mt-2 font-mono">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
              <MonitorSmartphone size={28} />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-xl flex items-center justify-between text-white transition-all duration-300">
            <div>
              <p className="text-emerald-100 font-medium uppercase text-xs tracking-wider">Đã Được Phê Duyệt</p>
              <p className="text-4xl font-black mt-2 font-mono">{stats.approved}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Shield size={28} />
            </div>
          </div>
        </div>

      {/* Device Grid */}
      <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Danh Sách Của Tôi</h2>
      
      {isLoading && devices.length === 0 ? (
        <LoadingSpinner message="Đang tải danh sách thiết bị..." />
      ) : devices && devices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => {
            const statusStyle = getStatusConfig(device.status);
            return (
              <div key={device.id} className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50 overflow-hidden flex flex-col hover:border-blue-500/30 transition-all hover:translate-y-[-4px]">
                {device.device_photo && (
                  <div className="w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/50">
                    <img src={device.device_photo} alt={`${device.brand} ${device.model}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center ${statusStyle.color}`}>
                      {statusStyle.icon} {statusStyle.label}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{device.brand} {device.model}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{device.device_type}</p>
                  
                  <div className="space-y-2 mt-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100/50 dark:border-slate-800/50 p-4 rounded-xl">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Số Serial:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{device.serial_number}</span>
                    </div>
                    {device.mac_address && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">MAC:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{device.mac_address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">
                    ĐÃ TẠO: {new Date(device.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  
                  {device.status === 'approved' ? (
                    <button
                       onClick={() => handleShowQR(device)}
                       className="text-[#0F5FDC] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-xs flex items-center bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition"
                    >
                      <QrCode size={14} className="mr-1" /> Phát sinh QR Code
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">Chờ cấp QR</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/60 p-16 text-center transition-colors duration-300">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-slate-500">
            <MonitorSmartphone size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Chưa Có Thiết Bị Nào</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto font-medium">Bạn vẫn chưa đăng ký thiết bị nào vào hệ thống. Vui lòng bấm vào nút Đăng ký để khai báo thiết bị cá nhân mang vào phòng R&D.</p>
          <button
            onClick={() => navigate('/register-device')}
            className="bg-[#0F5FDC] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            Đăng Ký Khai Báo Ngay
          </button>
        </div>
      )}

      {/* Floating Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl transition-all duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Đăng Ký Thiết Bị Mới</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Vui lòng điền chính xác thông tin để được phê duyệt nhanh</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <form id="deviceForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Loại Thiết Bị <span className="text-red-500">*</span></label>
                    <select
                      name="device_type"
                      value={formData.device_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none transition text-slate-800 dark:text-white"
                    >
                      <option value="Laptop">Laptop / Máy tính xách tay</option>
                      <option value="Phone">Điện thoại di động</option>
                      <option value="Tablet">Máy tính bảng</option>
                      <option value="Desktop">Desktop / PC</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Thương Hiệu (Hãng) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="VD: Apple, Dell, Samsung"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none transition text-slate-800 dark:text-white font-medium"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tên Dòng Máy (Model) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="VD: MacBook Pro 14 M2 2023"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none transition text-slate-800 dark:text-white font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Số Serial Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="serial_number"
                      value={formData.serial_number}
                      onChange={handleInputChange}
                      placeholder="Ghi dưới đáy máy / trong About"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none font-mono text-sm uppercase text-slate-800 dark:text-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Địa chỉ MAC (Tùy chọn)</label>
                    <input
                      type="text"
                      name="mac_address"
                      value={formData.mac_address}
                      onChange={handleInputChange}
                      placeholder="VD: 00:1A:2B:3C:4D:5E"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none font-mono text-sm uppercase text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ghi chú thêm</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Đặc điểm nhận dạng, màu sắc..."
                      rows="2"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none resize-none text-slate-800 dark:text-white font-medium"
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-2 flex items-start gap-3 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 mt-4">
                    <input
                      type="checkbox"
                      id="commitment"
                      checked={committed}
                      onChange={(e) => setCommitted(e.target.checked)}
                      className="mt-1.5 w-5 h-5 text-[#0F5FDC] bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-[#0F5FDC] flex-shrink-0"
                      required
                    />
                    <label htmlFor="commitment" className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                      TÔI XÁC THỰC CAM KẾT: Tôi cam kết chịu trách nhiệm bảo mật và tuân thủ tuyệt đối các quy định khi mang thiết bị này vào phòng R&D.
                    </label>
                  </div>
                </div>
              </form>

            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex gap-4 justify-end">
               <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 font-bold text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  form="deviceForm"
                  type="submit"
                  disabled={saving || !committed}
                  className="bg-[#0F5FDC] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >

                  {saving ? (
                    <><div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div> Đang Lưu...</>
                  ) : 'Xác Nhận Đăng Ký'}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowQR(false)}></div>
          <div className="bg-slate-900 border border-slate-800/50 p-10 rounded-2xl shadow-2xl relative w-full max-w-sm text-center z-10 backdrop-blur-xl">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition border border-slate-700/50"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Mã QR Thiết Bị</h2>
            <p className="text-slate-400 font-bold mb-8 bg-slate-950/50 border border-slate-800/50 py-2 px-4 rounded-xl inline-block font-mono text-sm">{activeDeviceName}</p>
            
            <div className="bg-white border-8 border-slate-950 p-4 rounded-xl mx-auto shadow-sm">
                {activeQRUrl ? (
                  <img src={activeQRUrl} alt="Device QR Code" className="w-full h-auto aspect-square object-contain" />
                ) : (
                  <div className="w-full aspect-square bg-slate-950 flex flex-col items-center justify-center text-slate-400 rounded-xl">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full mb-3"></div>
                    <span className="text-sm font-bold">Đang tải mã...</span>
                  </div>
                )}
            </div>
            
            <p className="text-sm text-slate-400 mt-8 leading-relaxed font-bold">Sử dụng mã QR này trực tiếp tại Kiosk phòng R&D để xác thực thiết bị mang vào.</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DeviceRegistrationPage;
