import React, { useState } from 'react';
import { TimetableSlot, AssessmentResult, PendingTask, Announcement } from '../types';

interface Props {
  timetable: TimetableSlot[];
  results: AssessmentResult[];
  tasks: PendingTask[];
  announcements: Announcement[];
  onToggleTask: (taskId: string) => void;
  onShowToast: (msg: string) => void;
}

export const StudentDashboard: React.FC<Props> = ({
  timetable,
  results,
  tasks,
  announcements,
  onToggleTask,
  onShowToast,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSportsModal, setShowSportsModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [selectedSports, setSelectedSports] = useState<{ [key: string]: boolean }>({
    sprint: true,
    highJump: false,
    relay: false,
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const handleSportsRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSportsModal(false);
    onShowToast('Successfully registered for Sports Day events!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Greeting & Quick Stats */}
      <section className="space-y-4">
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#1a1b25]">
          Good morning, Alex
        </h1>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Attendance Card */}
          <div className="bg-white p-4 rounded-xl card-shadow flex items-center justify-between transition-transform hover:-translate-y-0.5">
            <div>
              <p className="text-xs font-semibold text-[#444657] uppercase tracking-wider">
                Attendance
              </p>
              <p className="font-headline text-2xl font-bold text-[#0030ce] mt-0.5">
                94%
              </p>
            </div>
            <span className="material-symbols-outlined text-[#0030ce] text-3xl">
              check_circle
            </span>
          </div>

          {/* Pending Tasks Card */}
          <div 
            onClick={() => setShowTasksModal(true)}
            className="bg-white p-4 rounded-xl card-shadow flex items-center justify-between cursor-pointer hover:border-[#ba1a1a]/40 transition-all hover:-translate-y-0.5"
          >
            <div>
              <p className="text-xs font-semibold text-[#444657] uppercase tracking-wider">
                Pending Tasks
              </p>
              <p className="font-headline text-2xl font-bold text-[#ba1a1a] mt-0.5">
                {pendingCount} Tasks
              </p>
            </div>
            <span className="material-symbols-outlined text-[#ba1a1a] text-3xl">
              assignment_late
            </span>
          </div>

          {/* Account Balance Card */}
          <div className="bg-white p-4 rounded-xl card-shadow flex items-center justify-between transition-transform hover:-translate-y-0.5">
            <div>
              <p className="text-xs font-semibold text-[#444657] uppercase tracking-wider">
                Account Balance
              </p>
              <p className="font-headline text-2xl font-bold text-[#1a1b25] mt-0.5">
                $0.00
              </p>
            </div>
            <span className="material-symbols-outlined text-[#444657] text-3xl">
              account_balance_wallet
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timetable & Announcement (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-[#1a1b25]">
              Today's Timetable
            </h2>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="text-[#0030ce] text-xs font-semibold hover:underline"
            >
              View Full Schedule
            </button>
          </div>

          {/* Timetable Items */}
          <div className="space-y-2">
            {timetable.map((slot) => {
              let accentClass = 'accent-bar-primary';
              if (slot.accentColor === 'secondary') accentClass = 'accent-bar-secondary';
              if (slot.accentColor === 'tertiary') accentClass = 'accent-bar-tertiary';

              return (
                <div
                  key={slot.id}
                  className={`bg-white p-4 rounded-lg card-shadow ${accentClass} flex items-center justify-between hover:bg-[#fbf8ff] transition-all`}
                >
                  <div className="flex gap-4 items-center">
                    <div className="text-center min-w-[60px]">
                      <p className={`text-xs font-bold ${slot.isCurrent ? 'text-[#0030ce]' : 'text-[#1a1b25]'}`}>
                        {slot.timeStart}
                      </p>
                      <p className="text-[10px] text-[#747688]">{slot.timeEnd}</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#1a1b25]">
                        {slot.subject}
                      </p>
                      <p className="text-xs text-[#444657]">
                        {slot.location} • {slot.instructor}
                      </p>
                    </div>
                  </div>

                  {slot.isCurrent && (
                    <span className="px-3 py-1 bg-[#84fb9d] text-[#007434] text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Latest Announcement Card */}
          <div className="bg-[#0030ce] p-5 rounded-xl text-white relative overflow-hidden mt-6 shadow-md">
            <div className="relative z-10 flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl">campaign</span>
              <div className="space-y-1">
                <h3 className="font-headline text-lg font-bold">
                  Annual Sports Day
                </h3>
                <p className="text-sm opacity-90 leading-snug">
                  Sign-ups for the 100m sprint and high jump are now open in the Physical Education portal.
                </p>
                <button
                  onClick={() => setShowSportsModal(true)}
                  className="mt-3 bg-white text-[#0030ce] px-4 py-2 rounded-lg text-xs font-bold hover:bg-opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  Register Now
                </button>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white opacity-10 rounded-full pointer-events-none" />
          </div>
        </div>

        {/* Right Column: Recent Results & Term Progress (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-headline text-lg font-bold text-[#1a1b25]">
            Recent Results
          </h2>

          <div className="bg-white rounded-xl card-shadow overflow-hidden">
            <div className="p-3 border-b border-[#c4c5da] flex justify-between items-center bg-[#f4f2ff]">
              <p className="text-xs font-bold text-[#1a1b25] uppercase tracking-wider">
                Assessment
              </p>
              <p className="text-xs font-bold text-[#1a1b25] uppercase tracking-wider">
                Grade
              </p>
            </div>

            <div className="divide-y divide-[#c4c5da]">
              {results.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 flex justify-between items-center hover:bg-[#fbf8ff] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1a1b25]">
                      {res.assessment}
                    </p>
                    <p className="text-[11px] text-[#747688]">{res.date}</p>
                  </div>
                  <span className="font-bold text-sm text-[#006d30] font-mono">
                    {res.grade}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowReportCardModal(true)}
              className="w-full p-3 text-[#0030ce] text-xs font-bold hover:bg-[#f4f2ff] transition-colors text-center border-t border-[#c4c5da] cursor-pointer"
            >
              Download Report Card
            </button>
          </div>

          {/* Academic Progress Card */}
          <div className="bg-[#edecfb] p-4 rounded-xl border border-[#c4c5da]">
            <p className="text-xs font-semibold text-[#444657] mb-2">
              Term Progress
            </p>
            <div className="w-full bg-[#c4c5da] h-2.5 rounded-full overflow-hidden mb-2">
              <div className="bg-[#0030ce] h-full w-[78%] rounded-full transition-all duration-500" />
            </div>
            <p className="text-[11px] text-[#747688] text-right font-medium">
              78% of curriculum completed
            </p>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Full Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                Full Weekly Schedule
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-[#f4f2ff] rounded-lg">
                <span className="text-xs font-bold text-[#0030ce] uppercase">Monday</span>
                <p className="text-sm font-semibold">08:30 - 09:45 | Mathematics (Room 302)</p>
                <p className="text-sm font-semibold">10:00 - 11:15 | Science Biology (Lab 4)</p>
                <p className="text-sm font-semibold">11:30 - 12:45 | English Literature (Library)</p>
              </div>
              <div className="p-3 bg-[#fbf8ff] border border-[#c4c5da] rounded-lg">
                <span className="text-xs font-bold text-[#006d30] uppercase">Tuesday</span>
                <p className="text-sm font-semibold">08:30 - 09:45 | Physics (Lab 1)</p>
                <p className="text-sm font-semibold">10:00 - 11:15 | Physical Education (Gym)</p>
              </div>
              <div className="p-3 bg-[#fbf8ff] border border-[#c4c5da] rounded-lg">
                <span className="text-xs font-bold text-[#8c1f00] uppercase">Wednesday</span>
                <p className="text-sm font-semibold">09:00 - 10:30 | History & Civics (Room 104)</p>
                <p className="text-sm font-semibold">11:00 - 12:30 | Computer Science (Lab 3)</p>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sports Day Registration Modal */}
      {showSportsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0030ce]">sports_score</span>
                <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                  Sports Day Sign-up
                </h3>
              </div>
              <button
                onClick={() => setShowSportsModal(false)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSportsRegister} className="space-y-4">
              <p className="text-xs text-[#444657]">
                Select the events you wish to compete in for Grade 11-B:
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-[#c4c5da] rounded-lg cursor-pointer hover:bg-[#f4f2ff]">
                  <input
                    type="checkbox"
                    checked={selectedSports.sprint}
                    onChange={(e) =>
                      setSelectedSports({ ...selectedSports, sprint: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0030ce] rounded focus:ring-[#0030ce]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1a1b25]">100m Sprint</p>
                    <p className="text-xs text-[#747688]">Track Field • 09:30 AM</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[#c4c5da] rounded-lg cursor-pointer hover:bg-[#f4f2ff]">
                  <input
                    type="checkbox"
                    checked={selectedSports.highJump}
                    onChange={(e) =>
                      setSelectedSports({ ...selectedSports, highJump: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0030ce] rounded focus:ring-[#0030ce]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1a1b25]">High Jump</p>
                    <p className="text-xs text-[#747688]">Athletics Pit B • 11:00 AM</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[#c4c5da] rounded-lg cursor-pointer hover:bg-[#f4f2ff]">
                  <input
                    type="checkbox"
                    checked={selectedSports.relay}
                    onChange={(e) =>
                      setSelectedSports({ ...selectedSports, relay: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0030ce] rounded focus:ring-[#0030ce]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1a1b25]">4x100m Relay</p>
                    <p className="text-xs text-[#747688]">Main Stadium • 02:00 PM</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSportsModal(false)}
                  className="px-4 py-2 border border-[#c4c5da] rounded-lg text-xs font-semibold text-[#444657]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold hover:bg-[#1a46fd]"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Tasks Modal */}
      {showTasksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">assignment_late</span>
                <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                  Pending Tasks & Submissions
                </h3>
              </div>
              <button
                onClick={() => setShowTasksModal(false)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className="flex items-center justify-between p-3 border border-[#c4c5da] rounded-lg cursor-pointer hover:bg-[#fbf8ff]"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#0030ce] rounded"
                    />
                    <div>
                      <p className={`text-sm font-semibold ${task.completed ? 'line-through text-[#747688]' : 'text-[#1a1b25]'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-[#747688]">
                        {task.subject} • Due: {task.dueDate}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowTasksModal(false)}
                className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Card Preview Modal */}
      {showReportCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0030ce]">download</span>
                <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                  Official Academic Report Card
                </h3>
              </div>
              <button
                onClick={() => setShowReportCardModal(false)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 bg-[#f4f2ff] rounded-xl border border-[#c4c5da] space-y-3">
              <div className="flex justify-between text-xs text-[#444657]">
                <span>Student: Alex Johnson</span>
                <span>Term: Fall 2023</span>
              </div>
              <div className="flex justify-between text-xs text-[#444657]">
                <span>Grade: 11-B</span>
                <span>Attendance: 94%</span>
              </div>

              <div className="border-t border-[#c4c5da] pt-2 space-y-1">
                {results.map((r) => (
                  <div key={r.id} className="flex justify-between text-xs">
                    <span className="font-medium text-[#1a1b25]">{r.assessment}</span>
                    <span className="font-bold text-[#006d30]">{r.grade}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowReportCardModal(false)}
                className="px-4 py-2 border border-[#c4c5da] rounded-lg text-xs font-semibold text-[#444657]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowReportCardModal(false);
                  onShowToast('Report Card PDF downloaded successfully!');
                }}
                className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
