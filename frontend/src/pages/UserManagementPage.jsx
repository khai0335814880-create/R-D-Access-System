import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Users, UserPlus, Shield, UserCheck, UserX, Trash2, Edit3, Search, X } from 'lucide-react';

const UserManagementPage = () => {
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
        employee_id: ''
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
            setError('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await userService.updateUser(id, { status: newStatus });
            setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
        } catch (err) {
            setError('Cập nhật trạng thái người dùng thất bại');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await userService.updateUser(id, { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            setError('Cập nhật quyền hạn thất bại');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');

        // Basic validation
        if (!formData.username || !formData.password || !formData.full_name || !formData.employee_id) {
            setFormError('Vui lòng điền đầy đủ các trường bắt buộc (*)');
            setSubmitting(false);
            return;
        }

        try {
            await authService.register(formData);
            setShowAddModal(false);
            setFormData({
                username: '',
                password: '',
                email: '',
                full_name: '',
                role: 'engineer',
                department: '',
                employee_id: ''
            });
            fetchUsers(); // Refresh list
        } catch (err) {
            setFormError(err.response?.data?.message || 'Đăng ký thành viên mới thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user => 
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.employee_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto transition-colors duration-300 text-slate-800 dark:text-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center">
                        <Users className="text-indigo-600 dark:text-indigo-400 mr-3" size={36} /> Quản Lý Người Dùng
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Quản lý tài khoản, phân quyền và trạng thái nhân viên trong hệ thống.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#0F5FDC] hover:bg-blue-600 text-white px-6 py-3 rounded-none font-semibold transition flex items-center shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                    <UserPlus size={20} className="mr-2" /> Thêm Thành Viên Mới
                </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-none flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng nhân sự</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{users.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-none flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-4">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Đang hoạt động</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{users.filter(u => u.status === 'active').length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-none flex items-center justify-center text-amber-600 dark:text-amber-400 mr-4">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cấp quản lý</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{users.filter(u => u.role !== 'engineer').length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-none flex items-center justify-center text-rose-600 dark:text-rose-400 mr-4">
                        <UserX size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Đã tạm khóa</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{users.filter(u => u.status !== 'active').length}</p>
                    </div>
                </div>
            </div>

            {error && <Alert message={error} type="error" onClose={() => setError('')} />}

            {/* Controls */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-none shadow-sm border border-slate-200 dark:border-slate-800 mb-6 transition-colors duration-300">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên, username, mã NV..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white transition-all duration-300"
                    />
                </div>
            </div>

            {/* User Grid */}
            {loading ? (
                <div className="py-20 flex justify-center"><LoadingSpinner /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-none bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xl mr-4 uppercase">
                                            {user.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-none">{user.full_name}</h3>
                                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">@{user.username}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider ${
                                        user.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                                    }`}>
                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                        <Shield size={14} className="mr-2 text-slate-400 dark:text-slate-500" />
                                        <span className="font-semibold uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400">Quyền hạn: </span>
                                        <span className="ml-2 font-medium capitalize text-slate-700 dark:text-slate-200">{user.role}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                        <Edit3 size={14} className="mr-2 text-slate-400 dark:text-slate-500" />
                                        <span className="font-semibold uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400">Bộ phận: </span>
                                        <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">{user.department || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                        <UserCheck size={14} className="mr-2 text-slate-400 dark:text-slate-500" />
                                        <span className="font-semibold uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400">Mã NV: </span>
                                        <span className="ml-2 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{user.employee_id || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex border-t border-slate-100 dark:border-slate-800 pt-4 gap-2">
                                    <button 
                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                        className={`flex-1 py-2 rounded-none text-sm font-bold transition flex items-center justify-center ${
                                            user.status === 'active' 
                                                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20' 
                                                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                                        }`}
                                    >
                                        {user.status === 'active' ? <><UserX size={16} className="mr-2" /> Khóa</> : <><UserCheck size={16} className="mr-2" /> Mở khóa</>}
                                    </button>
                                    <select 
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="flex-1 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-none text-sm font-bold text-slate-600 dark:text-slate-300 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    >
                                        <option value="engineer">Engineer</option>
                                        <option value="manager">Manager</option>
                                        <option value="security">Security</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button className="p-2 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-none transition">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-300 transform">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                                <UserPlus size={24} className="text-indigo-600 dark:text-indigo-400 mr-2" /> Thêm Thành Viên Mới
                            </h2>
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            {formError && <Alert message={formError} type="error" />}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Họ & Tên (*)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white text-sm"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Mã Nhân Viên (*)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white text-sm"
                                        placeholder="NV001"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Username (*)</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white text-sm"
                                        placeholder="nva01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Mật khẩu (*)</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white text-sm"
                                        placeholder="a.nguyen@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bộ phận</label>
                                    <input 
                                        type="text" 
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white text-sm"
                                        placeholder="R&D Software"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Quyền Hạn (*)</label>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:text-white text-sm font-semibold"
                                >
                                    <option value="engineer">Engineer (Kỹ Sư)</option>
                                    <option value="manager">Manager (Quản Lý)</option>
                                    <option value="security">Security (Bảo Vệ)</option>
                                    <option value="admin">Admin (Quản Trị Kỹ Thuật)</option>
                                </select>
                            </div>

                            <div className="flex border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-none font-semibold text-sm transition-all border border-slate-200 dark:border-slate-700"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-[#0F5FDC] hover:bg-blue-600 text-white rounded-none font-semibold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center"
                                >
                                    Tạo Tài Khoản
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
