import { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import PrimaryButton from '../common/PrimaryButton';
import { eventsData } from '../../data/events';

/**
 * EventsPreview Section
 * Previews upcoming campus hackathons, technical workshops, and networking meetups.
 * Includes interactive demo registration feedback.
 */
const EventsPreview = () => {
  const [registeredEvents, setRegisteredEvents] = useState({});

  const handleRegister = (eventId) => {
    setRegisteredEvents((prev) => ({
      ...prev,
      [eventId]: true,
    }));
  };

  return (
    <section id="events" className="py-20 sm:py-24 bg-[#F8F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Campus Calendar"
          title="Never Miss What's Happening on Campus"
          description="Discover workshops, hackathons, competitions, and other exciting opportunities around your college."
          align="center"
        />

        {/* 3 Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {eventsData.map((event) => {
            const isRegistered = registeredEvents[event.id];

            return (
              <div
                key={event.id}
                className="group flex flex-col justify-between bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-[#CBD5E1] transition-all duration-300"
              >
                <div>
                  {/* Category & Sample Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E8EDF7] text-[#5277D9]">
                      {event.category}
                    </span>
                    <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-gray-100 text-[#667085] border border-gray-200">
                      Sample Event
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#17233B] tracking-tight group-hover:text-[#5277D9] transition-colors duration-200">
                    {event.title}
                  </h3>

                  {/* Date, Time & Location Pills */}
                  <div className="mt-4 space-y-2 text-xs text-[#667085]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#5277D9] shrink-0" />
                      <span className="font-medium text-[#17233B]">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#667085] shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#667085] shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 pt-4 border-t border-[#E5E7EB]/80 text-sm text-[#667085] leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Footer: Organizer & Register CTA */}
                <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#667085]">Host</p>
                    <p className="text-xs font-semibold text-[#17233B] truncate max-w-[130px]">
                      {event.organizer}
                    </p>
                  </div>

                  {isRegistered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      RSVP Confirmed
                    </span>
                  ) : (
                    <PrimaryButton
                      size="sm"
                      variant="primary"
                      onClick={() => handleRegister(event.id, event.title)}
                      className="text-xs"
                      icon={<ArrowRight className="w-3 h-3" />}
                    >
                      Register
                    </PrimaryButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Integration note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-[#667085] inline-flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5E7EB]">
            <Sparkles className="w-3.5 h-3.5 text-[#5277D9]" />
            Official college clubs can publish campus notices, issue digital tickets, and broadcast event updates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EventsPreview;
