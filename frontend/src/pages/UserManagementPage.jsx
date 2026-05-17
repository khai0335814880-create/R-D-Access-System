import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useLanguageStore } from '../store/languageStore';
import { Users, UserPlus, Shield, UserCheck, UserX, Trash2, Edit3, Search, X, Mail, Briefcase, Hash, ChevronRight } from 'lucide-react';

const UserManagementPage = () => {
    const { t } = useLanguageStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Add member modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        full_name: '',
        role: 'engineer',
        department: '',
        employee_code: ''
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(t('user_management.failed_retrieve'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await userService.updateUser(id, { status: newStatus });
            setUsers(users.map(u => u.user_id === id ? { ...u, status: newStatus } : u));
        } catch (err) {
            setError(t('user_management.status_failed'));
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await userService.updateUser(id, { role: newRole });
            setUsers(users.map(u => u.user_id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            setError(t('user_management.role_failed'));
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');

        if (!formData.username || !formData.password || !formData.full_name || !formData.employee_code) {
            setFormError(t('user_management.mandatory_required'));
            setSubmitting(false);
            return;
        }

        try {
            await authService.register(formData);
            setShowAddModal(false);
            setFormData({
                username: '', password: '', email: '', full_name: '',
                role: 'engineer', department: '', employee_code: ''
            });
            fetchUsers();
        } catch (err) {
            setFormError(err.response?.data?.message || t('user_management.principal_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user => 
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.employee_code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-xl mb-xxl">
                <div>
                    <h1 className="text-display-md tracking-tight mb-xs">{t('user_management.identity_governance')}</h1>
                    <p className="text-body-md text-charcoal">{t('user_management.identity_governance_desc')}</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-on-ink px-xl py-sm rounded-md font-bold hover:bg-primary-deep transition shadow-soft-lift flex items-center gap-xs"
                >
                    <UserPlus size={20} /> {t('user_management.provision_new_user')}
                </button>
            </div>
            
            {/* Global Notifications */}
            {error && <div className="mb-xl"><Alert message={error} type="error" onClose={() => setError('')} /></div>}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mb-xxl">
                <div className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-caption-bold text-graphite uppercase tracking-widest">{t('user_management.global_workforce')}</p>
                        <Users size={18} className="text-primary" />
                    </div>
                    <p className="text-display-xs mt-md font-bold">{users.length}</p>
                </div>
                
                <div className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-caption-bold text-graphite uppercase tracking-widest">{t('user_management.active_principals')}</p>
                        <UserCheck size={18} className="text-green-600" />
                    </div>
                    <p className="text-display-xs mt-md font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
                </div>

                <div className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-caption-bold text-graphite uppercase tracking-widest">{t('user_management.management')}</p>
                        <Shield size={18} className="text-primary" />
                    </div>
                    <p className="text-display-xs mt-md font-bold">{users.filter(u => u.role !== 'engineer').length}</p>
                </div>

                <div className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-caption-bold text-graphite uppercase tracking-widest">{t('user_management.suspended')}</p>
                        <UserX size={18} className="text-red-500" />
                    </div>
                    <p className="text-display-xs mt-md font-bold text-red-500">{users.filter(u => u.status !== 'active').length}</p>
                </div>
            </div>

            {/* Directory Controls */}
            <div className="bg-paper p-md rounded-xl shadow-floating border border-fog mb-xl flex items-center px-xl">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-md top-1/2 -translate-y-1/2 text-steel" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('user_management.search_people')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-xxl pr-md py-sm bg-cloud border border-fog rounded-md outline-none focus:border-primary transition-all text-body-md"
                    />
                </div>
            </div>

            {/* User Directory Grid */}
            {loading ? (
                <div className="py-xxl flex justify-center"><LoadingSpinner /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
                    {filteredUsers.map((user) => (
                        <div key={user.user_id} className="bg-paper rounded-xl shadow-floating border border-fog overflow-hidden group hover:border-primary transition-all duration-300">
                            <div className="p-xl">
                                <div className="flex justify-between items-start mb-xl">
                                    <div className="flex items-center gap-md">
                                        <div className="w-14 h-14 rounded-full bg-cloud text-primary flex items-center justify-center font-bold text-xl uppercase border border-fog shadow-sm overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.full_name?.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-body-emphasis text-ink leading-tight">{user.full_name}</h3>
                                            <p className="text-caption-md text-charcoal">@{user.username}</p>
                                        </div>
                                    </div>
                                    <span className={`px-sm py-xxs rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        user.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
                                    }`}>
                                        {user.status === 'active' ? t('user_management.active') : t('user_management.locked')}
                                    </span>
                                </div>

                                <div className="p-md bg-cloud rounded-md space-y-sm mb-xl">
                                    <div className="flex items-center gap-sm">
                                        <Briefcase size={14} className="text-steel" />
                                        <span className="text-caption-md text-graphite w-24">{t('user_management.department')}:</span>
                                        <span className="text-caption-bold text-ink truncate">{user.department || t('user_management.unassigned')}</span>
                                    </div>
                                    <div className="flex items-center gap-sm">
                                        <Hash size={14} className="text-steel" />
                                        <span className="text-caption-md text-graphite w-24">{t('user_management.employee_id')}:</span>
                                        <span className="text-caption-bold text-primary font-mono">{user.employee_code || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-sm">
                                        <Shield size={14} className="text-steel" />
                                        <span className="text-caption-md text-graphite w-24">{t('user_management.authority')}:</span>
                                        <span className="text-caption-bold text-ink capitalize">{user.role}</span>
                                    </div>
                                </div>

                                <div className="flex gap-md pt-md border-t border-fog">
                                    <button 
                                        onClick={() => handleToggleStatus(user.user_id, user.status)}
                                        className={`flex-1 py-xs rounded-md text-caption-bold transition flex items-center justify-center gap-xxs border ${
                                            user.status === 'active' 
                                                ? 'text-red-500 border-red-100 hover:bg-red-50' 
                                                : 'text-green-600 border-green-100 hover:bg-green-50'
                                        }`}
                                    >
                                        {user.status === 'active' ? <><UserX size={14} /> {t('user_management.disable')}</> : <><UserCheck size={14} /> {t('user_management.activate')}</>}
                                    </button>
                                    <select 
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                        className="flex-1 py-xs bg-cloud border border-fog rounded-md text-caption-bold text-ink px-sm outline-none focus:border-primary"
                                    >
                                        <option value="engineer">{t('user_management.engineer')}</option>
                                        <option value="manager">{t('user_management.manager')}</option>
                                        <option value="security">{t('user_management.security')}</option>
                                        <option value="admin">{t('user_management.administrator')}</option>
                                    </select>
                                    <button className="p-xs text-steel hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Provisioning Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-md">
                    <div className="bg-paper w-full max-w-lg rounded-xl shadow-floating z-10 border border-fog overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="px-xl py-md border-b border-fog flex justify-between items-center bg-cloud">
                            <div className="flex items-center gap-sm text-primary">
                                <UserPlus size={24} />
                                <h3 className="text-display-xs text-ink">{t('user_management.user_provisioning')}</h3>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-steel hover:text-ink transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-xl space-y-xl">
                            {formError && <Alert message={formError} type="error" />}

                            <div className="grid grid-cols-2 gap-xl">
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('user_management.legal_name')} *</label>
                                    <input 
                                        required value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        className="w-full bg-cloud border border-fog px-md py-sm rounded-md outline-none focus:border-primary text-body-md"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('user_management.employee_code')} *</label>
                                    <input 
                                        required value={formData.employee_code}
                                        onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
                                        className="w-full bg-cloud border border-fog px-md py-sm rounded-md outline-none focus:border-primary text-body-md font-mono"
                                        placeholder="HCL_001"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('user_management.username')} *</label>
                                    <input 
                                        required value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full bg-cloud border border-fog px-md py-sm rounded-md outline-none focus:border-primary text-body-md"
                                        placeholder="jdoe_admin"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('user_management.secure_token')} *</label>
                                    <input 
                                        type="password" required value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-cloud border border-fog px-md py-sm rounded-md outline-none focus:border-primary text-body-md"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('user_management.corporate_email')}</label>
                                    <input 
                                        type="email" value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-cloud border border-fog px-md py-sm rounded-md outline-none focus:border-primary text-body-md"
                                        placeholder="j.doe@hcl.com"
                                    />
                                </div>
                                <div className="space-y-xs">
                                    <label className="text-caption-bold uppercase text-ink">{t('user_management.primary_department')}</label>
                                    <input 
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        className="w-full bg-cloud border border-fog px-md py-sm rounded-md outline-none focus:border-primary text-body-md"
                                        placeholder="Engineering Operations"
                                    />
                                </div>
                            </div>

                            <div className="space-y-xs">
                                <label className="text-caption-bold uppercase text-ink">{t('user_management.access_hierarchy')} *</label>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full bg-cloud border border-fog px-md py-sm rounded-md outline-none focus:border-primary text-body-md font-bold"
                                >
                                    <option value="engineer">{t('user_management.standard_engineer_access')}</option>
                                    <option value="manager">{t('user_management.management_approvals')}</option>
                                    <option value="security">{t('user_management.facility_security')}</option>
                                    <option value="admin">{t('user_management.global_admin')}</option>
                                </select>
                            </div>

                            <div className="flex gap-md justify-end pt-md">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-xl py-sm text-caption-bold text-graphite hover:bg-cloud rounded-md transition">{t('common.cancel')}</button>
                                <button 
                                    type="submit" disabled={submitting}
                                    className="bg-primary text-on-ink px-xl py-sm rounded-md font-bold hover:bg-primary-deep shadow-soft-lift disabled:opacity-50"
                                >
                                    {submitting ? t('user_management.provisioning') : t('user_management.provision_account')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPage;
