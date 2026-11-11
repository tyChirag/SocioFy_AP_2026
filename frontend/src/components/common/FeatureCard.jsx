import { Check } from 'lucide-react';

/**
 * FeatureCard Component
 * Renders an individual feature card with an icon, badge, title, summary,
 * and bulleted feature points.
 *
 * @param {Object} props
 * @param {string} props.title - Feature title
 * @param {string} [props.badge] - Category or status pill
 * @param {string} props.description - Feature description
 * @param {string[]} [props.points] - Bullet items highlighting capabilities
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} [props.accentColor] - Hex or theme color for the icon background
 */
const FeatureCard = ({
  title,
  badge,
  description,
  points = [],
  icon: Icon,
  accentColor,
}) => {
  return (
    <div className="group relative flex flex-col justify-between h-full bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 transition-all duration-300 hover:shadow-lg hover:border-[#CBD5E1] hover:-translate-y-1">
      <div>
        {/* Top Header: Icon & optional Badge */}
        <div className="flex items-center justify-between mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: '#E8EDF7',
              color: accentColor || '#5277D9',
            }}
          >
            {Icon && <Icon className="w-6 h-6 stroke-[2]" />}
          </div>

          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F8F9FC] text-[#667085] border border-[#E5E7EB]">
              {badge}
            </span>
          )}
        </div>

        {/* Card Title & Description */}
        <h3 className="text-xl font-bold text-[#17233B] tracking-tight group-hover:text-[#5277D9] transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[#667085] leading-relaxed">
          {description}
        </p>

        {/* Feature Highlights List */}
        {points && points.length > 0 && (
          <ul className="mt-5 space-y-2.5 pt-4 border-t border-[#E5E7EB]/70">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#17233B]">
                <span className="shrink-0 w-4 h-4 rounded-full bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;
