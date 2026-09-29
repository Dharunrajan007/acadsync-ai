import { students } from './students'

export const teacherAssignments = [
  {
    id: 'tasg-01',
    title: 'Machine Learning Classification Assignment',
    subject: 'Machine Learning',
    className: 'Semester 5 · Section A',
    students: 60,
    submitted: 42,
    pending: 18,
    deadline: 'Tomorrow · 11:59 PM',
    estimatedHours: 2,
    difficulty: 'Hard',
    marks: 20,
    status: 'Active',
    riskCount: 8,
  },
  {
    id: 'tasg-02',
    title: 'Regression Analysis Worksheet',
    subject: 'Machine Learning',
    className: 'Semester 5 · Section B',
    students: 58,
    submitted: 51,
    pending: 7,
    deadline: 'September 8 · 6:00 PM',
    estimatedHours: 1.5,
    difficulty: 'Medium',
    marks: 15,
    status: 'Active',
    riskCount: 3,
  },
  {
    id: 'tasg-03',
    title: 'MapReduce Word Frequency',
    subject: 'Big Data Analytics',
    className: 'Semester 5 · Section A',
    students: 60,
    submitted: 55,
    pending: 5,
    deadline: 'August 31 · 11:59 PM',
    estimatedHours: 2,
    difficulty: 'Medium',
    marks: 20,
    status: 'Closed',
    riskCount: 0,
  },
  {
    id: 'tasg-04',
    title: 'Spark DataFrame Lab',
    subject: 'Big Data Analytics',
    className: 'Semester 5 · Section B',
    students: 58,
    submitted: 12,
    pending: 46,
    deadline: 'September 12 · 5:00 PM',
    estimatedHours: 3,
    difficulty: 'Hard',
    marks: 25,
    status: 'Active',
    riskCount: 11,
  },
  {
    id: 'tasg-05',
    title: 'Model Evaluation Quiz Prep',
    subject: 'Machine Learning',
    className: 'Semester 5 · Section A',
    students: 60,
    submitted: 0,
    pending: 60,
    deadline: 'September 15 · 11:59 PM',
    estimatedHours: 1,
    difficulty: 'Easy',
    marks: 10,
    status: 'Draft',
    riskCount: 0,
  },
]

const SUBMISSION_STATES = ['Submitted', 'Submitted', 'Submitted', 'Pending', 'Submitted', 'Late', 'Submitted', 'Pending']

export const submissionsFor = (assignmentId) =>
  students.slice(0, 24).map((s, i) => {
    const state = SUBMISSION_STATES[(i + assignmentId.length) % SUBMISSION_STATES.length]
    const evaluated = state !== 'Pending' && i % 3 === 0
    return {
      id: `${assignmentId}-sub-${i}`,
      studentId: s.id,
      student: s.name,
      initials: s.initials,
      rollNo: s.rollNo,
      status: state,
      submittedAt: state === 'Pending' ? '—' : state === 'Late' ? 'September 5, 12:40 AM' : `September ${2 + (i % 3)}, ${5 + (i % 6)}:1${i % 10} PM`,
      file: state === 'Pending' ? null : `${s.name.split(' ')[0].toLowerCase()}_assignment.pdf`,
      marks: evaluated ? 14 + (i % 6) : null,
      feedback: evaluated ? 'Good structure. Expand the evaluation section next time.' : '',
    }
  })

export const classWorkload = {
  averageWorkload: 68,
  overloaded: 8,
  atRisk: 14,
  onTrack: 42,
  bySubject: [
    { subject: 'Machine Learning', level: 'High', hours: 5.4, percent: 88 },
    { subject: 'Big Data Analytics', level: 'Medium', hours: 3.6, percent: 62 },
    { subject: 'Database Management Systems', level: 'Medium', hours: 3.1, percent: 56 },
    { subject: 'Java Programming', level: 'Medium', hours: 2.8, percent: 50 },
    { subject: 'Python Programming', level: 'Low', hours: 1.6, percent: 28 },
  ],
  weeklyLoad: [
    { day: 'Mon', assignments: 4, hours: 6 },
    { day: 'Tue', assignments: 6, hours: 9 },
    { day: 'Wed', assignments: 3, hours: 5 },
    { day: 'Thu', assignments: 7, hours: 11 },
    { day: 'Fri', assignments: 9, hours: 14 },
    { day: 'Sat', assignments: 2, hours: 3 },
    { day: 'Sun', assignments: 0, hours: 0 },
  ],
}

// Built from the live analysis so the copy never contradicts the table above it
// when the teacher changes the estimate or the deadline.
export function buildRecommendations({ insufficient, moderate, hours }) {
  const flagged = insufficient
  const shorter = Math.max(0.5, hours - 0.5)
  return [
    {
      id: 'r-1',
      label: 'Extend the deadline',
      detail: `Two extra days clears ${flagged} of the ${flagged} flagged students and most of the ${moderate} on a thin margin.`,
      icon: 'calendar',
    },
    {
      id: 'r-2',
      label: 'Reduce assignment scope',
      detail: `Trimming the brief to about ${shorter} hours brings the flagged students back inside their available time.`,
      icon: 'scissors',
    },
    {
      id: 'r-3',
      label: 'Provide an alternative task',
      detail: `Offer a shorter variant to the ${flagged} flagged students only, and keep the original for everyone else.`,
      icon: 'shuffle',
    },
    {
      id: 'r-4',
      label: 'Allow individual grace periods',
      detail: `Grant a 48-hour extension to the ${flagged} flagged students without moving the class deadline.`,
      icon: 'clock',
    },
    {
      id: 'r-5',
      label: 'Continue with the original assignment',
      detail: 'Assign as planned. Flagged students are told about the deadline risk when it lands.',
      icon: 'check',
    },
  ]
}
