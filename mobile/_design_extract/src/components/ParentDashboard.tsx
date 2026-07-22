import React, { useState } from 'react';
import { ChildProfile, UpcomingEvent, Announcement } from '../types';

interface Props {
  childrenProfiles: ChildProfile[];
  events: UpcomingEvent[];
  announcements: Announcement[];
  onShowToast: (msg: string) => void;
}

export const ParentDashboard: React.FC<Props> = ({
  childrenProfiles,
  events,
  announcements,
  onShowToast,
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>('sarah');
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(null);

  const currentChild =
    childrenProfiles.find((c) => c.id === selectedChildId) || childrenProfiles[0];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Child Selector Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-[#1a1b25] text-lg font-bold">
            Child Selector
          </h2>
          <span className="text-xs font-semibold text-[#747688] uppercase tracking-wider">
            Switch Profile
          </span>
        </div>

        <div className="flex gap-6 items-center">
          {childrenProfiles.map((child) => {
            const isSelected = child.id === selectedChildId;
            return (
              <div
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id);
                  onShowToast(`Switched profile to ${child.name}`);
                }}
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  isSelected ? 'opacity-100' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-full p-0.5 ${
                      isSelected ? 'border-2 border-[#0030ce]' : 'border border-[#c4c5da]'
                    }`}
                  >
                    <img
                      src={child.avatarUrl}
                      alt={child.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute -bottom-1 -right-1 bg-[#0030ce] text-white rounded-full p-1 shadow-xs flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-[#0030ce]' : 'text-[#444657]'
                  }`}
                >
                  {child.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Identity & Status Banner */}
      <section className="bg-[#1a46fd] rounded-xl p-5 text-white shadow-sm overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-xs font-bold opacity-80 uppercase tracking-wide">
            {currentChild.grade}
          </p>
          <h3 className="font-headline text-2xl font-bold mt-0.5">
            {currentChild.name}'s Overview
          </h3>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/20">
              <p className="text-[11px] font-medium text-white/70">Attendance</p>
              <p className="font-headline text-lg font-bold">{currentChild.attendancePct}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/20">
              <p className="text-[11px] font-medium text-white/70">Fees</p>
              <p className="font-headline text-lg font-bold">{currentChild.feesStatus}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/20">
              <p className="text-[11px] font-medium text-white/70">Alerts</p>
              <p className="font-headline text-lg font-bold">{currentChild.alertsCount} New</p>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Academic Progress (Bento Style) */}
      <section className="space-y-3">
        <h2 className="font-headline text-lg font-bold text-[#1a1b25]">
          Academic Progress
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Term Average Main Card */}
          <div className="md:col-span-2 bg-white rounded-xl p-4 card-shadow relative overflow-hidden">
            <div className="accent-bar-primary absolute left-0 top-0 bottom-0" />
            <div className="flex justify-between items-start pl-2">
              <div>
                <p className="text-xs text-[#444657] font-semibold">Term Average</p>
                <h4 className="font-headline text-3xl font-bold text-[#0030ce]">
                  {currentChild.termAverage}
                </h4>
              </div>

              {/* Mini trend chart */}
              <div className="flex items-end gap-1 h-12 pr-2">
                <div className="w-2 bg-[#dee0ff] h-4 rounded-t-full" />
                <div className="w-2 bg-[#dee0ff] h-6 rounded-t-full" />
                <div className="w-2 bg-[#dee0ff] h-8 rounded-t-full" />
                <div className="w-2 bg-[#0030ce] h-10 rounded-t-full" />
                <div className="w-2 bg-[#dee0ff] h-7 rounded-t-full" />
              </div>
            </div>
            <p className="text-xs text-[#444657] mt-2 pl-2">
              {currentChild.rank}
            </p>
          </div>

          {/* Subjects Progress */}
          {currentChild.subjects.map((sub, i) => (
            <div key={i} className="bg-white rounded-xl p-4 card-shadow relative">
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  sub.accent === 'secondary' ? 'bg-[#006d30]' : 'bg-[#0030ce]'
                } rounded-l-xl`}
              />
              <p className="text-xs text-[#444657] font-semibold pl-2">
                {sub.name}
              </p>
              <p
                className={`font-headline text-xl font-bold pl-2 ${
                  sub.accent === 'secondary' ? 'text-[#006d30]' : 'text-[#0030ce]'
                }`}
              >
                {sub.scorePct}%
              </p>
              <div className="w-full bg-[#f4f2ff] h-1.5 rounded-full mt-2 ml-2 pr-4">
                <div
                  className={`h-full rounded-full ${
                    sub.accent === 'secondary' ? 'bg-[#006d30]' : 'bg-[#0030ce]'
                  }`}
                  style={{ width: `${sub.scorePct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="space-y-3">
        <h2 className="font-headline text-lg font-bold text-[#1a1b25]">
          Upcoming Events
        </h2>

        <div className="space-y-2">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="bg-white border border-[#c4c5da] rounded-xl p-3.5 flex gap-4 items-center cursor-pointer hover:bg-[#fbf8ff] transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-[#ffdbd2] flex flex-col items-center justify-center text-[#8c1f00] shrink-0">
                <span className="font-bold text-base leading-tight">{evt.day}</span>
                <span className="text-[10px] uppercase font-semibold">{evt.month}</span>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-[#1a1b25]">{evt.title}</h5>
                <p className="text-xs text-[#444657]">
                  {evt.location} • {evt.time}
                </p>
              </div>
              <button className="bg-[#f4f2ff] p-2 rounded-full text-[#0030ce] hover:bg-[#dee0ff] transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements Section */}
      <section className="space-y-3">
        <h2 className="font-headline text-lg font-bold text-[#1a1b25]">
          Announcements
        </h2>

        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-xl border border-[#c4c5da] overflow-hidden card-shadow"
          >
            {ann.imageUrl && (
              <div className="h-32 w-full relative">
                <img
                  src={ann.imageUrl}
                  alt={ann.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-4">
                  <span className="bg-[#006d30] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {ann.tag || 'BULLETIN'}
                  </span>
                </div>
              </div>
            )}
            <div className="p-4">
              <h6 className="font-headline text-base font-bold text-[#1a1b25]">
                {ann.title}
              </h6>
              <p className="text-xs text-[#444657] line-clamp-2 mt-1">
                {ann.summary}
              </p>
              <button
                onClick={() => setActiveAnnouncement(ann)}
                className="mt-3 text-[#0030ce] text-xs font-bold uppercase flex items-center gap-1 hover:underline cursor-pointer"
              >
                Read More <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* --- MODALS --- */}

      {/* Announcement Modal */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                {activeAnnouncement.title}
              </h3>
              <button
                onClick={() => setActiveAnnouncement(null)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {activeAnnouncement.imageUrl && (
              <div className="h-44 rounded-xl overflow-hidden">
                <img
                  src={activeAnnouncement.imageUrl}
                  alt={activeAnnouncement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-xs text-[#747688]">Published: {activeAnnouncement.date || 'Oct 23, 2023'}</p>
            <p className="text-sm text-[#444657] leading-relaxed">
              {activeAnnouncement.content}
            </p>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveAnnouncement(null)}
                className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold"
              >
                Close Bulletin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0030ce]">event</span>
                <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#444657]">
              <p><strong>Date:</strong> {selectedEvent.day} {selectedEvent.month}, 2023</p>
              <p><strong>Time:</strong> {selectedEvent.time}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              <p className="text-[#747688] pt-2">
                Parents and guardians are invited to attend. Please make sure to bring your CARTA Parent ID badge for security verification.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  onShowToast(`RSVP confirmed for ${selectedEvent.title}`);
                }}
                className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold"
              >
                RSVP / Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
