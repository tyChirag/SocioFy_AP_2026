import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Users,
  FolderGit2,
  Calendar,
  MessageSquare,
  User,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

/**
 * Sidebar Component
 * Left navigation sidebar on desktop.
 * Highlights the active route using NavLink and keeps clean styling.
 */
const Sidebar = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Communities', path: '/communities', icon: Users },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-full bg-white rounded-2xl border border-[#E5E7EB] p-3 shadow-xs">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                const isItemActive =
                  isActive || (item.path !== '/' && location.pathname.startsWith(item.path));
                return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isItemActive
                    ? 'bg-[#E8EDF7] text-[#5277D9] font-semibold'
                    : 'text-[#17233B] hover:bg-[#F8F9FC] hover:text-[#5277D9]'
                }`;
              }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.path === '/messages' && unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#5277D9] text-white text-[11px] font-bold shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
