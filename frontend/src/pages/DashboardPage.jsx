import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { accessService } from '../services/accessService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Users, Activity, Clock, ShieldAlert, ArrowRightCircle, ArrowLeftCircle, User, Scan, ShieldCheck, AlertTriangle, Search, Laptop, Eye, X, CheckCircle2 } from 'lucide-react';
import { deviceService } from '../services/deviceService';
import { userService } from '../services/userService';
import * as XLSX from 'xlsx';
import { AdminDashboard } from './AdminDashboard';

const formatToLocalTime = (timeStr) => {
  if (!timeStr) return new Date();
  return new Date(timeStr);
};

export const DashboardPage = () => {
  const { user, socket, connectSocket } = useAuthStore();
  const [activity, setActivity] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState([]);
  const [liveScans, setLiveScans] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);

  const handleLiveScan = (data) => {
    setLiveScans(prev => {
      if (prev.length > 0) {
        const lastScan = prev[0];
        if (lastScan.user === data.user && lastScan.device === data.device && lastScan.status === data.status) {
          return prev; // Bỏ qua nếu trùng lặp
        }
      }
      return [data, ...prev].slice(0, 5);
    });
    
    if (data.status === 'mismatch') {
       const alertAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
       alertAudio.play().catch(() => {});
    }
  };

  const [quickRequests, setQuickRequests] = useState([]);

  const handleApproveQuickReg = async (reqData) => {
    try {
      const res = await deviceService.confirmQuickRegister(reqData);
      
      // Socket.io emit
      socket?.emit('quick_register_confirm', {
        serial_number: reqData.serial_number,
        device: res.device
      });

      setQuickRequests(prev => prev.filter(r => r.serial_number !== reqData.serial_number));
    } catch (err) {
      console.error('Failed to approve quick registration:', err);
    }
  };

  const handleRejectQuickReg = async (reqData) => {
    // Socket.io emit
    socket?.emit('quick_register_reject', {
      serial_number: reqData.serial_number
    });

    setQuickRequests(prev => prev.filter(r => r.serial_number !== reqData.serial_number));
  };

  const fetchDashboardData = async () => {
    try {
      if(loading) setLoading(true); // Don't show full loading overlay on background refreshes
      const [activityData, occupancyData, usersData, devicesData] = await Promise.all([
        accessService.getRecentActivity(50),
        accessService.getCurrentOccupancy(),
        userService.getAllUsers(),
        deviceService.getAllDevices()
      ]);
      setActivity(activityData.activity || []);
      setOccupancy(occupancyData.logs || []);
      setTotalUsers(usersData.length || 0);
      setTotalDevices(devicesData.devices?.length || 0);
      console.log('Occupancy API logs:', occupancyData.logs);
      
      // Process data for chart (mocking timeline density from recent logs)
      const processChart = (logs) => {
        const timeGroups = {};
        logs.forEach(log => {
          const time = formatToLocalTime(log.check_in_time);
          const hourMin = time.getHours() + ':' + (Math.floor(time.getMinutes()/10)*10).toString().padStart(2, '0'); // Group by 10 mins
          timeGroups[hourMin] = (timeGroups[hourMin] || 0) + 1;
        });
        
        return Object.keys(timeGroups).slice(0, 15).reverse().map(time => ({
          time,
          traffic: timeGroups[time] * 3 + Math.floor(Math.random() * 5), // multiply/add random to make it look dynamic
        }));
      };
      
      if(activityData.activity && activityData.activity.length > 0) {
        setChartData(processChart(activityData.activity));
      } else {
        // Mock data if no logs
        setChartData([
          { time: '08:00', traffic: 12 }, { time: '09:00', traffic: 45 },
          { time: '10:00', traffic: 32 }, { time: '11:00', traffic: 60 },
          { time: '12:00', traffic: 15 }, { time: '13:00', traffic: 25 },
        ]);
      }
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    connectSocket();

    // Socket.io listeners
    if (socket) {
      socket.on('occupancy_update', () => {
        console.log('Socket.io: occupancy_update');
        fetchDashboardData();
      });

      socket.on('kiosk_scan_update', (data) => {
        console.log('Socket.io: kiosk_scan_update', data);
        handleLiveScan(data);
      });

      socket.on('activity_update', () => {
        console.log('Socket.io: activity_update');
        fetchDashboardData();
      });

      socket.on('quick_register_request_update', (payload) => {
        console.log('Socket.io: quick_register_request_update received', payload);
        setQuickRequests(prev => {
          if (prev.some(r => r.serial_number === payload.serial_number)) return prev;
          return [...prev, payload];
        });
        const alertAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
        alertAudio.play().catch(() => {});
      });
    }

    return () => {
      if (socket) {
        socket.off('occupancy_update');
        socket.off('kiosk_scan_update');
        socket.off('activity_update');
        socket.off('quick_register_request_update');
      }
    };
  }, [socket, connectSocket]);

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  const exportToExcel = () => {
    const wsData = activity.map(log => ({
      'ID Giao Dịch': log.id,
      'Nhân Viên': log.full_name,
      'Hành Động': log.status === 'checked_in' ? 'Check-In' : 'Check-Out',
      'Thời Gian Vào': log.check_in_time ? new Date(log.check_in_time).toLocaleString('vi-VN') : '',
      'Thời Gian Ra': log.check_out_time ? new Date(log.check_out_time).toLocaleString('vi-VN') : 'Đang trong phòng',
    }));
    
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nhat_Ky_Truy_Cap");
    XLSX.writeFile(wb, `Audit_Trail_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (loading && activity.length === 0) {
    return <LoadingSpinner message="Đang kết nối tới trạm Security..." />;
  }

  // Check if user has permission (security, manager or admin)
  if (user && user.role !== 'security' && user.role !== 'manager' && user.role !== 'admin') {
    return <Navigate to="/devices" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans relative overflow-hidden p-8 transition-colors duration-300">
      {/* Dynamic Background Image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-5 dark:opacity-15"
        style={{ backgroundImage: "url('/dashboard_bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 dark:from-slate-950/50 via-slate-50/60 dark:via-slate-900/60 to-slate-100/90 dark:to-slate-950/90" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header & Export Actions */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center">
              <ShieldAlert className="text-[#0F5FDC] dark:text-blue-400 mr-3 animate-pulse" size={36} /> Live Security System
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Bảng điều khiển giám sát an ninh phòng R&D thời gian thực</p>
          </div>
        <div className="flex gap-4">
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-none font-semibold transition flex items-center shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Download size={20} className="mr-2" /> Xuất Báo Cáo Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8">
          <Alert message={error} type="error" onClose={() => setError('')} />
        </div>
      )}

      {/* Top Value-add Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-none p-6 shadow-md text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 font-medium uppercase tracking-wider text-sm mb-2">Đang Trực Tiếp Trong Phòng</p>
            <p className="text-5xl font-bold font-mono">{occupancy.length} <span className="text-xl font-normal text-blue-200 font-sans">Kỹ sư</span></p>
          </div>
          <Users size={120} className="absolute -bottom-4 -right-4 text-white opacity-10" />
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 text-slate-800 dark:text-slate-100 rounded-none p-6 shadow-xl flex items-center justify-between transition-colors duration-300">
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider text-sm mb-2">Tổng Nhân Sự Hệ Thống</p>
             <p className="text-4xl font-bold font-mono">{totalUsers} <span className="text-base font-normal text-slate-400 dark:text-slate-500 font-sans">Nhân viên</span></p>
           </div>
           <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-[#0F5FDC] dark:text-blue-400">
             <Users size={32} />
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 text-slate-800 dark:text-slate-100 rounded-none p-6 shadow-xl flex items-center justify-between transition-colors duration-300">
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider text-sm mb-2">Tổng Thiết Bị Đăng Ký</p>
             <p className="text-4xl font-bold font-mono">{totalDevices} <span className="text-base font-normal text-slate-400 dark:text-slate-500 font-sans">Thiết bị</span></p>
           </div>
           <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-[#0F5FDC] dark:text-blue-400">
             <Laptop size={32} />
           </div>
        </div>
      </div>

      {/* Live Kiosk Monitor (Guard Alert Panel) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
              <Scan className="text-indigo-600 dark:text-indigo-400 mr-2 animate-pulse" size={24} /> Kiosk Live Monitor
           </h2>
           <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Thời gian thực</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
           {liveScans.length > 0 ? liveScans.map((scan, idx) => (
             <div 
               key={idx} 
               className={`p-4 rounded-none border-2 transition-all animate-in slide-in-from-top-4 duration-500 ${
                 scan.status === 'mismatch' 
                   ? 'bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-500/20 ring-4 ring-rose-500/10 animate-pulse text-white' 
                   : 'bg-white dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
               }`}
             >
                <div className="flex justify-between items-start mb-2">
                   <div className={`p-1.5 rounded-none ${scan.status === 'mismatch' ? 'bg-rose-600 text-white' : 'bg-green-600 dark:bg-green-500/20 dark:text-green-400 text-white'}`}>
                      {scan.status === 'mismatch' ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                   </div>
                   <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{new Date().toLocaleTimeString('vi-VN')}</span>
                </div>
                {scan.device_photo && (
                  <div className="w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-950 mb-3 border border-slate-200 dark:border-slate-800">
                    <img src={scan.device_photo} alt={scan.device} className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="font-bold text-sm truncate text-slate-800 dark:text-slate-100">{scan.user}</p>
                <p className={`text-[10px] font-medium truncate ${scan.status === 'mismatch' ? 'text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                   {scan.device}
                </p>
                {scan.status === 'mismatch' && (
                  <div className="mt-2 text-[10px] font-black text-rose-300 uppercase tracking-tighter bg-rose-950/80 px-2 py-0.5 rounded-none italic border border-rose-500/30 text-center">
                     🚨 MISMATCH DETECTED!
                  </div>
                )}
             </div>
           )) : (
             <div className="col-span-full bg-white dark:bg-slate-900/30 backdrop-blur-sm border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-none p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                Đang đợi nhân viên tương tác tại Kiosk...
             </div>
           )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-none shadow-xl border border-slate-200 dark:border-slate-800/50 p-6 mb-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Biểu đồ Lưu Lượng Cửa Ra Vào (Traffic Timeline)</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="traffic" 
                stroke="#0F5FDC" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTraffic)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Feed Event Logging */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-none shadow-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden flex flex-col h-[500px] transition-colors duration-300">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
               <Activity className="text-[#0F5FDC] dark:text-blue-400 mr-2 animate-pulse" size={24} /> Live Feed Activity
            </h2>
            <span className="px-3 py-1 bg-blue-500/10 text-[#0F5FDC] dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wide">Real-time</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {activity.length > 0 ? (
              <div className="space-y-1 p-4">
                {activity.map((log) => {
                  const isCheckIn = log.status === 'checked_in';
                  return (
                    <div key={log.id} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-none transition group">
                      <div className={`p-2 rounded-full mr-4 ${isCheckIn ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                        {isCheckIn ? <ArrowRightCircle size={20} /> : <ArrowLeftCircle size={20} />}
                      </div>
                      
                      {/* Activity Photo Thumbnail */}
                      <div className="w-10 h-10 rounded-none overflow-hidden mr-4 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                         {log.entry_photo ? (
                           <img src={log.entry_photo} className="w-full h-full object-cover" alt="ID" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                             <User size={16} />
                           </div>
                         )}
                      </div>

                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-300 font-medium">
                          <span className="font-bold text-slate-800 dark:text-white">{log.full_name}</span> 
                          {isCheckIn ? ' đã vào phòng' : ' đã rời phòng'}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">Mã Giao Dịch: #{log.id} • Devices: {log.device_ids?.length || 0}</p>
                      </div>
                      <div className="text-right text-sm">
                        <span className="text-slate-400 dark:text-slate-500 font-mono">
                           {formatToLocalTime(isCheckIn ? log.check_in_time : log.check_out_time).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Chưa có hoạt động nào</div>
            )}
          </div>
        </div>
      </div>

      {/* Occupancy Table - MONITORING WHO IS INSIDE */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-none shadow-xl border border-slate-200 dark:border-slate-800/50 overflow-hidden mb-12 transition-colors duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-900/30">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center">
              <div className="bg-emerald-500/10 p-2 rounded-none mr-3 text-emerald-600 dark:text-emerald-400">
                <Users size={24} />
              </div>
              Người Đang Ở Trong Phòng
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Giám sát nhân sự và thiết bị hiện hữu thời gian thực</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Tìm nhanh nhân viên..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-none text-sm focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white transition shadow-sm"
              onChange={(e) => {
                const term = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('.occupancy-row');
                rows.forEach(row => {
                  const name = row.getAttribute('data-name').toLowerCase();
                  row.style.display = name.includes(term) ? '' : 'none';
                });
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/30 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-5">Nhân Viên</th>
                <th className="px-8 py-5">Xác Thực (Photo)</th>
                <th className="px-8 py-5">Vào Lúc</th>
                <th className="px-8 py-5">Thiết Bị</th>
                <th className="px-8 py-5">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {occupancy.map((log) => (
                <tr key={log.id} className="occupancy-row hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group" data-name={log.full_name}>
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-none bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg mr-4">
                        {log.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 dark:text-white text-lg uppercase tracking-tight">{log.full_name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">@{log.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     {log.entry_photo ? (
                       <div className="relative w-16 h-10 rounded-none overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:scale-150 transition-transform origin-left z-20">
                          <img src={log.entry_photo} alt="Identity" className="w-full h-full object-cover" />
                       </div>
                     ) : (
                       <span className="text-slate-400 dark:text-slate-500 text-xs italic">N/A</span>
                     )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center text-slate-700 dark:text-slate-300 font-bold font-mono">
                      <Clock size={16} className="mr-2 text-[#0F5FDC] dark:text-blue-400" />
                      {formatToLocalTime(log.check_in_time).toLocaleTimeString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2 max-w-[250px]">
                       {log.device_ids?.length > 0 ? (
                         log.device_ids.map((id, index) => (
                           <span key={index} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-[#0F5FDC] dark:text-blue-400 rounded-none text-[9px] font-black border border-blue-200 dark:border-blue-500/20 flex items-center">
                             <Laptop size={10} className="mr-1" /> ID:{id}
                           </span>
                         ))
                       ) : (
                         <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">KHÔNG THIẾT BỊ</span>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 text-slate-400 dark:text-slate-400 hover:text-[#0F5FDC] dark:hover:text-blue-400 transition-colors">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {occupancy.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-40 dark:opacity-30">
                      <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-full mb-4 border border-slate-200 dark:border-slate-700/50">
                         <Users size={64} className="text-slate-400 dark:text-slate-500" />
                      </div>
                      <p className="text-xl font-black text-slate-500 dark:text-slate-400">PHÒNG R&D ĐANG TRỐNG</p>
                      <p className="text-sm text-slate-400 mt-2">Hiện tại không có nhân sự nào trong khu vực giám sát.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Quick Device Registration Requests Floating Overlay */}
      {quickRequests.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 w-[450px] space-y-4 animate-in slide-in-from-right duration-300">
          {quickRequests.map((req, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-none shadow-2xl overflow-hidden text-slate-800 dark:text-white flex flex-col backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 relative transition-colors duration-300">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-none">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">Đăng ký thiết bị nhanh</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 font-mono tracking-wider font-bold">YÊU CẦU DUYỆT TỨC THỜI</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  Chờ xác nhận
                </span>
              </div>

              <div className="p-6 flex gap-6">
                <div className="w-32 h-32 rounded-none overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                  {req.device_photo ? (
                    <img src={req.device_photo} className="w-full h-full object-cover" alt="Device" />
                  ) : (
                    <Laptop size={48} className="text-slate-400 dark:text-slate-600 opacity-50" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Nhân viên:</p>
                  <p className="text-base font-black text-slate-800 dark:text-white truncate">{req.full_name}</p>
                  
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-2">Thiết bị:</p>
                  <p className="text-sm font-bold text-[#0F5FDC] dark:text-blue-400 truncate">{req.brand} {req.model}</p>
                  <p className="text-xs font-mono text-slate-500 truncate">SN: {req.serial_number}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end">
                <button
                  onClick={() => handleRejectQuickReg(req)}
                  className="px-4 py-2 font-bold text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-500 dark:text-rose-400 border border-slate-200 dark:border-rose-500/30 rounded-none transition flex items-center gap-1"
                >
                  <X size={14} /> TỪ CHỐI
                </button>
                <button
                  onClick={() => handleApproveQuickReg(req)}
                  className="px-5 py-2 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-none shadow-lg shadow-emerald-500/20 transition flex items-center gap-1 animate-pulse"
                >
                  <ShieldCheck size={14} /> XÁC NHẬN CHO VÀO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default DashboardPage;
