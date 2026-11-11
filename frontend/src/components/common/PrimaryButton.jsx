/**
 * PrimaryButton Component
 * Standardized button supporting primary, secondary, and ghost variants.
 * Can be rendered as either an HTML <button> or an <a> anchor link.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label or nested content
 * @param {'primary' | 'secondary' | 'navy' | 'ghost' | 'outline-white'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.href] - If supplied, component renders as an <a> tag
 * @param {Function} [props.onClick] - Click handler
 * @param {React.ReactNode} [props.icon] - Optional trailing icon
 * @param {React.ReactNode} [props.iconLeft] - Optional leading icon
 * @param {string} [props.className=''] - Extra classes
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.type='button']
 */
const PrimaryButton = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  icon,
  iconLeft,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) => {
  // Base styling adhering to 10-14px border radius and clear states
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  // Variant styling matching design specifications
  const variantClasses = {
    primary:
      'bg-[#5277D9] text-white hover:bg-[#4364BE] focus-visible:ring-[#5277D9] shadow-sm hover:shadow',
    secondary:
      'bg-white text-[#17233B] border border-[#E5E7EB] hover:bg-[#E8EDF7]/50 hover:border-[#D1D5DB] focus-visible:ring-[#5277D9] shadow-xs',
    navy:
      'bg-[#17233B] text-white hover:bg-[#233558] focus-visible:ring-[#17233B] shadow-sm',
    ghost:
      'bg-transparent text-[#17233B] hover:bg-[#E8EDF7] focus-visible:ring-[#5277D9]',
    'outline-white':
      'bg-transparent text-white border border-white/30 hover:bg-white/10 focus-visible:ring-white',
  };

  // Size styling
  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
    sizeClasses[size] || sizeClasses.md
  } ${className}`;

  if (href) {
    return (
      <a href={href} onClick={onClick} className={combinedClasses} {...rest}>
        {iconLeft && <span className="shrink-0">{iconLeft}</span>}
        <span>{children}</span>
        {icon && <span className="shrink-0">{icon}</span>}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...rest}
    >
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      <span>{children}</span>
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

export default PrimaryButton;
