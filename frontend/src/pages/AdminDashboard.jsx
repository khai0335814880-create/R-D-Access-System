import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { deviceService } from '../services/deviceService';
import { accessService } from '../services/accessService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Laptop, Clock, Shield, ArrowRight, UserPlus, Settings, Activity } from 'lucide-react';

const COLORS = ['#0F5FDC', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [occupancy, setOccupancy] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, devicesData, occupancyData, activityData] = await Promise.all([
        userService.getAllUsers(),
        deviceService.getAllDevices().catch(() => ({ devices: [] })),
        accessService.getCurrentOccupancy().catch(() => ({ occupancy: 0 })),
        accessService.getRecentActivity(10).catch(() => ({ activity: [] }))
      ]);

      setUsers(usersData || []);
      setDevices(devicesData.devices || []);
      setOccupancy(occupancyData.occupancy || 0);
      setRecentLogs(activityData.activity || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
      setError('Không thể tải dữ liệu quản trị. Vui lòng kiểm tra lại kết nối.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner message="Đang tải dữ liệu quản trị hệ thống..." /></div>;

  // Process data for charts
  const roleData = Object.entries(
    users.reduce((acc, u) => {
      const role = u.role === 'admin' ? 'Quản Trị' : u.role === 'security' ? 'Bảo Vệ' : 'Kỹ Sư';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const deviceData = Object.entries(
    devices.reduce((acc, d) => {
      const type = d.device_type || 'Khác';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-8 max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center">
            <Shield className="text-[#0F5FDC] dark:text-blue-400 mr-3" size={36} /> Quản Trị Hệ Thống
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Bảng điều khiển dành riêng cho Quản trị viên R&D Access.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/users')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm transition-all flex items-center border border-slate-200 dark:border-slate-700"
          >
            <UserPlus size={18} className="mr-2" /> Thêm Nhân Sự
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="px-4 py-2 bg-[#0F5FDC] hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all flex items-center shadow-md shadow-blue-500/20"
          >
            <Settings size={18} className="mr-2" /> Cấu Hình
          </button>
        </div>
      </div>

      {error && <div className="mb-6"><Alert message={error} type="error" /></div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl flex items-center justify-between transition-all hover:border-blue-500/30">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-wider">Tổng Nhân Sự</p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-2 font-mono">{users.length}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-[#0F5FDC] dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Users size={28} />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl flex items-center justify-between transition-all hover:border-blue-500/30">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-wider">Tổng Thiết Bị</p>
            <p className="text-4xl font-black text-slate-800 dark:text-white mt-2 font-mono">{devices.length}</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-[#0F5FDC] dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Laptop size={28} />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl flex items-center justify-between transition-all hover:border-emerald-500/30">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-wider">Đang Trong Phòng</p>
            <p className="text-4xl font-black text-emerald-500 mt-2 font-mono">{occupancy}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-200 dark:border-emerald-500/20">
            <Clock size={28} />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl flex items-center justify-between transition-all hover:border-violet-500/30">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-wider">Trạng Thái</p>
            <div className="flex items-center mt-3">
              <span className="flex h-3 w-3 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">Online</p>
            </div>
          </div>
          <div className="w-14 h-14 bg-violet-50 dark:bg-violet-500/10 rounded-full flex items-center justify-center text-violet-500 border border-violet-200 dark:border-violet-500/20">
            <Activity size={28} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            Cơ Cấu Nhân Sự
          </h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            Thống Kê Loại Thiết Bị
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} />
                <Bar dataKey="value" fill="#0F5FDC" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            Hoạt Động Truy Cập Gần Đây
          </h2>
          <button 
            onClick={() => navigate('/activity')}
            className="text-sm font-bold text-[#0F5FDC] dark:text-blue-400 hover:underline flex items-center"
          >
            Xem tất cả <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Nhân Viên</th>
                <th className="py-3 px-4">Hành Động</th>
                <th className="py-3 px-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                  <td className="py-3 px-4 font-semibold">{log.full_name || log.username || 'Unknown'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      log.status === 'checked_in' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}>
                      {log.status === 'checked_in' ? 'Check-In' : 'Check-Out'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-500">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-slate-400 dark:text-slate-600">Chưa có hoạt động nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
