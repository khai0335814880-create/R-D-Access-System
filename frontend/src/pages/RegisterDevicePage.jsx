import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceStore } from '../store/deviceStore';
import { Laptop, Smartphone, MonitorSmartphone, Camera, RotateCcw, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';

const RegisterDevicePage = () => {
    const { createDevice, isLoading } = useDeviceStore();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        device_type: 'Laptop',
        brand: '',
        model: '',
        serial_number: '',
        mac_address: '',
        description: '',
    });
    const [committed, setCommitted] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Camera State
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const startCamera = async () => {
        setCameraActive(true);
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: 640, height: 480 } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access denied", err);
            setError("Không thể truy cập Camera. Vui lòng kiểm tra quyền ứng dụng.");
            setCameraActive(false);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(dataUrl);
        stopCamera();
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setCameraActive(false);
    };

    const retakePhoto = () => {
        setPhoto(null);
        startCamera();
    };

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!committed) return;
        if (!photo) {
            setError('Bạn bắt buộc phải chụp ảnh thiết bị để đăng ký!');
            return;
        }
        setError('');
        
        try {
            await createDevice({
                ...formData,
                device_photo: photo // Send base64 photo
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/devices');
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thiết bị thất bại.');
        }
    };

    return (
        <div className="px-6 md:px-12 py-8 w-full relative z-10 animate-in fade-in duration-700">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center justify-center md:justify-start">
                    <Camera className="text-[#0F5FDC] dark:text-blue-400 mr-3" size={36} /> Đăng Ký Thiết Bị
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Khai báo thiết bị cá nhân để mang vào khu vực R&D.</p>
            </div>

            {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-xl animate-in zoom-in duration-500">
                    <CheckCircle size={64} className="mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold mb-2">Đăng Ký Thành Công!</h2>
                    <p className="text-sm font-medium text-slate-400">Thiết bị đã được phê duyệt tự động. Đang chuyển hướng về danh sách...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Device Photo Section */}
                    <div className="md:col-span-1 flex flex-col items-center space-y-6">
                        <div className="w-full flex flex-col items-center">
                            <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative shadow-xl group">
                                {photo ? (
                                    <img src={photo} alt="Captured device" className="w-full h-full object-cover animate-in fade-in" />
                                ) : cameraActive ? (
                                    <video ref={(el) => {
                                        videoRef.current = el;
                                        if (el && stream && el.srcObject !== stream) {
                                            el.srcObject = stream;
                                        }
                                    }} autoPlay playsInline className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-6">
                                        <Camera size={48} className="text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Chưa có ảnh thiết bị</p>
                                    </div>
                                )}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>

                            {error && <p className="text-xs font-bold text-red-500 mt-2 text-center">{error}</p>}

                            <div className="mt-4 w-full">
                                {photo ? (
                                    <button
                                        type="button"
                                        onClick={retakePhoto}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700/50 transition-all text-sm"
                                    >
                                        <RotateCcw size={16} /> Chụp lại ảnh
                                    </button>
                                ) : cameraActive ? (
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-sm animate-pulse"
                                    >
                                        <Camera size={16} /> Bấm để Chụp
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700/50 transition-all text-sm"
                                    >
                                        <Camera size={16} /> Chụp ảnh thiết bị
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Workflow Stepper Widget */}
                        <div className="w-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/50 shadow-xl">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Quy Trình Phê Duyệt</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-500/10 text-[#0F5FDC] dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold border border-blue-500/20 mt-0.5">1</div>
                                    <div>
                                        <p className="text-base font-bold text-slate-700 dark:text-slate-300">Khai báo thông tin</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Điền Model, Serial và chụp ảnh thực tế.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-3 pb-2">
                                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center text-sm font-bold border border-slate-200 dark:border-slate-700 mt-0.5">2</div>
                                    <div>
                                        <p className="text-base font-bold text-slate-400 dark:text-slate-500">Hệ thống xét duyệt</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5 font-medium">Duyệt tự động hoặc Admin kiểm tra.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center text-sm font-bold border border-slate-200 dark:border-slate-700 mt-0.5">3</div>
                                    <div>
                                        <p className="text-base font-bold text-slate-400 dark:text-slate-500">Phát sinh QR Code</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5 font-medium">Dán mã định danh lên thiết bị.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Device Form Details */}
                    <div className="md:col-span-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50 flex flex-col justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Loại Thiết Bị <span className="text-red-500">*</span></label>
                                <select
                                    name="device_type"
                                    value={formData.device_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none transition text-slate-800 dark:text-white font-medium text-base"
                                >
                                    <option value="Laptop">Laptop / Máy tính xách tay</option>
                                    <option value="Phone">Điện thoại di động</option>
                                    <option value="Tablet">Máy tính bảng</option>
                                    <option value="Desktop">Desktop / PC</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Thương Hiệu (Hãng) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    placeholder="VD: Apple, Dell, Samsung"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none transition text-slate-800 dark:text-white font-medium text-base"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tên Dòng Máy (Model) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    placeholder="VD: MacBook Pro 14 M2 2023"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none transition text-slate-800 dark:text-white font-medium text-base"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Số Serial Number <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="serial_number"
                                    value={formData.serial_number}
                                    onChange={handleInputChange}
                                    placeholder="Ghi dưới đáy máy / trong About"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none font-mono text-base uppercase text-slate-800 dark:text-white font-bold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Địa chỉ MAC (Tùy chọn)</label>
                                <input
                                    type="text"
                                    name="mac_address"
                                    value={formData.mac_address}
                                    onChange={handleInputChange}
                                    placeholder="VD: 00:1A:2B:3C:4D:5E"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none font-mono text-base uppercase text-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú thêm</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Đặc điểm nhận dạng, màu sắc..."
                                    rows="2"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-[#0F5FDC] outline-none resize-none text-slate-800 dark:text-white font-medium text-base"
                                ></textarea>
                            </div>
                            
                            <div className="md:col-span-2 flex items-start gap-3 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                <input
                                    type="checkbox"
                                    id="commitment"
                                    checked={committed}
                                    onChange={(e) => setCommitted(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-[#0F5FDC] bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-[#0F5FDC] flex-shrink-0"
                                    required
                                />
                                <label htmlFor="commitment" className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                                    <span className="text-red-500 flex items-center font-extrabold"><AlertTriangle size={14} className="mr-1" /> TÔI XÁC THỰC CAM KẾT:</span> Tôi cam kết chịu trách nhiệm bảo mật và tuân thủ tuyệt đối các quy định khi mang thiết bị này vào phòng R&D.
                                </label>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/devices')}
                                className="px-6 py-3 font-bold text-base text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all"
                            >
                                Hủy Bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !committed}
                                className="bg-[#0F5FDC] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-base"
                            >
                                {isLoading ? (
                                    <><div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></div> Đang Đăng Ký...</>
                                ) : 'Xác Nhận Đăng Ký'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default RegisterDevicePage;
