import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Avatar Component
 * Displays a student's profile picture or elegant fallback initials.
 * Centrally synchronized with application state and database profile images.
 *
 * Usage examples:
 *   <Avatar user={user} size="medium" />
 *   <Avatar user={student} size="sm" />
 *   <Avatar src={customUrl} initials="AB" size="lg" />
 *
 * @param {Object} props
 * @param {Object} [props.user] - Student / user object ({ id, fullName, name, profileImage, avatar })
 * @param {string} [props.src] - Direct image URL (fallback if user.profileImage is absent)
 * @param {string} [props.alt] - Accessible image description
 * @param {string} [props.initials] - 1-2 letter fallback initials
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'small' | 'medium' | 'large'} [props.size='md'] - Avatar dimensions
 * @param {string} [props.className=''] - Extra Tailwind classes
 */
const Avatar = ({
  user,
  src,
  alt,
  initials,
  size = 'md',
  className = '',
}) => {
  const { currentUser } = useAuth();
  const [imgError, setImgError] = useState(false);

  // Determine if this avatar represents the currently logged-in user
  const userId = user?.id || user?.userId;
  const currentUserId = currentUser?.id || currentUser?.userId;
  const isCurrentUser = Boolean(userId && currentUserId && Number(userId) === Number(currentUserId));

  // Determine the canonical profile image source
  let resolvedSrc = null;

  if (isCurrentUser) {
    // For the logged in user, prioritize the reactive global state's profileImage
    resolvedSrc = currentUser?.profileImage || user?.profileImage || user?.avatar || src || null;
  } else if (user) {
    resolvedSrc = user.profileImage || user.avatar || src || null;
  } else {
    resolvedSrc = src || null;
  }

  // Derive student name for accessible alt and initials
  const resolvedName = (isCurrentUser ? currentUser?.fullName : null) || user?.fullName || user?.name || alt || '';

  // Derive initials
  const resolvedInitials = initials || (resolvedName
    ? resolvedName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('')
    : 'SF');

  const resolvedAlt = alt || (resolvedName ? `${resolvedName}'s profile avatar` : 'Student Avatar');

  // Reset error state whenever resolvedSrc changes
  useEffect(() => {
    setImgError(false);
  }, [resolvedSrc]);

  // Normalize size classes (supporting both shorthand and descriptive names)
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    small: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    medium: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    large: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
    '3xl': 'w-32 h-32 text-3xl',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  if (resolvedSrc && !imgError) {
    return (
      <img
        src={resolvedSrc}
        alt={resolvedAlt}
        className={`${selectedSize} rounded-full object-cover border border-[#E5E7EB] shrink-0 ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${selectedSize} rounded-full bg-[#17233B] text-white font-bold flex items-center justify-center shrink-0 border border-[#E5E7EB] select-none ${className}`}
      aria-label={resolvedAlt}
    >
      {resolvedInitials}
    </div>
  );
};

export default Avatar;
