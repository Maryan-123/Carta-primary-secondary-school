import React, { useState } from 'react';
import { TimetableSlot, StudentAttendance } from '../types';

interface Props {
  schedule: TimetableSlot[];
  attendanceList: StudentAttendance[];
  onUpdateAttendance: (id: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE') => void;
  onShowToast: (msg: string) => void;
}

export const TeacherDashboard: React.FC<Props> = ({
  schedule,
  attendanceList,
  onUpdateAttendance,
  onShowToast,
}) => {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showEnterResultsModal, setShowEnterResultsModal] = useState(false);

  // Assignment Form State
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentSubject, setAssignmentSubject] = useState('Advanced Mathematics');
  const [dueDate, setDueDate] = useState('');

  // Enter Grade State
  const [selectedStudent, setSelectedStudent] = useState('Ali Ahmed');
  const [gradeInput, setGradeInput] = useState('A');
  const [assessmentName, setAssessmentName] = useState('Quiz 5');

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim()) {
      onShowToast('Please enter an assignment title.');
      return;
    }
    setShowAssignmentModal(false);
    setAssignmentTitle('');
    onShowToast(`Assignment "${assignmentTitle}" created and broadcasted to class!`);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEnterResultsModal(false);
    onShowToast(`Grade ${gradeInput} saved for ${selectedStudent} (${assessmentName})`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Welcome Header */}
      <section className="space-y-1">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#1a1b25]">
          Welcome, Mr. Ibrahim
        </h2>
        <p className="text-xs md:text-sm text-[#444657]">
          Here is your academic overview for {todayFormatted}.
        </p>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Card 1: Classes */}
        <div className="bg-white border border-[#c4c5da] rounded-xl p-4 accent-bar-primary">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-[#0030ce]">groups</span>
            <span className="text-[10px] font-extrabold text-[#0030ce] bg-[#dee0ff] px-2 py-0.5 rounded-full uppercase">
              TODAY
            </span>
          </div>
          <div className="font-headline text-lg md:text-xl font-bold text-[#1a1b25]">
            4 Classes
          </div>
          <div className="text-xs text-[#444657] font-medium">Next: 10B at 09:00</div>
        </div>

        {/* Card 2: Submissions */}
        <div className="bg-white border border-[#c4c5da] rounded-xl p-4 accent-bar-tertiary">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-[#8c1f00]">
              assignment_turned_in
            </span>
            <span className="text-[10px] font-extrabold text-[#8c1f00] bg-[#ffdbd2] px-2 py-0.5 rounded-full uppercase">
              PENDING
            </span>
          </div>
          <div className="font-headline text-lg md:text-xl font-bold text-[#1a1b25]">
            12 Submissions
          </div>
          <div className="text-xs text-[#444657] font-medium">Grade before 5:00 PM</div>
        </div>

        {/* Card 3: Attendance Pending */}
        <div className="col-span-2 md:col-span-1 bg-white border border-[#c4c5da] rounded-xl p-4 accent-bar-secondary">
          <div className="flex justify-between items-start mb-2">
            <span className="material-symbols-outlined text-[#006d30]">
              event_busy
            </span>
            <span className="text-[10px] font-extrabold text-[#006d30] bg-[#84fb9d] px-2 py-0.5 rounded-full uppercase">
              ACTION
            </span>
          </div>
          <div className="font-headline text-lg md:text-xl font-bold text-[#1a1b25]">
            Attendance Pending
          </div>
          <div className="text-xs text-[#444657] font-medium">Period 1 & 2 needs review</div>
        </div>
      </section>

      {/* Action Center */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-[#747688] uppercase tracking-widest">
          Action Center
        </h3>
        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0030ce] text-white py-3 px-4 rounded-lg text-xs font-bold hover:bg-[#1a46fd] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">how_to_reg</span>
            Record Attendance
          </button>

          <button
            onClick={() => setShowAssignmentModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#edecfb] border border-[#0030ce] text-[#0030ce] py-3 px-4 rounded-lg text-xs font-bold hover:bg-[#dee0ff] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_task</span>
            Create Assignment
          </button>

          <button
            onClick={() => setShowEnterResultsModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#edecfb] border border-[#0030ce] text-[#0030ce] py-3 px-4 rounded-lg text-xs font-bold hover:bg-[#dee0ff] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">analytics</span>
            Enter Results
          </button>
        </div>
      </section>

      {/* My Schedule Today */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-lg font-bold text-[#1a1b25]">
            My Schedule Today
          </h3>
          <button 
            onClick={() => onShowToast('Full timetable requested.')}
            className="text-[#0030ce] text-xs font-semibold hover:underline"
          >
            Full Timetable
          </button>
        </div>

        <div className="space-y-2">
          {schedule.map((item) => (
            <div
              key={item.id}
              className={`bg-white border border-[#c4c5da] rounded-xl p-3.5 flex items-center gap-4 ${
                item.statusTag === 'LOCKED' ? 'opacity-60' : ''
              }`}
            >
              <div className="w-16 flex flex-col items-center justify-center border-r border-[#c4c5da] pr-3 shrink-0">
                <span className="text-[11px] font-medium text-[#747688]">
                  {item.timeStart}
                </span>
                <span className={`font-headline font-bold text-sm ${item.isCurrent ? 'text-[#0030ce]' : 'text-[#1a1b25]'}`}>
                  {item.timeEnd}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline text-base font-bold text-[#1a1b25]">
                    {item.instructor}
                  </span>
                  {item.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-[#006d30]/10 text-[#006d30] text-[10px] font-bold uppercase">
                      Ongoing
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#444657]">
                  {item.subject} • {item.location}
                </p>
              </div>

              <button className="material-symbols-outlined text-[#747688]">
                {item.statusTag === 'LOCKED' ? 'lock' : 'chevron_right'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Attendance View Table */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-headline text-lg font-bold text-[#1a1b25]">
            Quick Attendance View (Class 10B)
          </h3>
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="text-xs text-[#0030ce] font-semibold hover:underline"
          >
            Edit Attendance
          </button>
        </div>

        <div className="bg-white border border-[#c4c5da] rounded-xl overflow-hidden card-shadow">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f4f2ff] text-xs font-bold text-[#747688] border-b border-[#c4c5da]">
              <tr>
                <th className="px-4 py-2.5">STUDENT</th>
                <th className="px-4 py-2.5">CLASS</th>
                <th className="px-4 py-2.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c5da] text-xs">
              {attendanceList.map((st) => (
                <tr key={st.id} className="hover:bg-[#fbf8ff]">
                  <td className="px-4 py-3 font-semibold text-[#1a1b25]">
                    {st.studentName}
                  </td>
                  <td className="px-4 py-3 text-[#444657]">{st.className}</td>
                  <td className="px-4 py-3">
                    {st.status === 'PRESENT' && (
                      <span className="bg-[#006d30]/10 text-[#006d30] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        Present
                      </span>
                    )}
                    {st.status === 'ABSENT' && (
                      <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        Absent
                      </span>
                    )}
                    {st.status === 'LATE' && (
                      <span className="bg-[#8c1f00]/10 text-[#8c1f00] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        Late
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- MODALS --- */}

      {/* Record Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0030ce]">how_to_reg</span>
                <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                  Record Class 10B Attendance
                </h3>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-[#444657]">
              Toggle attendance status for period 1 (Advanced Mathematics):
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {attendanceList.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 border border-[#c4c5da] rounded-lg bg-[#fbf8ff]"
                >
                  <span className="text-xs font-semibold text-[#1a1b25]">
                    {st.studentName}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdateAttendance(st.id, 'PRESENT')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        st.status === 'PRESENT'
                          ? 'bg-[#006d30] text-white'
                          : 'bg-[#f4f2ff] text-[#444657]'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => onUpdateAttendance(st.id, 'ABSENT')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        st.status === 'ABSENT'
                          ? 'bg-[#ba1a1a] text-white'
                          : 'bg-[#f4f2ff] text-[#444657]'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => onUpdateAttendance(st.id, 'LATE')}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        st.status === 'LATE'
                          ? 'bg-[#8c1f00] text-white'
                          : 'bg-[#f4f2ff] text-[#444657]'
                      }`}
                    >
                      Late
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  onShowToast('Attendance successfully submitted to system!');
                }}
                className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold"
              >
                Save & Submit Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0030ce]">add_task</span>
                <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                  Create New Assignment
                </h3>
              </div>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#444657] block mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Practice Worksheet 4"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c4c5da] rounded-lg text-xs focus:outline-none focus:border-[#0030ce]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#444657] block mb-1">
                  Subject & Class
                </label>
                <select
                  value={assignmentSubject}
                  onChange={(e) => setAssignmentSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c4c5da] rounded-lg text-xs focus:outline-none focus:border-[#0030ce]"
                >
                  <option value="Advanced Mathematics">Advanced Mathematics (Class 10B)</option>
                  <option value="General Science">General Science (Class 8C)</option>
                  <option value="Physics">Physics (Class 11A)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#444657] block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c4c5da] rounded-lg text-xs focus:outline-none focus:border-[#0030ce]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 border border-[#c4c5da] rounded-lg text-xs font-semibold text-[#444657]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Grade Modal */}
      {showEnterResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0030ce]">analytics</span>
                <h3 className="font-headline font-bold text-lg text-[#1a1b25]">
                  Enter Academic Grade
                </h3>
              </div>
              <button
                onClick={() => setShowEnterResultsModal(false)}
                className="text-[#747688] hover:text-[#1a1b25]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#444657] block mb-1">
                  Student Name
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c4c5da] rounded-lg text-xs focus:outline-none focus:border-[#0030ce]"
                >
                  {attendanceList.map((st) => (
                    <option key={st.id} value={st.studentName}>
                      {st.studentName} ({st.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#444657] block mb-1">
                  Assessment Name
                </label>
                <input
                  type="text"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c4c5da] rounded-lg text-xs focus:outline-none focus:border-[#0030ce]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#444657] block mb-1">
                  Grade / Score
                </label>
                <select
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c4c5da] rounded-lg text-xs focus:outline-none focus:border-[#0030ce]"
                >
                  <option value="A+">A+ (97 - 100%)</option>
                  <option value="A">A (93 - 96%)</option>
                  <option value="A-">A- (90 - 92%)</option>
                  <option value="B+">B+ (87 - 89%)</option>
                  <option value="B">B (83 - 86%)</option>
                  <option value="C">C (70 - 79%)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnterResultsModal(false)}
                  className="px-4 py-2 border border-[#c4c5da] rounded-lg text-xs font-semibold text-[#444657]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0030ce] text-white rounded-lg text-xs font-semibold"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
