import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import ToastNotification from './ToastNotification';

/**
 * TopNavbar Component
 * Authenticated header bar featuring:
 * - Brand logo linking to /home
 * - Search bar ("Search students, communities, projects...")
 * - Notification & Messages shortcuts
 * - User Profile avatar with dropdown (My Profile, Settings, Logout)
 */
const TopNavbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Consume synchronized global authentication state
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const userName = currentUser?.fullName || 'Student User';
  const userEmail = currentUser?.collegeEmail || currentUser?.email || 'student@college.edu';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E7EB] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Logo */}
          <Link
            to="/home"
            className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
            aria-label="SocioFy Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-[#17233B] flex items-center justify-center text-white group-hover:bg-[#5277D9] transition-colors duration-200">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#17233B]">
              Socio<span className="text-[#5277D9]">Fy</span>
            </span>
          </Link>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search students, communities, projects..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-[#17233B] placeholder-[#667085] focus:outline-none focus:bg-white focus:border-[#5277D9] focus:ring-1 focus:ring-[#5277D9] transition-all"
              />
            </div>
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Messages Shortcut */}
            <Link
              to="/messages"
              className="p-2 rounded-xl text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC] transition-colors relative"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#5277D9] text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Notifications Shortcut with Dropdown */}
            <div className="relative">
              <button
                type="button"
                className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                  notificationsOpen
                    ? 'bg-[#E8EDF7] text-[#5277D9]'
                    : 'text-[#667085] hover:text-[#17233B] hover:bg-[#F8F9FC]'
                }`}
                title="Notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              <NotificationDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F8F9FC] transition-colors cursor-pointer focus:outline-none"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <Avatar
                  user={currentUser}
                  size="sm"
                />
                <ChevronDown className="w-3.5 h-3.5 text-[#667085] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2.5 border-b border-[#E5E7EB]">
                    <p className="text-sm font-bold text-[#17233B] truncate">{userName}</p>
                    <p className="text-xs text-[#667085] truncate">{userEmail}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#17233B] hover:bg-[#F8F9FC] hover:text-[#5277D9] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#667085]" />
                    <span>My Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      alert('Settings feature coming soon.');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#17233B] hover:bg-[#F8F9FC] hover:text-[#5277D9] transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-[#667085]" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-[#E5E7EB] my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time In-App Message Toast Notification */}
      <ToastNotification />
    </header>
  );
};

export default TopNavbar;
