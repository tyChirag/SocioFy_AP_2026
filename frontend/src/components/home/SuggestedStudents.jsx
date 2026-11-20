import { useState } from 'react';
import { UserPlus, Check } from 'lucide-react';
import Avatar from '../common/Avatar';
import { suggestedStudentsData } from '../../data/students';

/**
 * SuggestedStudents Component ("People You May Know")
 * Renders a compact card suggesting campus peers with interactive Connect button state.
 */
const SuggestedStudents = () => {
  // Store connected student IDs in local component state
  const [connectedIds, setConnectedIds] = useState([]);

  const toggleConnect = (id) => {
    setConnectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-xs">
      <h3 className="text-sm font-bold text-[#17233B] tracking-tight">
        People You May Know
      </h3>
      <p className="text-xs text-[#667085] mt-0.5">Students in your university</p>

      <div className="mt-3.5 space-y-3">
        {suggestedStudentsData.map((student) => {
          const isConnected = connectedIds.includes(student.id);

          return (
            <div
              key={student.id}
              className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-[#E5E7EB]/60 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  src={student.avatar}
                  initials={student.initials}
                  alt={student.name}
                  size="sm"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#17233B] truncate leading-tight">
                    {student.name}
                  </h4>
                  <p className="text-[11px] text-[#667085] truncate leading-tight mt-0.5">
                    {student.department}
                  </p>
                  <p className="text-[10px] text-[#667085] truncate">
                    {student.college}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleConnect(student.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#E8EDF7] text-[#5277D9] hover:bg-[#5277D9] hover:text-white'
                }`}
              >
                {isConnected ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Request Sent</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedStudents;
