import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Briefcase, Hash, Shield, Key, Camera, Loader, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
  const { user: storeUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      setProfile(response.data.user);
      // Đồng bộ lại với store nếu cần
      updateUser({ ...storeUser, ...response.data.user });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh phải nhỏ hơn 2MB.');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;

        // Gọi API cập nhật
        const response = await api.put('/auth/profile', {
          avatar_url: base64String
        });

        setProfile(response.data.user);
        updateUser({ ...storeUser, avatar_url: base64String });

        setSuccessMsg('Đã cập nhật ảnh đại diện thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      alert('Cập nhật ảnh thất bại.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center">
          <User className="text-[#0F5FDC] dark:text-blue-400 mr-3" size={36} /> Tài khoản của tôi
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Quản lý hồ sơ định danh và đồng bộ dữ liệu hệ thống.</p>
      </div>

      {successMsg && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-2xl flex items-center shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="mr-3" size={24} />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-800/50 relative overflow-hidden flex flex-col md:flex-row">

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl pointer-events-none"></div>

        {/* Sidebar / Avatar Section */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-50/50 dark:bg-slate-950/40 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50 relative z-10">

          <div className="relative group cursor-pointer" onClick={triggerFileInput}>
            <div className={`w-40 h-40 rounded-full p-[4px] shadow-lg transition-all duration-300 ${uploading ? 'bg-slate-300 animate-pulse' : 'bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 group-hover:-translate-y-1 group-hover:shadow-blue-500/25'}`}>
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center overflow-hidden relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-6xl">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </span>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="text-white mb-2" size={28} />
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">Đổi ảnh</span>
                </div>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="mt-8 text-center">
            <span className="px-5 py-2 bg-blue-50 dark:bg-blue-900/30 text-[#0F5FDC] dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-800 shadow-sm inline-block">
              {profile.role}
            </span>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium tracking-tight">@{profile.username}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 lg:p-12 relative z-10 flex flex-col justify-center">
          <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white leading-tight">{profile.full_name}</h2>
            <div className="flex items-center mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-emerald-500/50"></span>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">Hồ sơ đã đồng bộ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">

            <div className="group flex items-start space-x-4 p-4 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <div className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl text-blue-500 group-hover:-translate-y-1 transition-transform">
                <Mail size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Địa chỉ Email</p>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 break-all">{profile.email}</p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <div className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl text-indigo-500 group-hover:-translate-y-1 transition-transform">
                <Briefcase size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phòng ban công tác</p>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{profile.department || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <div className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl text-purple-500 group-hover:-translate-y-1 transition-transform">
                <Hash size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Mã nhân viên (ID)</p>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{profile.employee_id || 'N/A'}</p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <div className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl text-emerald-500 group-hover:-translate-y-1 transition-transform">
                <Shield size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Trạng thái định danh</p>
                <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                  Hợp lệ (Verified)
                </p>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-8 flex gap-4">
            <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <Key size={18} className="mr-2" />
              Đổi mật khẩu bảo mật
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
