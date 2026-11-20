import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

/**
 * BottomNavbar Component
 * Compact mobile navigation bar docked at the bottom of the viewport.
 * Links: Home, Explore, Create, Messages, Profile.
 *
 * @param {Object} props
 * @param {Function} [props.onCreateClick] - Trigger to scroll or focus composer
 */
const BottomNavbar = ({ onCreateClick }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    {
      label: 'Create',
      isAction: true,
      icon: PlusCircle,
      action: onCreateClick,
    },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] py-2 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="flex flex-col items-center justify-center gap-0.5 text-[#5277D9] hover:text-[#4364BE] focus:outline-none"
              >
                <Icon className="w-6 h-6 stroke-[2.2]" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                const isItemActive =
                  isActive || (item.path !== '/' && location.pathname.startsWith(item.path));
                return `flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                  isItemActive ? 'text-[#5277D9] font-bold' : 'text-[#667085] hover:text-[#17233B]'
                }`;
              }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.path === '/messages' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#5277D9] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
