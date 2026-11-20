import { Calendar } from 'lucide-react';
import { eventsData } from '../../data/events';

/**
 * UpcomingEvents Component
 * Renders a compact summary of upcoming campus activities.
 */
const UpcomingEvents = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
      <div className="flex items-center justify-between mb-0.5">
        <h3 className="text-sm font-bold text-[#17233B] tracking-tight">
          Upcoming Events
        </h3>
        <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
          Campus
        </span>
      </div>
      <p className="text-xs text-[#667085]">Workshops, hackathons & meetups</p>

      <div className="mt-3.5 space-y-3">
        {eventsData.map((event) => (
          <div
            key={event.id}
            className="p-2.5 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB]/70 space-y-1 hover:border-[#5277D9]/40 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#5277D9] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {event.category}
              </span>
              <span className="text-[#667085]">{event.date}</span>
            </div>

            <h4 className="text-xs font-bold text-[#17233B] truncate leading-tight">
              {event.title}
            </h4>

            <p className="text-[11px] text-[#667085] line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
