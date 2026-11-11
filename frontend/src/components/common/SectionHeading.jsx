/**
 * SectionHeading Component
 * Provides a standardized, clean heading and description block for landing page sections.
 *
 * @param {Object} props
 * @param {string} [props.badge] - Optional small badge text displayed above the title
 * @param {string} props.title - Primary heading text
 * @param {string} [props.description] - Subheading / descriptive paragraph
 * @param {'center' | 'left'} [props.align='center'] - Alignment mode
 * @param {boolean} [props.light=false] - Invert text colors for dark backgrounds
 * @param {string} [props.className=''] - Additional CSS classes
 */
const SectionHeading = ({
  badge,
  title,
  description,
  align = 'center',
  light = false,
  className = '',
}) => {
  const isCenter = align === 'center';

  return (
    <div
      className={`max-w-3xl ${isCenter ? 'mx-auto text-center' : 'text-left'} mb-12 sm:mb-16 ${className}`}
    >
      {badge && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 ${
          light
            ? 'bg-white/10 text-white/90 border border-white/20'
            : 'bg-[#E8EDF7] text-[#5277D9] border border-[#5277D9]/20'
        }`}>
          <span>{badge}</span>
        </div>
      )}

      <h2
        className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight ${
          light ? 'text-white' : 'text-[#17233B]'
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            light ? 'text-gray-300' : 'text-[#667085]'
          } ${isCenter ? 'max-w-2xl mx-auto' : ''}`}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
