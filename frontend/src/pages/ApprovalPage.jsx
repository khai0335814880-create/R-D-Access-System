import React, { useEffect, useState } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { accessService } from '../services/accessService';
import { activityService } from '../services/activityService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguageStore } from '../store/languageStore';
import { CheckSquare, ShieldCheck, XCircle, Activity, Server, Cpu, Database, History, ListChecks, CheckCircle2, ChevronRight, Filter, Download } from 'lucide-react';

export const ApprovalPage = () => {
  const { t } = useLanguageStore();
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
  const [activeTab, setActiveTab] = useState('approvals');
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  
  const [health, setHealth] = useState({
    status: t('loading.loading'),
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
    const healthInterval = setInterval(loadHealth, 30000);
    return () => clearInterval(healthInterval);
  }, [fetchPendingRequests, activeTab]);

  const loadHealth = async () => {
    try {
      const start = Date.now();
      const data = await activityService.getSystemHealth();
      const latency = Date.now() - start;
      
      setHealth({
        status: data.status === 'OK' ? t('operations.operational') : t('operations.warning'),
        uptime: Math.floor(data.uptime / 3600) + 'h ' + Math.floor((data.uptime % 3600) / 60) + 'm',
        latency: latency + 'ms',
        memory: Math.round(data.memory.rss / (1024 * 1024)) + ' MB'
      });
    } catch (err) {
      setHealth(prev => ({ ...prev, status: t('operations.offline') }));
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
      setMessage(t('operations.approved_success'));
      setMessageType('success');
      await fetchPendingRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || t('operations.approval_failed'));
      setMessageType('error');
    }
  };

  const handleRejectSingle = async (requestId) => {
    try {
      await rejectDevice(requestId, t('operations.rejected_success'));
      setMessage(t('operations.rejected_success'));
      setMessageType('success');
      await fetchPendingRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || t('operations.rejection_failed'));
      setMessageType('error');
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedRequestIds.length === 0) return;
    setIsProcessingBulk(true);
    try {
      if (actionType === 'approve') {
        await Promise.all(selectedRequestIds.map(id => approveDevice(id, t('operations.approve_selected'))));
        setMessage(t('operations.bulk_approved', { count: selectedRequestIds.length }));
      } else {
        await Promise.all(selectedRequestIds.map(id => rejectDevice(id, t('operations.reject_selected'))));
        setMessage(t('operations.bulk_rejected', { count: selectedRequestIds.length }));
      }
      setMessageType('success');
      setSelectedRequestIds([]);
      await fetchPendingRequests();
    } catch (err) {
      setMessage(t('operations.bulk_failed'));
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
      setSelectedRequestIds(pendingRequests.map(req => req.request_id));
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-xl mb-xxl">
        <div>
          <h1 className="text-display-md tracking-tight mb-xs">{t('operations.command_title')}</h1>
          <p className="text-body-md text-charcoal">{t('operations.command_desc')}</p>
        </div>
      </div>

      {(message || error) && (
        <div className="mb-xl animate-in fade-in slide-in-from-top-4">
          {message && <Alert message={message} type={messageType} onClose={() => setMessage('')} />}
          {error && <Alert message={error} type="error" onClose={() => {}} />}
        </div>
      )}

      {/* System Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mb-xxl">
        <div className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift">
           <div className="flex justify-between items-start mb-md">
              <span className="text-caption-bold text-graphite uppercase tracking-widest">{t('operations.core_status')}</span>
              <Activity size={18} className={health.status === 'Operational' ? 'text-green-600' : 'text-red-500'} />
           </div>
           <p className={`text-display-xs font-bold ${health.status === t('operations.operational') ? 'text-green-600' : 'text-red-500'}`}>{health.status}</p>
        </div>
        
        <div className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift">
           <div className="flex justify-between items-start mb-md">
              <span className="text-caption-bold text-graphite uppercase tracking-widest">{t('operations.uptime')}</span>
              <Server size={18} className="text-primary" />
           </div>
           <p className="text-display-xs font-bold font-mono">{health.uptime}</p>
        </div>

        <div className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift">
           <div className="flex justify-between items-start mb-md">
              <span className="text-caption-bold text-graphite uppercase tracking-widest">{t('operations.latency')}</span>
              <Cpu size={18} className="text-primary" />
           </div>
           <p className="text-display-xs font-bold font-mono text-primary">{health.latency}</p>
        </div>

        <div className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift">
           <div className="flex justify-between items-start mb-md">
              <span className="text-caption-bold text-graphite uppercase tracking-widest">{t('operations.memory')}</span>
              <Database size={18} className="text-primary" />
           </div>
           <p className="text-display-xs font-bold font-mono">{health.memory}</p>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="bg-paper rounded-xl shadow-floating border border-fog overflow-hidden">
        <div className="flex border-b border-fog bg-cloud">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-xl py-lg text-caption-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'approvals' 
                ? 'text-primary bg-paper border-b-2 border-primary' 
                : 'text-graphite hover:text-ink'
            }`}
          >
            {t('operations.pending_approvals')}
            {pendingRequests?.length > 0 && (
              <span className="ml-xs bg-primary text-on-ink py-xxs px-xs rounded-full text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-xl py-lg text-caption-bold uppercase tracking-widest transition-all relative ${
              activeTab === 'audit' 
                ? 'text-primary bg-paper border-b-2 border-primary' 
                : 'text-graphite hover:text-ink'
            }`}
          >
            {t('operations.audit_trail')}
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'approvals' ? (
            <div className="divide-y divide-fog">
              {/* Toolbar */}
              <div className="p-md bg-cloud/50 flex justify-between items-center px-xl">
                 <div className="flex items-center gap-md">
                    <input 
                      type="checkbox"
                      checked={pendingRequests?.length > 0 && selectedRequestIds.length === pendingRequests.length}
                      onChange={toggleSelectAll}
                      disabled={!pendingRequests || pendingRequests.length === 0}
                      className="w-5 h-5 rounded border-fog text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-caption-md text-charcoal font-bold">
                       {selectedRequestIds.length} {t('operations.selected')}
                    </span>
                 </div>
                 {selectedRequestIds.length > 0 && (
                   <div className="flex gap-md">
                      <button
                        onClick={() => handleBulkAction('reject')}
                        disabled={isProcessingBulk}
                        className="text-red-600 hover:text-red-700 font-bold text-caption-bold flex items-center gap-xxs px-md py-xs rounded-md border border-red-100 hover:bg-red-50 transition"
                      >
                         {t('operations.reject_selected')}
                      </button>
                      <button
                        onClick={() => handleBulkAction('approve')}
                        disabled={isProcessingBulk}
                        className="bg-primary text-on-ink px-xl py-xs rounded-md font-bold text-caption-bold hover:bg-primary-deep transition shadow-soft-lift"
                      >
                         {t('operations.approve_selected')}
                      </button>
                   </div>
                 )}
              </div>

              {/* List Content */}
              {isDeviceLoading && pendingRequests.length === 0 ? (
                <div className="p-xxl flex justify-center"><LoadingSpinner /></div>
              ) : pendingRequests && pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div key={request.request_id} className="p-xl hover:bg-cloud/20 transition flex items-start gap-xl group">
                    <input 
                      type="checkbox"
                      checked={selectedRequestIds.includes(request.request_id)}
                      onChange={() => toggleSelectRequest(request.request_id)}
                      className="mt-xs w-5 h-5 rounded border-fog text-primary focus:ring-primary cursor-pointer"
                    />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-xl items-center">
                       <div className="md:col-span-1">
                          <h3 className="text-body-emphasis text-ink leading-tight">{request.brand} {request.model_name}</h3>
                          <p className="text-caption-md text-charcoal mt-xxs">{t('operations.owned_by')}: <span className="font-bold text-ink">{request.full_name}</span></p>
                       </div>

                       <div className="space-y-xxs">
                          <p className="text-[10px] text-graphite font-bold uppercase tracking-wider">{t('operations.identification')}</p>
                          <p className="font-mono text-primary text-body-md font-bold">{request.serial_number}</p>
                          <p className="text-caption-md text-graphite">{request.device_type}</p>
                       </div>

                       <div className="space-y-xxs">
                          <p className="text-[10px] text-graphite font-bold uppercase tracking-wider">{t('operations.registration_date')}</p>
                          <p className="text-body-md font-mono">{new Date(request.requested_at).toLocaleDateString()}</p>
                          <p className="text-caption-md text-graphite">{new Date(request.requested_at).toLocaleTimeString()}</p>
                       </div>

                       <div className="flex justify-end gap-md">
                          <button
                            onClick={() => handleRejectSingle(request.request_id)}
                            className="p-sm text-charcoal hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                            title={t('operations.reject')}
                          >
                             <XCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleApproveSingle(request.request_id)}
                            className="p-sm text-charcoal hover:text-green-600 hover:bg-green-50 rounded-md transition-all"
                            title={t('operations.approve')}
                          >
                             <CheckCircle2 size={20} />
                          </button>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-xxl text-center flex flex-col items-center">
                   <div className="w-16 h-16 bg-cloud rounded-full flex items-center justify-center mb-md">
                      <CheckSquare size={32} className="text-steel" />
                   </div>
                   <h3 className="text-display-xs text-ink mb-xxs">{t('operations.queue_empty')}</h3>
                   <p className="text-body-md text-charcoal">{t('operations.queue_empty_desc')}</p>
                </div>
              )}
            </div>
          ) : (
            /* AUDIT TRAIL TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cloud text-[10px] font-bold text-graphite uppercase tracking-widest border-b border-fog">
                    <th className="px-xl py-md">{t('operations.timestamp')}</th>
                    <th className="px-xl py-md">{t('operations.principal')}</th>
                    <th className="px-xl py-md">{t('operations.event_action')}</th>
                    <th className="px-xl py-md text-right">{t('operations.reference')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fog">
                  {isLoadingAudit ? (
                    <tr>
                       <td colSpan="4" className="p-xxl text-center"><LoadingSpinner /></td>
                    </tr>
                  ) : auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-cloud/10 transition-colors">
                      <td className="px-xl py-lg text-caption-md font-mono text-ink">
                         {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-xl py-lg">
                         <p className="text-body-emphasis text-ink">{log.full_name || t('operations.system')}</p>
                         <p className="text-[10px] text-graphite font-mono">ID: {log.user_id || t('operations.internal')}</p>
                      </td>
                      <td className="px-xl py-lg">
                         <span className="inline-block px-sm py-xxs bg-primary/5 border border-primary/10 text-primary rounded-full text-[10px] font-bold uppercase mb-xxs">
                            {log.activity_type}
                         </span>
                         <p className="text-caption-md text-charcoal max-w-md">{log.description}</p>
                      </td>
                      <td className="px-xl py-lg text-right font-mono text-[10px] text-graphite">
                         {log.metadata?.ip || t('operations.secure_trans')}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && !isLoadingAudit && (
                    <tr>
                      <td colSpan="4" className="px-xl py-xxl text-center text-charcoal">
                        {t('operations.no_events')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;
