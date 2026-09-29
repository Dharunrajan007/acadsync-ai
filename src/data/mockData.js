// AcadSync AI — mock dataset for the frontend prototype.
// No backend, no API. Everything here is static seed data that AppContext
// clones into local state so simulated actions feel real.

export const currentStudent = {
  id: 'stu-01',
  name: 'Dharun Rajan',
  shortName: 'Dharun',
  initials: 'DR',
  email: 'dharun.r@acadsync.edu',
  department: 'B.Tech AI & Data Science',
  className: 'AI&DS — Section A',
  rollNo: '21AD1042',
  semester: 'Semester 5',
}

export const currentTeacher = {
  id: 'tea-01',
  name: 'Dr. Kumar',
  shortName: 'Dr. Kumar',
  initials: 'DK',
  email: 'kumar.s@acadsync.edu',
  department: 'AI & Data Science',
  subjects: ['Machine Learning', 'Big Data Analytics'],
  designation: 'Associate Professor',
}

export const currentAdmin = {
  id: 'adm-01',
  name: 'Meera Raghavan',
  shortName: 'Meera',
  initials: 'MR',
  email: 'registrar@acadsync.edu',
  department: 'Academic Office',
  designation: 'Academic Registrar',
}

export const subjects = [
  { id: 'sub-ml', name: 'Machine Learning', code: 'AD5101', teacher: 'Dr. Kumar', department: 'AI & Data Science', credits: 4, activeAssignments: 14, load: 'High', color: '#7642DA' },
  { id: 'sub-db', name: 'Database Management Systems', code: 'CS5102', teacher: 'Prof. Priya', department: 'Computer Science', credits: 4, activeAssignments: 9, load: 'Medium', color: '#2A72CC' },
  { id: 'sub-java', name: 'Java Programming', code: 'CS5103', teacher: 'Dr. Arun', department: 'Computer Science', credits: 3, activeAssignments: 8, load: 'Medium', color: '#C3820B' },
  { id: 'sub-py', name: 'Python Programming', code: 'AD5104', teacher: 'Prof. Priya', department: 'AI & Data Science', credits: 3, activeAssignments: 5, load: 'Low', color: '#10906B' },
  { id: 'sub-dv', name: 'Data Visualization', code: 'AD5105', teacher: 'Dr. Arun', department: 'AI & Data Science', credits: 3, activeAssignments: 6, load: 'Low', color: '#0E9BA8' },
  { id: 'sub-bda', name: 'Big Data Analytics', code: 'AD5106', teacher: 'Dr. Kumar', department: 'AI & Data Science', credits: 4, activeAssignments: 7, load: 'Medium', color: '#D14343' },
]

export const teachers = [
  { id: 'tea-01', name: 'Dr. Kumar', department: 'AI & Data Science', subjects: ['Machine Learning', 'Big Data Analytics'], assignmentsGiven: 21, avgStudentWorkload: 74, students: 64, designation: 'Associate Professor' },
  { id: 'tea-02', name: 'Prof. Priya', department: 'Computer Science', subjects: ['Database Management Systems', 'Python Programming'], assignmentsGiven: 14, avgStudentWorkload: 61, students: 72, designation: 'Assistant Professor' },
  { id: 'tea-03', name: 'Dr. Arun', department: 'AI & Data Science', subjects: ['Java Programming', 'Data Visualization'], assignmentsGiven: 17, avgStudentWorkload: 66, students: 58, designation: 'Professor' },
  { id: 'tea-04', name: 'Prof. Lakshmi', department: 'Information Technology', subjects: ['Operating Systems'], assignmentsGiven: 11, avgStudentWorkload: 52, students: 49, designation: 'Assistant Professor' },
  { id: 'tea-05', name: 'Dr. Vignesh', department: 'Computer Science', subjects: ['Computer Networks'], assignmentsGiven: 9, avgStudentWorkload: 58, students: 61, designation: 'Associate Professor' },
]

export const departments = [
  { id: 'dep-ai', name: 'AI & Data Science', students: 168, teachers: 12, subjects: 14, avgWorkload: 74, activeAssignments: 31 },
  { id: 'dep-cs', name: 'Computer Science', students: 194, teachers: 15, subjects: 16, avgWorkload: 66, activeAssignments: 28 },
  { id: 'dep-it', name: 'Information Technology', students: 88, teachers: 9, subjects: 11, avgWorkload: 58, activeAssignments: 17 },
  { id: 'dep-ece', name: 'Electronics & Communication', students: 50, teachers: 6, subjects: 9, avgWorkload: 49, activeAssignments: 10 },
]

// ---------------------------------------------------------------------------
// Assignments visible to the signed-in student
// ---------------------------------------------------------------------------
export const assignments = [
  {
    id: 'asg-01',
    title: 'Build a Classification Model',
    subject: 'Machine Learning',
    teacher: 'Dr. Kumar',
    deadlineLabel: 'Tomorrow · 11:59 PM',
    deadlineFull: 'September 4, 11:59 PM',
    dueSort: 1,
    estimatedHours: 2,
    difficulty: 'Hard',
    priority: 'High',
    status: 'In Progress',
    progress: 65,
    marks: 20,
    formats: ['PDF', 'ZIP'],
    description:
      'Train and evaluate a supervised classification model on the provided student-performance dataset. Compare at least two algorithms and justify the model you would ship.',
    instructions: [
      'Use the dataset shared on the course page (students_perf.csv).',
      'Perform exploratory analysis and document at least three observations.',
      'Train a minimum of two classifiers, for example Logistic Regression and Random Forest.',
      'Report accuracy, precision, recall and F1 with a confusion matrix.',
      'Submit a PDF report plus a ZIP of your notebook and outputs.',
    ],
  },
  {
    id: 'asg-02',
    title: 'Normalization & Indexing Lab',
    subject: 'Database Management Systems',
    teacher: 'Prof. Priya',
    deadlineLabel: 'September 7 · 6:00 PM',
    deadlineFull: 'September 7, 6:00 PM',
    dueSort: 4,
    estimatedHours: 1,
    difficulty: 'Medium',
    priority: 'Medium',
    status: 'In Progress',
    progress: 30,
    marks: 15,
    formats: ['PDF'],
    description:
      'Normalize the supplied schema to BCNF and demonstrate the query-performance impact of appropriate indexing.',
    instructions: [
      'Normalize the given relation step by step, 1NF through BCNF.',
      'Write the DDL for the final schema.',
      'Add indexes and capture the query plan before and after.',
      'Summarise the observed improvement in one short paragraph.',
    ],
  },
  {
    id: 'asg-03',
    title: 'Python List Comprehension Exercise',
    subject: 'Python Programming',
    teacher: 'Prof. Priya',
    deadlineLabel: 'September 10 · 11:59 PM',
    deadlineFull: 'September 10, 11:59 PM',
    dueSort: 7,
    estimatedHours: 1,
    difficulty: 'Easy',
    priority: 'Low',
    status: 'Not Started',
    progress: 0,
    marks: 10,
    formats: ['PDF', 'ZIP'],
    description: 'A short set of exercises covering comprehensions, generators and functional helpers.',
    instructions: [
      'Solve all 12 exercises in the shared worksheet.',
      'Each solution must be a single expression where indicated.',
      'Include the output of your test runs.',
    ],
  },
  {
    id: 'asg-04',
    title: 'Inheritance & Interfaces Worksheet',
    subject: 'Java Programming',
    teacher: 'Dr. Arun',
    deadlineLabel: 'September 9 · 5:00 PM',
    deadlineFull: 'September 9, 5:00 PM',
    dueSort: 6,
    estimatedHours: 3,
    difficulty: 'Medium',
    priority: 'Medium',
    status: 'Not Started',
    progress: 0,
    marks: 20,
    formats: ['PDF', 'DOCX'],
    description: 'Model a small library system using abstract classes and interfaces, then explain your design choices.',
    instructions: [
      'Design the class hierarchy for a library lending system.',
      'Use at least one abstract class and two interfaces.',
      'Include a UML-style diagram, hand drawn is acceptable.',
      'Explain why composition was or was not preferred.',
    ],
  },
  {
    id: 'asg-05',
    title: 'Dashboard Critique Report',
    subject: 'Data Visualization',
    teacher: 'Dr. Arun',
    deadlineLabel: 'August 29 · 11:59 PM',
    deadlineFull: 'August 29, 11:59 PM',
    dueSort: -5,
    estimatedHours: 2,
    difficulty: 'Easy',
    priority: 'Medium',
    status: 'Completed',
    progress: 100,
    marks: 15,
    scored: 13,
    formats: ['PDF'],
    submittedAt: 'August 28, 8:14 PM',
    submittedFile: 'dv_critique_dharun.pdf',
    feedback: 'Clear structure and a sharp critique of the colour encoding. Add more on accessibility next time.',
    description: 'Critique a published public dashboard against visualization best practice.',
    instructions: ['Pick any public dashboard.', 'Evaluate encoding, colour and hierarchy.', 'Propose three concrete improvements.'],
  },
  {
    id: 'asg-06',
    title: 'MapReduce Word Frequency',
    subject: 'Big Data Analytics',
    teacher: 'Dr. Kumar',
    deadlineLabel: 'August 31 · 11:59 PM',
    deadlineFull: 'August 31, 11:59 PM',
    dueSort: -3,
    estimatedHours: 2,
    difficulty: 'Medium',
    priority: 'High',
    status: 'Overdue',
    progress: 40,
    marks: 20,
    formats: ['ZIP'],
    description: 'Implement a word-frequency job and report throughput on the sample corpus.',
    instructions: ['Implement the mapper and reducer.', 'Run against the 500 MB sample corpus.', 'Report runtime and record counts.'],
  },
  {
    id: 'asg-07',
    title: 'Feature Engineering Notebook',
    subject: 'Machine Learning',
    teacher: 'Dr. Kumar',
    deadlineLabel: 'August 25 · 11:59 PM',
    deadlineFull: 'August 25, 11:59 PM',
    dueSort: -9,
    estimatedHours: 2,
    difficulty: 'Medium',
    priority: 'Medium',
    status: 'Completed',
    progress: 100,
    marks: 20,
    scored: 18,
    formats: ['ZIP'],
    submittedAt: 'August 25, 9:40 PM',
    submittedFile: 'fe_notebook_dharun.zip',
    feedback: 'Strong feature set. The lift measurement for feature 4 needed a held-out split.',
    description: 'Engineer and evaluate five candidate features for the churn dataset.',
    instructions: ['Create five features.', 'Measure the lift of each.', 'Keep the notebook reproducible.'],
  },
]

// ---------------------------------------------------------------------------
// Student availability
// ---------------------------------------------------------------------------
export const weeklyAvailability = [
  { day: 'Monday', unavailable: false, slots: [{ id: 'av-1', start: '18:00', end: '22:00' }] },
  { day: 'Tuesday', unavailable: false, slots: [{ id: 'av-2', start: '19:00', end: '22:00' }] },
  { day: 'Wednesday', unavailable: false, slots: [{ id: 'av-3', start: '17:00', end: '21:00' }] },
  { day: 'Thursday', unavailable: false, slots: [{ id: 'av-4', start: '18:00', end: '20:00' }] },
  { day: 'Friday', unavailable: false, slots: [{ id: 'av-5', start: '16:00', end: '19:00' }] },
  { day: 'Saturday', unavailable: false, slots: [{ id: 'av-6', start: '10:00', end: '13:00' }] },
  { day: 'Sunday', unavailable: true, slots: [] },
]

export const monthlyExceptions = [
  { date: 10, type: 'unavailable', note: 'Family function — unavailable all day' },
  { date: 15, type: 'reduced', hours: 2, note: 'Only 2 hours available' },
  { date: 20, type: 'holiday', note: 'Institution holiday' },
  { date: 24, type: 'reduced', hours: 1.5, note: 'Placement training' },
]

// ---------------------------------------------------------------------------
// Timeline and plan
// ---------------------------------------------------------------------------
export const todayPlan = [
  { id: 'tp-1', time: '6:00 PM', endTime: '7:30 PM', title: 'Machine Learning Assignment', subject: 'Machine Learning', hours: 1.5, priority: 'High', type: 'work' },
  { id: 'tp-2', time: '7:30 PM', endTime: '8:30 PM', title: 'Database Lab', subject: 'Database Management Systems', hours: 1, priority: 'Medium', type: 'work' },
  { id: 'tp-3', time: '9:00 PM', endTime: '9:30 PM', title: 'Break', subject: null, hours: 0.5, priority: null, type: 'break' },
  { id: 'tp-4', time: '9:30 PM', endTime: '10:30 PM', title: 'Python Assignment', subject: 'Python Programming', hours: 1, priority: 'Low', type: 'work' },
]

export const weekTimeline = [
  {
    day: 'Monday', date: 'Sep 1', available: '6 PM – 10 PM', capacityHours: 4, startHour: 16, endHour: 23,
    blocks: [
      { id: 'wt-1', title: 'Machine Learning Assignment', subject: 'Machine Learning', from: 18, to: 20, priority: 'High' },
      { id: 'wt-2', title: 'DBMS Revision', subject: 'Database Management Systems', from: 20, to: 21, priority: 'Low' },
    ],
  },
  {
    day: 'Tuesday', date: 'Sep 2', available: '7 PM – 10 PM', capacityHours: 3, startHour: 16, endHour: 23,
    blocks: [{ id: 'wt-3', title: 'Database Assignment', subject: 'Database Management Systems', from: 19, to: 20, priority: 'Medium' }],
  },
  {
    day: 'Wednesday', date: 'Sep 3', available: '5 PM – 9 PM', capacityHours: 4, startHour: 16, endHour: 23,
    blocks: [
      { id: 'wt-4', title: 'Project Work', subject: 'Big Data Analytics', from: 17, to: 19, priority: 'High' },
      { id: 'wt-5', title: 'Python Assignment', subject: 'Python Programming', from: 19, to: 20, priority: 'Low' },
    ],
  },
  {
    day: 'Thursday', date: 'Sep 4', available: '6 PM – 8 PM', capacityHours: 2, startHour: 16, endHour: 23,
    blocks: [{ id: 'wt-6', title: 'Java Worksheet', subject: 'Java Programming', from: 18, to: 20, priority: 'Medium' }],
  },
  {
    day: 'Friday', date: 'Sep 5', available: '4 PM – 7 PM', capacityHours: 3, startHour: 16, endHour: 23,
    blocks: [
      { id: 'wt-7', title: 'ML Report Finalisation', subject: 'Machine Learning', from: 16, to: 18, priority: 'High' },
      { id: 'wt-8', title: 'Big Data Lab', subject: 'Big Data Analytics', from: 18, to: 22, priority: 'High' },
    ],
  },
  { day: 'Saturday', date: 'Sep 6', available: '10 AM – 1 PM', capacityHours: 3, startHour: 16, endHour: 23, blocks: [] },
  { day: 'Sunday', date: 'Sep 7', available: 'Unavailable', capacityHours: 0, startHour: 16, endHour: 23, blocks: [] },
]

export const monthTimeline = [
  { date: 1, load: 3 }, { date: 2, load: 1 }, { date: 3, load: 3 }, { date: 4, load: 2 },
  { date: 5, load: 6 }, { date: 6, load: 0 }, { date: 7, load: 0 }, { date: 8, load: 2 },
  { date: 9, load: 3 }, { date: 10, load: 5 }, { date: 11, load: 1 }, { date: 12, load: 2 },
  { date: 13, load: 0 }, { date: 14, load: 0 }, { date: 15, load: 2 }, { date: 16, load: 4 },
  { date: 17, load: 3 }, { date: 18, load: 1 }, { date: 19, load: 5 }, { date: 20, load: 0 },
  { date: 21, load: 0 }, { date: 22, load: 2 }, { date: 23, load: 3 }, { date: 24, load: 1 },
  { date: 25, load: 4 }, { date: 26, load: 6 }, { date: 27, load: 0 }, { date: 28, load: 0 },
  { date: 29, load: 2 }, { date: 30, load: 3 },
]

export const weeklyWorkload = [
  { day: 'Mon', required: 2, available: 4 },
  { day: 'Tue', required: 4, available: 3 },
  { day: 'Wed', required: 5, available: 4 },
  { day: 'Thu', required: 2, available: 2 },
  { day: 'Fri', required: 6, available: 3 },
  { day: 'Sat', required: 1, available: 3 },
  { day: 'Sun', required: 0, available: 0 },
]

export const subjectDistribution = [
  { subject: 'Machine Learning', hours: 5, color: '#7642DA' },
  { subject: 'Python Programming', hours: 4, color: '#10906B' },
  { subject: 'Database Management', hours: 3, color: '#2A72CC' },
  { subject: 'Java Programming', hours: 2, color: '#C3820B' },
]

export const deadlineRisks = [
  { id: 'dr-1', title: 'Machine Learning Assignment', due: 'Tomorrow', level: 'high', reason: 'Only 3 hours available before the deadline against 2 hours of remaining work plus review time.' },
  { id: 'dr-2', title: 'Database Lab', due: 'September 7', level: 'moderate', reason: 'Overlaps with the Friday peak in your schedule.' },
  { id: 'dr-3', title: 'Python Exercise', due: 'September 10', level: 'low', reason: 'Comfortable margin — 6 hours free before the due date.' },
]

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export const studentNotifications = [
  { id: 'n-1', level: 'risk', title: 'Machine Learning Assignment is due tomorrow', body: 'You have 35% of the work remaining and 3 hours of availability before the deadline.', time: '20 minutes ago', unread: true },
  { id: 'n-2', level: 'warn', title: 'Your workload for Friday exceeds your available capacity', body: 'Friday needs 6 hours but you are available for 3. Consider moving the Database Lab earlier.', time: '2 hours ago', unread: true },
  { id: 'n-3', level: 'info', title: 'Dr. Kumar approved your deadline extension', body: 'Big Data Analytics — MapReduce Word Frequency moved to September 6, 11:59 PM.', time: 'Yesterday', unread: false },
  { id: 'n-4', level: 'safe', title: 'Database Assignment successfully submitted', body: 'Your submission dbms_lab_dharun.pdf was received on September 1 at 9:12 PM.', time: '2 days ago', unread: false },
  { id: 'n-5', level: 'info', title: 'New assignment from Dr. Arun', body: 'Java Programming — Inheritance & Interfaces Worksheet, estimated 3 hours.', time: '3 days ago', unread: false },
]

export const teacherNotifications = [
  { id: 'tn-1', level: 'warn', title: '8 students flagged with insufficient capacity', body: 'For the Machine Learning classification assignment due September 5.', time: '15 minutes ago', unread: true },
  { id: 'tn-2', level: 'info', title: '42 of 60 submissions received', body: 'Machine Learning Classification Assignment closes tomorrow at 11:59 PM.', time: '1 hour ago', unread: true },
  { id: 'tn-3', level: 'risk', title: 'Deadline congestion detected on September 10', body: '12 assignments across 4 subjects are due the same day for AI & DS Section A.', time: 'Yesterday', unread: false },
  { id: 'tn-4', level: 'safe', title: 'Evaluation saved for Ananya M.', body: 'Feature Engineering Notebook — 18/20.', time: '2 days ago', unread: false },
]

export const adminNotifications = [
  { id: 'an-1', level: 'warn', title: '37 students currently have high workload', body: 'Concentrated in AI & Data Science, Semester 5.', time: '30 minutes ago', unread: true },
  { id: 'an-2', level: 'risk', title: 'Machine Learning has the highest assignment density this week', body: '14 active assignments across 3 sections.', time: '3 hours ago', unread: true },
  { id: 'an-3', level: 'info', title: 'Weekly workload report generated', body: 'Academic week 36 summary is ready for review.', time: 'Yesterday', unread: false },
]
