import React, { useEffect, useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { accessService } from '../services/accessService';
import { activityService } from '../services/activityService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckSquare, ShieldCheck, XCircle, Activity, Server, Cpu, Database, History, ListChecks, CheckCircle2 } from 'lucide-react';

export const ApprovalPage = () => {
  const {
    pendingRequests,
    fetchPendingRequests,
    approveDevice,
    rejectDevice,
    isLoading: isDeviceLoading,
    error,
  } = useDeviceStore();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  
  // Tab Management
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'audit'
  
  // Audit Trail Data
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Bulk Actions State
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  
  // Health Metrics State
  const [health, setHealth] = useState({
    status: 'Checking...',
    uptime: '0s',
    latency: '0ms',
    memory: '0MB'
  });

  useEffect(() => {
    fetchPendingRequests();
    loadHealth();
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
    
    // Refresh health every 30s
    const healthInterval = setInterval(loadHealth, 30000);
    return () => clearInterval(healthInterval);
  }, [fetchPendingRequests, activeTab]);

  const loadHealth = async () => {
    try {
      const start = Date.now();
      const data = await activityService.getSystemHealth();
      const latency = Date.now() - start;
      
      setHealth({
        status: data.status === 'OK' ? 'Online' : 'Warning',
        uptime: Math.floor(data.uptime / 3600) + 'h ' + Math.floor((data.uptime % 3600) / 60) + 'm',
        latency: latency + 'ms',
        memory: Math.round(data.memory.rss / (1024 * 1024)) + ' MB'
      });
    } catch (err) {
      setHealth(prev => ({ ...prev, status: 'Offline' }));
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const data = await activityService.getRecentActivity(100);
      setAuditLogs(data.activity || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleApproveSingle = async (requestId) => {
    try {
      await approveDevice(requestId, '');
      setMessage('Đã phê duyệt thiết bị thành công!');
      setMessageType('success');
      await fetchPendingRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Phê duyệt thất bại');
      setMessageType('error');
    }
  };

  const handleRejectSingle = async (requestId) => {
    try {
      await rejectDevice(requestId, 'Từ chối bởi Quản lý');
      setMessage('Đã từ chối thiết bị!');
      setMessageType('success');
      await fetchPendingRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Từ chối thất bại');
      setMessageType('error');
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedRequestIds.length === 0) return;
    setIsProcessingBulk(true);
    try {
      if (actionType === 'approve') {
        // Execute promises sequentially or parallel
        await Promise.all(selectedRequestIds.map(id => approveDevice(id, 'Duyệt hàng loạt')));
        setMessage(`Đã phê duyệt thành công ${selectedRequestIds.length} yêu cầu!`);
      } else {
        await Promise.all(selectedRequestIds.map(id => rejectDevice(id, 'Từ chối hàng loạt')));
        setMessage(`Đã từ chối ${selectedRequestIds.length} yêu cầu!`);
      }
      setMessageType('success');
      setSelectedRequestIds([]);
      await fetchPendingRequests();
    } catch (err) {
      setMessage('Có lỗi xảy ra khi xử lý hàng loạt');
      setMessageType('error');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const toggleSelectRequest = (id) => {
    setSelectedRequestIds(prev => 
      prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRequestIds.length === pendingRequests.length) {
      setSelectedRequestIds([]);
    } else {
      setSelectedRequestIds(pendingRequests.map(req => req.id));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen transition-colors duration-300 text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center">
            <CheckSquare className="text-indigo-600 dark:text-indigo-400 mr-3" size={36} /> Workspace Quản Lý
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Duyệt thiết bị, giám sát tài nguyên và kiểm tra nhật ký hệ thống</p>
        </div>
      </div>

      {(message || error) && (
        <div className="mb-8">
          {message && <Alert message={message} type={messageType} onClose={() => setMessage('')} duration={5000} />}
          {error && <Alert message={error} type="error" onClose={() => {}} />}
        </div>
      )}

      {/* System Health Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 dark:bg-slate-900 text-white p-5 rounded-none flex items-center justify-between shadow-lg border border-slate-700 dark:border-slate-800/60">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">API Status</p>
            <p className={`text-2xl font-bold flex items-center ${health.status === 'Online' ? 'text-emerald-400' : 'text-rose-400'}`}>
              <Activity size={24} className="mr-2"/> {health.status}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border text-slate-800 dark:text-white px-5 py-6 rounded-none shadow-sm border-slate-200 dark:border-slate-800">
           <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center"><Server size={16} className="mr-2"/> Uptime</p>
           <p className="text-2xl font-bold font-mono">{health.uptime}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border text-slate-800 dark:text-white px-5 py-6 rounded-none shadow-sm border-slate-200 dark:border-slate-800">
           <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center"><Cpu size={16} className="mr-2"/> API Latency</p>
           <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{health.latency}</p>
        </div>
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border text-slate-800 dark:text-white px-5 py-6 rounded-none shadow-sm border-slate-200 dark:border-slate-800">
           <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center"><Database size={16} className="mr-2"/> Memory Usage</p>
           <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">{health.memory}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 mb-8">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'approvals' 
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <ListChecks size={20} className="mr-2" /> Duyệt Thiết Bị 
          {pendingRequests?.length > 0 && (
            <span className="ml-2 bg-rose-500 text-white py-0.5 px-2.5 rounded-full text-xs font-mono">{pendingRequests.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'audit' 
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <History size={20} className="mr-2" /> Nhật Ký Hệ Thống (Audit Trail)
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'approvals' ? (
        <div className="bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          
          {/* Bulk Actions Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center">
              <input 
                type="checkbox"
                checked={pendingRequests?.length > 0 && selectedRequestIds.length === pendingRequests.length}
                onChange={toggleSelectAll}
                disabled={!pendingRequests || pendingRequests.length === 0}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-slate-800 ml-4 cursor-pointer"
              />
              <span className="ml-4 font-semibold text-slate-700 dark:text-slate-300">
                Đã chọn: {selectedRequestIds.length} yêu cầu
              </span>
            </div>
            {selectedRequestIds.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleBulkAction('approve')}
                  disabled={isProcessingBulk}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-none font-semibold text-sm transition flex items-center shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isProcessingBulk ? 'Đang xử lý...' : <><ShieldCheck size={18} className="mr-1" /> Duyệt Tất Cả Chọn</>}
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  disabled={isProcessingBulk}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-none font-semibold text-sm transition flex items-center shadow-md shadow-rose-500/20 disabled:opacity-50"
                >
                  {isProcessingBulk ? 'Đang xử lý...' : <><XCircle size={18} className="mr-1" /> Từ Chối Chọn</>}
                </button>
              </div>
            )}
          </div>

          {/* Pending List */}
          {isDeviceLoading && pendingRequests.length === 0 ? (
            <div className="p-12"><LoadingSpinner message="Đang tải danh sách chờ duyệt..." /></div>
          ) : pendingRequests && pendingRequests.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition flex items-start">
                  
                  <div className="pt-1 mr-6">
                    <input 
                      type="checkbox"
                      checked={selectedRequestIds.includes(request.id)}
                      onChange={() => toggleSelectRequest(request.id)}
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 dark:focus:ring-indigo-400 dark:bg-slate-800 cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{request.brand} {request.model}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Chủ sở hữu: <span className="font-semibold text-slate-700 dark:text-slate-200">{request.full_name}</span></p>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-none text-xs font-bold border border-amber-200 dark:border-amber-500/20">
                        CHỜ PHÊ DUYỆT
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-8 mt-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mb-1">Loại Nhãn</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{request.device_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mb-1">Mã Serial / Định Danh</p>
                        <p className="font-mono text-[#0F5FDC] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-none border border-blue-100 dark:border-blue-900/50">{request.serial_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase mb-1">Khởi tạo lúc</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300 font-mono text-sm">{new Date(request.requested_at).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    {request.description && (
                      <div className="p-3 bg-slate-100 dark:bg-slate-950/40 rounded-none border border-slate-200 dark:border-slate-800 text-sm italic text-slate-600 dark:text-slate-400 mb-4 inline-block">
                        Ghi chú: {request.description}
                      </div>
                    )}

                    <div className="flex gap-2">
                       <button
                        onClick={() => handleApproveSingle(request.id)}
                        className="px-4 py-2 border dark:border-2 border-emerald-500 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-none font-semibold text-sm transition"
                      >
                        Chấp nhận duyệt
                      </button>
                      <button
                        onClick={() => handleRejectSingle(request.id)}
                        className="px-4 py-2 border dark:border-2 border-rose-500 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-none font-semibold text-sm transition"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
              <CheckCircle2 size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">Tuyệt Vời!</h3>
              <p>Hiện không có bất kỳ thiết bị nào đang chờ phê duyệt.</p>
            </div>
          )}
        </div>
      ) : (
        /* AUDIT TRAIL TAB */
        <div className="bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Lịch sử Hoạt Động Hệ Thống (Read-only)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Giám sát toàn bộ các thay đổi và sự kiện từ người dùng.</p>
          </div>
          
          <div className="overflow-x-auto">
            {isLoadingAudit ? (
              <div className="p-12"><LoadingSpinner message="Đang tải nhật ký kiểm toán..." /></div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Thời Gian (Log Time)</th>
                    <th className="px-6 py-4">Tài Khoản / ID</th>
                    <th className="px-6 py-4">Hành Động Hệ Thống</th>
                    <th className="px-6 py-4">IP / Nguồn Phát Sinh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map((log) => {
                    const timeStr = new Date(log.created_at).toLocaleString('vi-VN');
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{timeStr}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 dark:text-white">{log.full_name || 'System'}</p>
                          <p className="text-xs font-mono text-indigo-500 dark:text-indigo-400 mt-1">user_id: {log.user_id || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="px-2.5 py-1 rounded-none text-xs font-bold border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-[#0F5FDC] dark:text-blue-400 w-fit mb-1">
                              {log.activity_type.toUpperCase()}
                            </span>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{log.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-500 font-mono">
                          {log.metadata?.ip || 'Internal System'}
                        </td>
                      </tr>
                    );
                  })}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        Chưa có dữ liệu nhật ký hệ thống.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ApprovalPage;
