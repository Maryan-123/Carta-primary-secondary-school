import {
  ChildProfile,
  TimetableSlot,
  AssessmentResult,
  UpcomingEvent,
  Announcement,
  StudentAttendance,
  PendingTask,
  NotificationItem
} from '../types';

export const SCHOOL_LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuAFbd1CkkDyHt7uJ5rtzdzFc2oQg9tLZvt6MF_7KUcY3JbKH8r4sgD6j2Q3SQVVrAMRUHKAwcd-S8PORqQsxfBWdGiY2JUUXxec-p0wFn27aLnQOY2UaIG9fOavYurm7EHzhCsRID0vYOo07Okv4Hz9jqeENWT97cmG5okTnF1Bl8766XGA_f1mCdRu0As4QjLpnE4FI1JFisxDyPRQuGSvgqvXYEQH9rADQd04ZgsGPRqb7nBvdcgzWhkWOkwrHR-NwKFhtsprUMSx";

export const STUDENT_TIMETABLE: TimetableSlot[] = [
  {
    id: 't1',
    timeStart: '08:30',
    timeEnd: '09:45',
    subject: 'Mathematics',
    location: 'Room 302',
    instructor: 'Dr. Aris',
    isCurrent: true,
    statusTag: 'ONGOING',
    accentColor: 'primary'
  },
  {
    id: 't2',
    timeStart: '10:00',
    timeEnd: '11:15',
    subject: 'Science (Biology)',
    location: 'Lab 4',
    instructor: 'Prof. Miller',
    statusTag: 'UPCOMING',
    accentColor: 'secondary'
  },
  {
    id: 't3',
    timeStart: '11:30',
    timeEnd: '12:45',
    subject: 'English Literature',
    location: 'Library',
    instructor: 'Ms. Thompson',
    statusTag: 'UPCOMING',
    accentColor: 'tertiary'
  }
];

export const RECENT_RESULTS: AssessmentResult[] = [
  { id: 'r1', assessment: 'History Quiz 4', date: 'Oct 24, 2023', grade: 'A-', scorePercentage: 91 },
  { id: 'r2', assessment: 'Physics Lab Report', date: 'Oct 22, 2023', grade: 'B+', scorePercentage: 88 },
  { id: 'r3', assessment: 'Advanced Algebra', date: 'Oct 19, 2023', grade: 'A', scorePercentage: 96 },
  { id: 'r4', assessment: 'Art Critique', date: 'Oct 15, 2023', grade: 'B-', scorePercentage: 82 }
];

export const STUDENT_TASKS: PendingTask[] = [
  {
    id: 'k1',
    title: 'Physics Lab Report Submission',
    dueDate: 'Today, 5:00 PM',
    subject: 'Physics',
    completed: false
  },
  {
    id: 'k2',
    title: 'Algebra Problem Set 8',
    dueDate: 'Tomorrow, 11:59 PM',
    subject: 'Mathematics',
    completed: false
  },
  {
    id: 'k3',
    title: 'Read Chapter 4 of Hamlet',
    dueDate: 'Oct 26, 2023',
    subject: 'English',
    completed: true
  }
];

export const CHILDREN_PROFILES: ChildProfile[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    grade: 'Grade 4A',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1RGk9KVgrvbWIXoUYN6g_1s5BYOLbUvAyUonxX9irneqpXnxxiumGExEFL_0oNxL3nT-nPXwORyZCRTYiCgPdU3u7JVG_pHKP0cnc_VyNS9DYHBOodlKglPo4ZmZZcrA4ryKnvnxJwgH0pxisinvw51u3bMMuaLp8pwwzd2CRc__CkYheJsecqRw-k9NZSBYChaP5Uz7ENsw2hgbaFiUSLYPkFvrztl_xHcaZ_R5TB0-WIbm7fzOLc4iKi7ic38nHXZWV3Vtx6Fm1',
    attendancePct: 98,
    feesStatus: 'No Dues',
    alertsCount: 1,
    termAverage: 'A-',
    rank: 'Top 5% of Grade 4',
    subjects: [
      { name: 'Mathematics', scorePct: 92, accent: 'secondary' },
      { name: 'English', scorePct: 88, accent: 'primary' }
    ]
  },
  {
    id: 'john',
    name: 'John',
    grade: 'Grade 2B',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6Cgtn8tBRsfds3rpWGbrrVMM-X4PR_FeSKjBSQ36ShESAFhWHCRj_uddMm3gW3DLNVBi4L_-lryyka28_6NaFidkvBvyw68z8oeYvSrMLXYC8EvWLn6BPiDSpmVu_ARHMg4rKzRQGUWD6s_roxfCiaxIi7uyxLUBW9gh2rrB8OYCeenvdPI9H9_xw_Bq6RmuRSYB65L3sS_y9C9jxBOU6E82rIVf99Lu2O6JDCwPFcpjgEuELjhTATcOvTbBD67epAnyT_AVr2p4J',
    attendancePct: 95,
    feesStatus: 'Paid',
    alertsCount: 0,
    termAverage: 'A',
    rank: 'Top 3% of Grade 2',
    subjects: [
      { name: 'Mathematics', scorePct: 95, accent: 'secondary' },
      { name: 'Science', scorePct: 91, accent: 'primary' }
    ]
  }
];

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'e1',
    day: '24',
    month: 'Oct',
    title: 'Parents Meeting',
    location: 'Main Hall',
    time: '4:00 PM'
  },
  {
    id: 'e2',
    day: '27',
    month: 'Oct',
    title: 'Science Project Due',
    location: 'Submission Portal',
    time: '11:59 PM'
  },
  {
    id: 'e3',
    day: '05',
    month: 'Nov',
    title: 'Inter-School Sports Meet',
    location: 'Main Athletics Ground',
    time: '09:00 AM'
  }
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Annual Sports Day 2024',
    summary: 'Registration is now open for all track and field events. Please check the portal for consent forms and schedule details.',
    content: 'We are thrilled to announce CARTA School’s Annual Sports Day 2024! Events include 100m sprint, 400m relay, high jump, long jump, and tug-of-war. Students and parents can submit physical education consent forms through the portal before November 1st. Refreshments will be served.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkHXm2LMr_o4fdK4PoTZKO1xH6sMk0Ww5J3eInsQ_i_4ZZ4GsOp0Sa-05OEIyZ58VMB42_g7gbYvqGeRUaVIAZAqbxXfzhxp7iIjGVxCwed936DFHzDybmlhNtTXdbPRDi8_Y1he7MH8a8Epcb3L_zfUCwMxwx6eA7G75r-BqqDCioSweCUeBNXyvvmxNqJ218NfLVM6LOxJQCRSfUaWzt2goXiaWFJsvD2woS1EImYc12icN1MJVS3byCx_5ahrG65veWwwdnc6_G',
    tag: 'NEW BULLETIN',
    date: 'Oct 23, 2023'
  }
];

export const TEACHER_SCHEDULE: TimetableSlot[] = [
  {
    id: 'ts1',
    timeStart: '08:30',
    timeEnd: '09:15',
    subject: 'Advanced Mathematics',
    location: 'Lab 4',
    instructor: 'Classroom 10B',
    isCurrent: true,
    statusTag: 'ONGOING',
    accentColor: 'primary'
  },
  {
    id: 'ts2',
    timeStart: '10:00',
    timeEnd: '10:45',
    subject: 'General Science',
    location: 'Block A',
    instructor: 'Classroom 8C',
    statusTag: 'UPCOMING',
    accentColor: 'secondary'
  },
  {
    id: 'ts3',
    timeStart: '11:15',
    timeEnd: '12:00',
    subject: 'Physics',
    location: 'Lecture Hall 1',
    instructor: 'Classroom 11A',
    statusTag: 'LOCKED',
    accentColor: 'tertiary'
  }
];

export const INITIAL_TEACHER_ATTENDANCE: StudentAttendance[] = [
  { id: 'st1', studentName: 'Ali Ahmed', className: '10B', status: 'PRESENT' },
  { id: 'st2', studentName: 'Sarah Jenkins', className: '10B', status: 'ABSENT' },
  { id: 'st3', studentName: 'Marcus Thorne', className: '10B', status: 'LATE' },
  { id: 'st4', studentName: 'Alex Johnson', className: '10B', status: 'PRESENT' },
  { id: 'st5', studentName: 'Chloe Bennet', className: '10B', status: 'PRESENT' }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Sports Day Registration Open',
    message: 'Sign-ups for 100m sprint and high jump are now active.',
    time: '10 mins ago',
    read: false,
    type: 'info'
  },
  {
    id: 'n2',
    title: 'New Quiz Grade Posted',
    message: 'History Quiz 4 grade (A-) has been published.',
    time: '2 hours ago',
    read: false,
    type: 'success'
  },
  {
    id: 'n3',
    title: 'Attendance Reminder',
    message: 'Period 1 & 2 attendance submission pending review.',
    time: '1 day ago',
    read: true,
    type: 'warning'
  }
];
