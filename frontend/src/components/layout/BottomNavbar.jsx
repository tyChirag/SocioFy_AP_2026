import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, MessageSquare, User } from 'lucide-react';

/**
 * BottomNavbar Component
 * Compact mobile navigation bar docked at the bottom of the viewport.
 * Links: Home, Explore, Create, Messages, Profile.
 *
 * @param {Object} props
 * @param {Function} [props.onCreateClick] - Trigger to scroll or focus composer
 */
const BottomNavbar = ({ onCreateClick }) => {
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
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-[#5277D9] font-bold' : 'text-[#667085] hover:text-[#17233B]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
