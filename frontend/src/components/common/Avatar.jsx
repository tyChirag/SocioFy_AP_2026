/**
 * Avatar Component
 * Displays a student's profile picture or elegant fallback initials.
 *
 * @param {Object} props
 * @param {string} [props.src] - Image URL
 * @param {string} [props.alt] - Accessible name
 * @param {string} [props.initials] - 1-2 letter fallback initials
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Avatar dimensions
 * @param {string} [props.className=''] - Extra classes
 */
const Avatar = ({ src, alt = 'Student Avatar', initials = 'SF', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${selectedSize} rounded-full object-cover border border-[#E5E7EB] shrink-0 ${className}`}
        onError={(e) => {
          // If image fails to load, hide image and show fallback
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${selectedSize} rounded-full bg-[#17233B] text-white font-bold flex items-center justify-center shrink-0 border border-[#E5E7EB] ${className}`}
      aria-label={alt}
    >
      {initials}
    </div>
  );
};

export default Avatar;
