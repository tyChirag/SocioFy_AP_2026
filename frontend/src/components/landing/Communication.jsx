import { useState } from 'react';
import {
  FileText,
  Mic,
  Phone,
  Video,
  CheckCircle2,
  Paperclip,
  Send,
  MoreVertical,
  Play,
  ShieldCheck,
} from 'lucide-react';
import SectionHeading from '../common/SectionHeading';

/**
 * Communication Section
 * Showcases the messaging capabilities of SocioFy with feature bullet points
 * alongside an authentic mockup of the private and group messaging interface.
 *
 * NOTE: This is purely a visual simulation — no actual backend or WebRTC is included.
 */
const Communication = () => {
  const [activeTab, setActiveTab] = useState('group'); // 'group' or 'direct'
  const [demoMessage, setDemoMessage] = useState('');

  const communicationFeatures = [
    {
      title: 'One-to-One Private Messaging',
      desc: 'Direct, focused conversations with classmates, mentors, or project partners.',
    },
    {
      title: 'Group Conversations & Study Circles',
      desc: 'Form dedicated group chats for coursework teams, hackathon squads, and clubs.',
    },
    {
      title: 'Image & File Sharing',
      desc: 'Send lecture slides, PDFs, code snippets, and design exports seamlessly.',
    },
    {
      title: 'Voice Messages',
      desc: 'Drop quick audio explanations when typing out complex algorithms is too slow.',
    },
    {
      title: 'Optional Voice & Video Calls',
      desc: 'One-click calls directly from any project room when your team needs a live sync.',
    },
    {
      title: 'Online Status & Typing Indicators',
      desc: 'Know when teammates are studying at the library or ready to collaborate.',
    },
  ];

  return (
    <section id="communication" className="py-20 sm:py-24 bg-white border-y border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Seamless Messaging"
          title="Stay Connected Beyond the Classroom"
          description="Keep conversations going, share ideas, and collaborate with students through private and group communication."
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Feature Highlights List (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EDF7] text-[#5277D9] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Verified Communication</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#17233B] tracking-tight">
              Collaborate in real time without leaving your campus ecosystem.
            </h3>

            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              No need to shuffle across random third-party messaging apps with strangers. SocioFy provides a dedicated, safe, and academically focused messaging environment.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-2">
              {communicationFeatures.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#17233B]">{item.title}</h4>
                    <p className="text-xs text-[#667085] leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9FC] border border-[#E5E7EB] text-xs text-[#667085] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>All student chats are encrypted and scoped to verified university members.</span>
            </div>
          </div>

          {/* Right Column: Realistic Messaging Interface Preview (7 cols on lg) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FC] shadow-xl overflow-hidden">
              {/* Window Header */}
              <div className="bg-[#17233B] px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-2 text-xs font-medium text-gray-200">
                    SocioFy Chat Preview (Simulation)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Campus Network Live</span>
                </div>
              </div>

              {/* Chat Layout: Sidebar + Active Conversation */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] bg-white">
                {/* Channel / Conversation List (4 cols on md) */}
                <div className="hidden md:block md:col-span-5 border-r border-[#E5E7EB] bg-[#F8F9FC]/60 p-3">
                  {/* Channels filter toggle */}
                  <div className="flex rounded-lg bg-gray-200/70 p-1 mb-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTab('group')}
                      className={`flex-1 py-1 text-center rounded-md transition-all ${
                        activeTab === 'group'
                          ? 'bg-white text-[#17233B] shadow-xs'
                          : 'text-[#667085] hover:text-[#17233B]'
                      }`}
                    >
                      Groups (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('direct')}
                      className={`flex-1 py-1 text-center rounded-md transition-all ${
                        activeTab === 'direct'
                          ? 'bg-white text-[#17233B] shadow-xs'
                          : 'text-[#667085] hover:text-[#17233B]'
                      }`}
                    >
                      Direct (4)
                    </button>
                  </div>

                  {/* Conversation Items */}
                  <div className="space-y-1.5">
                    {/* Item 1: Active */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs flex items-center gap-2.5 cursor-pointer">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-[#5277D9] text-white flex items-center justify-center font-bold text-xs">
                          {activeTab === 'group' ? 'EM' : 'AS'}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#17233B] truncate">
                            {activeTab === 'group' ? 'Event Mgmt Team' : 'Ananya Sharma'}
                          </p>
                          <span className="text-[10px] text-[#667085]">12:42</span>
                        </div>
                        <p className="text-[11px] text-[#5277D9] truncate font-medium">
                          {activeTab === 'group' ? 'Sneha: Pushed the schema!' : 'Sounds like a plan!'}
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-2.5 rounded-xl hover:bg-white/80 transition-colors flex items-center gap-2.5 cursor-pointer">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                          {activeTab === 'group' ? 'AI' : 'RM'}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#17233B] truncate">
                            {activeTab === 'group' ? 'AI Study Guild' : 'Rohan Mehta'}
                          </p>
                          <span className="text-[10px] text-[#667085]">10:15</span>
                        </div>
                        <p className="text-[11px] text-[#667085] truncate">
                          Meeting at library 4 PM?
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="p-2.5 rounded-xl hover:bg-white/80 transition-colors flex items-center gap-2.5 cursor-pointer">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                          {activeTab === 'group' ? 'CP' : 'DK'}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-400 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#17233B] truncate">
                            {activeTab === 'group' ? 'Competitive Coders' : 'Devansh Kumar'}
                          </p>
                          <span className="text-[10px] text-[#667085]">Yesterday</span>
                        </div>
                        <p className="text-[11px] text-[#667085] truncate">
                          Check problem #4 graph soln
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Chat Conversation Area (7 cols on md) */}
                <div className="col-span-1 md:col-span-7 flex flex-col justify-between bg-white">
                  {/* Chat Header with Voice / Video Call Icons */}
                  <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-[#5277D9] text-white flex items-center justify-center font-bold text-xs">
                          EM
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#17233B] flex items-center gap-1.5">
                          <span>Campus Event Mgmt Group</span>
                          <span className="text-[10px] bg-[#E8EDF7] text-[#5277D9] px-1.5 py-0.2 rounded font-medium">
                            Project Room
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#667085]">
                          4 students online • Active in Main Library
                        </p>
                      </div>
                    </div>

                    {/* Audio & Video Call Action Icons (Visual only) */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => alert('Voice call feature is a visual demonstration for the landing page.')}
                        title="Voice Call"
                        className="p-1.5 text-[#667085] hover:text-[#5277D9] hover:bg-[#E8EDF7] rounded-lg transition-colors cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Video call feature is a visual demonstration for the landing page.')}
                        title="Video Call"
                        className="p-1.5 text-[#667085] hover:text-[#5277D9] hover:bg-[#E8EDF7] rounded-lg transition-colors cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-[#667085] hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="p-4 space-y-3.5 flex-1 bg-[#F8F9FC]/30 overflow-y-auto max-h-[300px]">
                    <div className="text-center my-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#667085] font-medium">
                        Today • Project Sprint
                      </span>
                    </div>

                    {/* Incoming Message 1 */}
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        SP
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-bold text-[#17233B]">Sneha</span>
                          <span className="text-[10px] text-[#667085]">12:40 PM</span>
                        </div>
                        <div className="p-3 rounded-2xl rounded-tl-xs bg-white border border-[#E5E7EB] text-xs text-[#17233B] shadow-2xs leading-relaxed">
                          Hey team! I just finished the PostgreSQL database schema for the campus ticket QR scanner. Here's the spec:
                        </div>
                        {/* File Attachment Card */}
                        <div className="mt-1.5 p-2 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-2 max-w-xs shadow-2xs">
                          <div className="w-7 h-7 rounded-lg bg-[#E8EDF7] text-[#5277D9] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-[#17233B] truncate">
                              event_db_schema_v2.pdf
                            </p>
                            <p className="text-[10px] text-[#667085]">1.4 MB • PDF Document</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Outgoing Message (User) */}
                    <div className="flex flex-col items-end">
                      <div className="p-3 rounded-2xl rounded-tr-xs bg-[#5277D9] text-white text-xs shadow-2xs max-w-[85%] leading-relaxed">
                        Looks solid! I am wiring up the React frontend hooks to match these endpoints right now.
                      </div>
                      <span className="text-[10px] text-[#667085] mt-1 mr-1">12:42 PM • Read</span>
                    </div>

                    {/* Incoming Voice Note Preview */}
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        AR
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-bold text-[#17233B]">Aarav</span>
                          <span className="text-[10px] text-[#667085]">12:43 PM</span>
                        </div>
                        {/* Voice message player bubble */}
                        <div className="p-2.5 rounded-2xl rounded-tl-xs bg-white border border-[#E5E7EB] flex items-center gap-3 shadow-2xs">
                          <button
                            type="button"
                            className="w-7 h-7 rounded-full bg-[#5277D9] text-white flex items-center justify-center hover:bg-[#4364BE] transition-colors shrink-0"
                          >
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </button>
                          <div className="flex-1 min-w-[120px]">
                            <div className="flex items-center gap-1 h-4">
                              <span className="w-1 h-2 bg-[#5277D9] rounded-full"></span>
                              <span className="w-1 h-3 bg-[#5277D9] rounded-full"></span>
                              <span className="w-1 h-4 bg-[#5277D9] rounded-full"></span>
                              <span className="w-1 h-2 bg-[#5277D9] rounded-full"></span>
                              <span className="w-1 h-3 bg-gray-300 rounded-full"></span>
                              <span className="w-1 h-1.5 bg-gray-300 rounded-full"></span>
                              <span className="w-1 h-3.5 bg-gray-300 rounded-full"></span>
                            </div>
                            <span className="text-[10px] text-[#667085] font-mono">0:24 / 0:42</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div className="flex items-center gap-2 text-[11px] text-[#667085] italic pt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5277D9] animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5277D9] animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5277D9] animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                      <span>Sneha is typing...</span>
                    </div>
                  </div>

                  {/* Message Input Box Area */}
                  <div className="p-3 border-t border-[#E5E7EB] bg-white">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (demoMessage.trim()) {
                          alert(`Demo preview: Message "${demoMessage}" simulated.`);
                          setDemoMessage('');
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <button
                        type="button"
                        className="p-2 text-[#667085] hover:text-[#5277D9] hover:bg-[#E8EDF7] rounded-lg transition-colors"
                        title="Attach files"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-[#667085] hover:text-[#5277D9] hover:bg-[#E8EDF7] rounded-lg transition-colors hidden sm:block"
                        title="Voice note"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={demoMessage}
                        onChange={(e) => setDemoMessage(e.target.value)}
                        placeholder="Write a message to your team..."
                        className="flex-1 text-xs sm:text-sm bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-[#17233B] placeholder-[#667085] focus:outline-none focus:border-[#5277D9] transition-colors"
                      />

                      <button
                        type="submit"
                        className="p-2 rounded-xl bg-[#5277D9] text-white hover:bg-[#4364BE] transition-colors shrink-0 shadow-xs cursor-pointer"
                        title="Send Message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Communication;
