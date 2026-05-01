import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  MonitorSmartphone, 
  CheckSquare, 
  ShieldAlert, 
  History,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  QrCode,
  PieChart,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  ClipboardCheck,
  HelpCircle,
  Settings
} from 'lucide-react';

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  const getMenuItems = () => {
    const roleItems = [];
    switch (user?.role) {
      case 'engineer':
        roleItems.push(
          { path: '/engineer-stats', icon: PieChart, label: 'Thống kê cá nhân' },
          { path: '/devices', icon: MonitorSmartphone, label: 'Danh mục thiết bị' },
          { path: '/register-device', icon: PlusCircle, label: 'Đăng ký thiết bị' },
          { path: '/qr-tags', icon: QrCode, label: 'Tải mã QR' },
        );
        break;
      case 'manager':
        roleItems.push(
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/approvals', icon: ClipboardCheck, label: 'Phê duyệt thiết bị' },
          { path: '/users', icon: Users, label: 'Quản lý nhân sự' },
          { path: '/audit', icon: History, label: 'Lịch sử ra vào' },
        );
        break;
      case 'admin':
        roleItems.push(
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/users', icon: Users, label: 'Quản lý nhân sự' },
          { path: '/audit', icon: History, label: 'Nhật ký hệ thống' },
        );
        break;
      case 'security':
        roleItems.push(
          { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/audit', icon: History, label: 'Lịch sử ra vào' },
        );
        break;
      default:
        break;
    }

    return [
      {
        category: 'DANH MỤC CHÍNH',
        items: roleItems
      },
      {
        category: 'TIỆN ÍCH & HỖ TRỢ',
        items: [
          { path: '/rules', icon: ShieldCheck, label: 'Quy định R&D' },
          { path: '/support', icon: HelpCircle, label: 'Hỗ trợ kỹ thuật' },
          { path: '/settings', icon: Settings, label: 'Cài đặt' },
        ]
      }
    ];
  };

  const navGroups = getMenuItems();

  return (
    <aside className={`bg-slate-950 border-r border-slate-800/50 text-white transition-all duration-300 ease-in-out flex flex-col h-full ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-800/50 h-16">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="bg-[#0F5FDC] p-2 rounded-xl flex-shrink-0 shadow-lg shadow-blue-500/30">
            <ShieldAlert size={20} className="text-white" />
          </div>
          {isExpanded && <span className="font-extrabold text-lg whitespace-nowrap tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">R&D Access</span>}
        </div>
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/50 transition-colors hidden md:block">
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-3">
            {isExpanded && <h4 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{group.category}</h4>}
            <div className="space-y-2">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#0F5FDC] text-white shadow-lg shadow-blue-500/20 font-bold' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white font-semibold'
                    }`
                  }
                >
                  <item.icon size={22} className="flex-shrink-0" />
                  {isExpanded && <span className="whitespace-nowrap text-base">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={logout}
          className="flex items-center space-x-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full px-4 py-3.5 rounded-xl transition-colors font-bold text-base"
        >
          <LogOut size={22} className="flex-shrink-0" />
          {isExpanded && <span>Đăng Xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
