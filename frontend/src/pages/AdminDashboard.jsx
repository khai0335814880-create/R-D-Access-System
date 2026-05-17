import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { deviceService } from '../services/deviceService';
import { accessService } from '../services/accessService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Laptop, Clock, Shield, ArrowRight, UserPlus, Settings, Activity, Server, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const COLORS = ['#0F5FDC', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const AdminDashboard = () => {
  const { t } = useTranslation();
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
      console.error('Failed to fetch admin dashboard telemetry:', err);
      setError('Administrative data synchronization failed. Please verify network integrity.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-xl"></div>
        <p className="text-caption-bold text-graphite uppercase tracking-widest animate-pulse">{t('admin.initializing')}</p>
      </div>
    );
  }

  // Data processing for analytics
  const roleData = Object.entries(
    users.reduce((acc, u) => {
      const role = u.role === 'admin' ? t('admin.role_admin') : u.role === 'security' ? t('admin.role_security') : t('admin.role_engineer');
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const deviceData = Object.entries(
    devices.reduce((acc, d) => {
      const type = d.device_type || t('admin.device_unclassified');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-xl mb-xxl">
        <div>
          <h1 className="text-display-md tracking-tight mb-xs">{t('admin.command_intelligence')}</h1>
          <p className="text-body-md text-charcoal">{t('admin.global_oversight')}</p>
        </div>
        
        <div className="flex gap-md">
          <button 
            onClick={() => navigate('/users')}
            className="px-xl py-sm bg-cloud text-ink border border-fog rounded-md text-caption-bold uppercase tracking-widest hover:bg-fog transition flex items-center gap-xs"
          >
            <UserPlus size={16} /> {t('admin.directory_entry')}
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="px-xl py-sm bg-primary text-on-ink rounded-md text-caption-bold uppercase tracking-widest hover:bg-primary-deep transition shadow-soft-lift flex items-center gap-xs"
          >
            <Settings size={16} /> {t('admin.terminal_config')}
          </button>
        </div>
      </div>

      {error && <div className="mb-xl"><Alert message={error} type="error" /></div>}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl mb-xxl">
        {[
          { label: t('admin.personnel_directory'), value: users.length, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
          { label: t('admin.provisioned_assets'), value: devices.length, icon: Laptop, color: 'text-primary', bg: 'bg-primary/5' },
          { label: t('admin.live_occupancy'), value: occupancy, icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
          { label: t('admin.system_integrity'), value: t('admin.nominal'), icon: Server, color: 'text-primary', bg: 'bg-primary/5', status: true }
        ].map((metric, idx) => (
          <div key={idx} className="bg-paper border border-fog p-xl rounded-xl shadow-floating flex items-center justify-between group hover:border-primary transition-all duration-300">
            <div>
              <p className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-xs">{metric.label}</p>
              {metric.status ? (
                <div className="flex items-center gap-xs mt-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-body-emphasis text-green-600 uppercase tracking-widest font-bold">{t('admin.online')}</p>
                </div>
              ) : (
                <p className="text-display-sm text-ink font-mono">{metric.value}</p>
              )}
            </div>
            <div className={`p-md ${metric.bg} ${metric.color} rounded-xl border border-fog/50 group-hover:scale-110 transition-transform`}>
              <metric.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl mb-xxl">
        <div className="bg-paper border border-fog p-xl rounded-xl shadow-floating">
          <div className="flex items-center gap-xs mb-xxl">
             <Activity size={16} className="text-primary" />
             <h2 className="text-[10px] font-bold text-ink uppercase tracking-widest">{t('admin.personnel_matrix')}</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-paper border border-fog p-xl rounded-xl shadow-floating">
          <div className="flex items-center gap-xs mb-xxl">
             <Laptop size={16} className="text-primary" />
             <h2 className="text-[10px] font-bold text-ink uppercase tracking-widest">{t('admin.asset_inventory')}</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tick={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(2, 74, 216, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#0F5FDC" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Trail Ledger */}
      <div className="bg-paper border border-fog rounded-xl shadow-floating overflow-hidden">
        <div className="p-xl border-b border-fog flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <Activity size={16} className="text-primary" />
            <h2 className="text-[10px] font-bold text-ink uppercase tracking-widest">{t('admin.access_ledger')}</h2>
          </div>
          <button 
            onClick={() => navigate('/activity')}
            className="text-[10px] font-bold text-primary hover:text-primary-deep flex items-center gap-xxs uppercase tracking-widest"
          >
            {t('admin.full_audit_view')} <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud border-b border-fog">
                <th className="py-sm px-xl text-[10px] font-bold text-charcoal uppercase tracking-widest">{t('admin.col_participant')}</th>
                <th className="py-sm px-xl text-[10px] font-bold text-charcoal uppercase tracking-widest">{t('admin.col_action_sequence')}</th>
                <th className="py-sm px-xl text-[10px] font-bold text-charcoal uppercase tracking-widest">{t('admin.col_chronology')}</th>
                <th className="py-sm px-xl text-[10px] font-bold text-charcoal uppercase tracking-widest text-right">{t('admin.col_reference')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fog text-caption-md text-ink">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-cloud/50 transition-colors group">
                  <td className="py-md px-xl font-bold">{log.full_name || log.username || t('admin.unidentified')}</td>
                  <td className="py-md px-xl">
                    <span className={`px-sm py-xxs rounded text-[10px] font-bold uppercase tracking-widest ${
                      log.status === 'checked_in' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-cloud text-graphite border border-fog'
                    }`}>
                      {log.status === 'checked_in' ? t('admin.entry') : t('admin.exit')}
                    </span>
                  </td>
                  <td className="py-md px-xl text-charcoal font-mono">
                    {new Date(log.created_at).toLocaleString('en-GB', { hour12: false })}
                  </td>
                  <td className="py-md px-xl text-right">
                    <button className="p-xs text-fog group-hover:text-primary transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-xxl text-center text-charcoal italic opacity-50">{t('admin.no_activity')}</td>
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
