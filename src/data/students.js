// Deterministic mock roster. Generated once at module load so every screen
// (teacher students list, capacity analysis, admin tables) shares the same
// numbers — the prototype should never contradict itself between pages.

const FIRST = [
  'Dharun', 'Arun', 'Priya', 'Karthik', 'Ananya', 'Vikram', 'Nithya', 'Sanjay', 'Divya', 'Rahul',
  'Meera', 'Aditya', 'Swetha', 'Harish', 'Kavya', 'Naveen', 'Shreya', 'Manoj', 'Lakshmi', 'Rohit',
  'Aishwarya', 'Ganesh', 'Deepa', 'Surya', 'Pooja', 'Vishnu', 'Ramya', 'Balaji', 'Sneha', 'Akash',
]
const LAST = [
  'Rajan', 'Kumar', 'S.', 'R.', 'M.', 'Venkatesh', 'Iyer', 'Nair', 'Krishnan', 'Pillai',
  'Menon', 'Reddy', 'Sharma', 'Prasad', 'Balan',
]
const DEPARTMENTS = ['AI & Data Science', 'Computer Science', 'Information Technology']
const SECTIONS = ['Section A', 'Section B']

// Simple deterministic pseudo-random generator so the roster is stable.
function seeded(i, salt) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// The whole prototype tells one story: a 2-hour assignment lands as 42 safe,
// 10 moderate and 8 insufficient across a 60-student section. That split is
// quoted on the landing page, the teacher dashboard and the notifications, so
// the roster is generated to produce exactly it rather than drifting from the copy.
const BUCKETS = { insufficient: 8, moderate: 10, safe: 42 }

// Build the exact label multiset, then deal it out in a fixed, seeded order so the
// flagged students are scattered through the roster instead of clustered at the top.
// Index 0 is pinned to `insufficient` because that seat is the worked example.
const BUCKET_BY_INDEX = (() => {
  const labels = [
    ...Array(BUCKETS.insufficient).fill('insufficient'),
    ...Array(BUCKETS.moderate).fill('moderate'),
    ...Array(BUCKETS.safe).fill('safe'),
  ]
  const order = Array.from({ length: labels.length }, (_, i) => i)
    .sort((a, b) => seeded(a, 9) - seeded(b, 9))
  const out = []
  order.forEach((slot, n) => { out[slot] = labels[n] })

  // Guarantee index 0 is insufficient by swapping with the first one that is.
  if (out[0] !== 'insufficient') {
    const donor = out.findIndex((l) => l === 'insufficient')
    out[donor] = out[0]
    out[0] = 'insufficient'
  }
  return out
})()

const bucketFor = (i) => BUCKET_BY_INDEX[i] || 'safe'

// Slack = available - existing. The bands are sized against the ML layer's
// PREDICTED effort, not the teacher's flat estimate: the model typically returns
// ~3.5 h for a 2 h task, so a student needs ~5.5 h of slack to keep 2 h spare
// afterwards. Tuning these against the flat estimate made almost the whole class
// read as over capacity once real predictions were wired in.
const SLACK_RANGE = { insufficient: [1.0, 3.2], moderate: [3.8, 5.2], safe: [6.0, 11.0] }

function buildStudent(i) {
  const first = FIRST[i % FIRST.length]
  const last = LAST[(i * 3) % LAST.length]
  const name = i === 0 ? 'Dharun Rajan' : `${first} ${last}`

  const bucket = bucketFor(i)
  const [lo, hi] = SLACK_RANGE[bucket]
  const slack = Math.round((lo + seeded(i, 1) * (hi - lo)) * 2) / 2
  const existing = Math.round((1 + seeded(i, 2) * 4.5) * 2) / 2
  const available = +(existing + slack).toFixed(1)

  // Workload is the share of declared time already committed.
  const workload = Math.min(97, Math.max(18, Math.round((existing / available) * 100)))
  const completion = Math.round(62 + seeded(i, 4) * 36)

  return {
    id: `stu-${String(i + 1).padStart(2, '0')}`,
    name,
    initials: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
    rollNo: `21AD${1000 + i * 7}`,
    department: i < 24 ? 'AI & Data Science' : DEPARTMENTS[i % DEPARTMENTS.length],
    section: SECTIONS[i % 2],
    className: `Semester 5 · ${SECTIONS[i % 2]}`,
    availableHours: available,
    existingHours: existing,
    workload,
    completionRate: completion,
    assignmentsPending: Math.round(2 + seeded(i, 5) * 6),
    // Consumed by the ML layer (see services/api.js -> toStudentPayload).
    lateSubmissions: Math.round(seeded(i, 6) * 4),
    // Centred on 2.0 to match the training distribution's mean. An earlier
    // version averaged 2.5, which told the model every student was slow and
    // inflated every predicted completion time.
    averageCompletionHours: Math.round((1.3 + seeded(i, 7) * 1.5) * 10) / 10,
    email: `${first.toLowerCase()}.${String(i + 1).padStart(2, '0')}@acadsync.edu`,
  }
}

// The signed-in student is pinned to the worked example used across the docs:
// 3 h available, 2 h already committed, so a 2 h assignment leaves -1 h.
const roster = Array.from({ length: 60 }, (_, i) => buildStudent(i))
roster[0] = {
  ...roster[0],
  availableHours: 3,
  existingHours: 2,
  workload: 72,
  completionRate: 88,
  assignmentsPending: 7,
  lateSubmissions: 2,
  averageCompletionHours: 2.5,
  department: 'AI & Data Science',
  section: 'Section A',
  className: 'Semester 5 · Section A',
  rollNo: '21AD1042',
  email: 'dharun.r@acadsync.edu',
}

export const students = roster

export function capacityLevel(remaining) {
  if (remaining < 0) return 'insufficient'
  if (remaining < 1.5) return 'moderate'
  return 'safe'
}

export function workloadLevel(workload) {
  if (workload >= 80) return 'high'
  if (workload >= 60) return 'moderate'
  return 'low'
}

// Simulated capacity analysis. Pure arithmetic on the mock roster — this is
// deliberately transparent, not a model, and the UI labels it that way.
export function analyseCapacity(newAssignmentHours = 2) {
  const rows = students.map((s) => {
    const remaining = +(s.availableHours - s.existingHours - newAssignmentHours).toFixed(1)
    return { ...s, newHours: newAssignmentHours, remaining, level: capacityLevel(remaining) }
  })

  const safe = rows.filter((r) => r.level === 'safe')
  const moderate = rows.filter((r) => r.level === 'moderate')
  const insufficient = rows.filter((r) => r.level === 'insufficient')

  return {
    rows,
    total: rows.length,
    safe: safe.length,
    moderate: moderate.length,
    insufficient: insufficient.length,
    affected: [...insufficient, ...moderate].sort((a, b) => a.remaining - b.remaining),
  }
}

export const studentAssignmentHistory = [
  { id: 'h-1', assignment: 'Feature Engineering Notebook', subject: 'Machine Learning', deadline: 'Aug 25', status: 'Completed', submission: 'On time', marks: '18/20' },
  { id: 'h-2', assignment: 'Dashboard Critique Report', subject: 'Data Visualization', deadline: 'Aug 29', status: 'Completed', submission: 'On time', marks: '13/15' },
  { id: 'h-3', assignment: 'MapReduce Word Frequency', subject: 'Big Data Analytics', deadline: 'Aug 31', status: 'Overdue', submission: 'Not submitted', marks: '—' },
  { id: 'h-4', assignment: 'Build a Classification Model', subject: 'Machine Learning', deadline: 'Sep 4', status: 'In Progress', submission: 'Pending', marks: '—' },
  { id: 'h-5', assignment: 'Normalization & Indexing Lab', subject: 'Database Management Systems', deadline: 'Sep 7', status: 'In Progress', submission: 'Pending', marks: '—' },
  { id: 'h-6', assignment: 'Inheritance & Interfaces Worksheet', subject: 'Java Programming', deadline: 'Sep 9', status: 'Not Started', submission: 'Pending', marks: '—' },
]

export const studentWorkloadTimeline = [
  { day: 'Monday', hours: 2 },
  { day: 'Tuesday', hours: 4 },
  { day: 'Wednesday', hours: 3 },
  { day: 'Thursday', hours: 6 },
  { day: 'Friday', hours: 5 },
]
