import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { FiLogOut, FiUser } from 'react-icons/fi';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showBadge, setShowBadge] = useState(false);
  const [badgeUrl, setBadgeUrl] = useState('');

  const handleShowBadge = async () => {
    if (!badgeUrl) {
      try {
        const data = await authService.getMyQR();
        setBadgeUrl(data.qrImage);
      } catch (err) {
        console.error("Failed to load badge QR", err);
      }
    }
    setShowBadge(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'engineer':
        return [
          { label: 'Devices', path: '/devices' },
          { label: 'Check-in', path: '/check-in' },
        ];
      case 'manager':
        return [
          { label: 'Approvals', path: '/approvals' },
        ];
      case 'security':
        return [
          { label: 'Dashboard', path: '/dashboard' },
        ];
      default:
        return [];
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            R&D Access Management
          </Link>
          
          {user && (
            <div className="flex items-center gap-6">
              <nav className="flex gap-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="px-3 py-2 rounded hover:bg-blue-700 transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              <div className="text-sm border-l pl-6">
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-blue-100 capitalize">{user.role}</p>
              </div>

              <button
                onClick={handleShowBadge}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-700 transition"
              >
                <FiUser /> My Badge
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-700 transition"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center text-gray-800 relative max-w-sm w-full mx-4">
            <button 
              onClick={() => setShowBadge(false)}
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">Employee Badge</h2>
            <p className="text-gray-600 mb-6">{user?.full_name}</p>
            {badgeUrl ? (
              <img src={badgeUrl} alt="Employee QR Code" className="mx-auto w-48 h-48 mb-4 border border-gray-200" />
            ) : (
              <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                Loading...
              </div>
            )}
            <p className="text-sm text-gray-500">Scan this at the Kiosk to log in</p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;