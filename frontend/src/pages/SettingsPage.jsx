import React, { useState } from 'react';
import { Settings, User, Lock, Bell, Shield, CheckCircle, ShieldAlert, ChevronRight, Globe, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';

const SettingsPage = () => {
    const { t } = useLanguageStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [pwdSuccess, setPwdSuccess] = useState(false);

    const tabs = [
        { id: 'profile', name: t('settings.profile_governance'), icon: User },
        { id: 'security', name: t('settings.security_credentials'), icon: Lock },
        { id: 'notifications', name: t('settings.alert_configurations'), icon: Bell },
    ];

    const handleUpdatePwd = (e) => {
        e.preventDefault();
        setPwdSuccess(true);
        setTimeout(() => setPwdSuccess(false), 3000);
    };

    const loginHistory = [
        { time: "2026-04-26 20:15:22", device: "Chrome / Windows 11", ip: "192.168.1.15", status: t('settings.authorized') },
        { time: "2026-04-25 08:30:45", device: "Chrome / Windows 11", ip: "192.168.1.15", status: t('settings.authorized') },
        { time: "2026-04-24 17:05:10", device: "Firefox / macOS", ip: "10.0.0.42", status: t('settings.authorized') },
    ];

    return (
        <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
            {/* Header Section */}
            <div className="mb-xxl">
                <h1 className="text-display-md tracking-tight mb-xs">{t('settings.system_preferences')}</h1>
                <p className="text-body-md text-charcoal">{t('settings.system_preferences_desc')}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-xl">
                {/* Configuration Navigation */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-paper border border-fog p-md rounded-xl shadow-soft-lift space-y-xs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between px-md py-sm rounded-md font-bold text-caption-bold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-on-ink shadow-soft-lift'
                                            : 'text-graphite hover:text-ink hover:bg-cloud'
                                    }`}
                                >
                                    <div className="flex items-center gap-sm">
                                        <Icon size={18} />
                                        <span>{tab.name}</span>
                                    </div>
                                    <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Configuration Panel */}
                <div className="flex-1 bg-paper p-xl rounded-xl shadow-floating border border-fog min-h-[500px]">
                    {activeTab === 'profile' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col md:flex-row items-center gap-xl pb-xl border-b border-fog mb-xl">
                                <div className="w-24 h-24 bg-cloud border border-fog rounded-full flex items-center justify-center text-primary text-display-xs font-bold shadow-sm">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-display-xs text-ink mb-xxs">{user?.full_name}</h3>
                                    <div className="flex flex-wrap gap-xs justify-center md:justify-start">
                                        <span className="text-caption-bold text-charcoal bg-cloud px-sm py-xxs rounded border border-fog">@{user?.username}</span>
                                        <span className="text-caption-bold text-primary bg-primary/5 px-sm py-xxs rounded border border-primary/10 uppercase tracking-widest">{user?.role}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-xs mb-xl text-primary">
                                <User size={20} />
                                <h2 className="text-body-emphasis uppercase tracking-widest">{t('settings.identity_profile')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('settings.directory_id')}</label>
                                    <input
                                        type="text" value={user?.username || ''} disabled
                                        className="w-full px-md py-sm bg-cloud border border-fog rounded-md text-graphite font-bold cursor-not-allowed outline-none"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('settings.principal_name')}</label>
                                    <input
                                        type="text" value={user?.full_name || ''} disabled
                                        className="w-full px-md py-sm bg-cloud border border-fog rounded-md text-graphite font-bold cursor-not-allowed outline-none"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('settings.employee_serial')}</label>
                                    <input
                                        type="text" value={user?.employee_id || 'HCL_ADMIN_00'} disabled
                                        className="w-full px-md py-sm bg-cloud border border-fog rounded-md text-primary font-mono font-bold cursor-not-allowed outline-none"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('settings.access_tier')}</label>
                                    <div className="px-md py-sm bg-cloud border border-fog rounded-md text-ink font-bold flex items-center gap-sm">
                                        <ShieldCheck size={16} className="text-primary" />
                                        {user?.role?.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-xs mb-xl text-primary">
                                <Lock size={20} />
                                <h2 className="text-body-emphasis uppercase tracking-widest">{t('settings.authentication_tokens')}</h2>
                            </div>
                            
                            {pwdSuccess && (
                                <div className="bg-green-50 border border-green-100 text-green-600 p-md rounded-md flex items-center gap-sm font-bold text-caption-md mb-xl">
                                    <CheckCircle size={18} /> {t('settings.credentials_rotated')}
                                </div>
                            )}

                            <form onSubmit={handleUpdatePwd} className="space-y-xl max-w-lg mb-xxl">
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('settings.current_secret')}</label>
                                    <input
                                        type="password" placeholder="••••••••" required
                                        className="w-full px-md py-sm bg-cloud border border-fog rounded-md outline-none focus:border-primary transition font-mono"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('settings.new_token_string')}</label>
                                    <input
                                        type="password" placeholder="••••••••" required
                                        className="w-full px-md py-sm bg-cloud border border-fog rounded-md outline-none focus:border-primary transition font-mono"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('settings.verify_new_token')}</label>
                                    <input
                                        type="password" placeholder="••••••••" required
                                        className="w-full px-md py-sm bg-cloud border border-fog rounded-md outline-none focus:border-primary transition font-mono"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-primary text-on-ink px-xl py-sm rounded-md font-bold hover:bg-primary-deep transition shadow-soft-lift active:scale-[0.98]"
                                >
                                    {t('settings.rotate_credentials')}
                                </button>
                            </form>

                            <div className="flex items-center gap-xs mb-xl text-primary">
                                <ShieldAlert size={20} />
                                <h2 className="text-body-emphasis uppercase tracking-widest">{t('settings.access_forensics')}</h2>
                            </div>
                            <div className="overflow-x-auto border border-fog rounded-md">
                                <table className="w-full text-left">
                                    <thead className="bg-cloud text-caption-bold text-graphite uppercase tracking-widest border-b border-fog">
                                        <tr>
                                            <th className="py-sm px-xl">{t('settings.timestamp')}</th>
                                            <th className="py-sm px-xl">{t('settings.asset_environment')}</th>
                                            <th className="py-sm px-xl">{t('settings.ip_address')}</th>
                                            <th className="py-sm px-xl">{t('settings.compliance')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-fog text-caption-md">
                                        {loginHistory.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-cloud/20 transition-colors">
                                                <td className="py-md px-xl font-bold text-ink">{item.time}</td>
                                                <td className="py-md px-xl text-charcoal">{item.device}</td>
                                                <td className="py-md px-xl font-mono text-primary">{item.ip}</td>
                                                <td className="py-md px-xl">
                                                    <span className="px-sm py-xxs bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100">
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-xs mb-xl text-primary">
                                <Bell size={20} />
                                <h2 className="text-body-emphasis uppercase tracking-widest">{t('settings.event_telemetry')}</h2>
                            </div>
                            <div className="space-y-md">
                                <div className="flex items-center justify-between p-xl bg-cloud border border-fog rounded-md group hover:border-primary transition-colors">
                                    <div>
                                        <p className="text-body-emphasis text-ink">{t('settings.administrative_approvals')}</p>
                                        <p className="text-caption-md text-charcoal">{t('settings.administrative_approvals_desc')}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-charcoal peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-on-ink after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-ink after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-xl bg-cloud border border-fog rounded-md group hover:border-primary transition-colors">
                                    <div>
                                        <p className="text-body-emphasis text-ink">{t('settings.security_escalations')}</p>
                                        <p className="text-caption-md text-charcoal">{t('settings.security_escalations_desc')}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-charcoal peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-on-ink after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-ink after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
