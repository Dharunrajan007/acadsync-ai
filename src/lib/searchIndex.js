// Global search index.
//
// Navigation was cut to four items, so search carries the weight that a sidebar
// used to. Every screen, every action and every record stays reachable here —
// nothing was removed from the app, it was moved behind this.
//
// The index is built per role and covers four kinds of result:
//   destinations — screens that no longer sit in the nav
//   actions      — verbs ("submit", "create work") that behave like commands
//   records      — assignments, students, teachers, subjects
//   recent       — what this user looked at last

import {
  BookOpen, CalendarDays, Clock, BarChart3, Inbox, Bell, Settings, User,
  PlusCircle, Users, GraduationCap, Building2, LayoutGrid, ClipboardList,
  School, Send, FileText, Award, Shield,
} from 'lucide-react'

const RECENT_KEY = 'acadsync.recentSearches'
const MAX_RECENT = 5

// ---------------------------------------------------------------------------
// Destinations and actions per role
// ---------------------------------------------------------------------------
const STUDENT_DESTINATIONS = [
  { id: 'd-work', title: 'My work', subtitle: 'All assignments, pending and completed', to: '/student/assignments', icon: BookOpen, keywords: 'assignments homework tasks work pending overdue completed' },
  { id: 'd-timeline', title: 'My timeline', subtitle: 'Your plan across the day, week and month', to: '/student/timeline', icon: CalendarDays, keywords: 'timeline schedule calendar plan day week month' },
  { id: 'd-availability', title: 'My availability', subtitle: 'The hours you can realistically work', to: '/student/availability', icon: Clock, keywords: 'availability schedule working hours free time edit periods' },
  { id: 'd-workload', title: 'Workload', subtitle: 'Capacity, distribution and deadline risk', to: '/student/workload', icon: BarChart3, keywords: 'workload capacity analysis risk hours intelligence' },
  { id: 'd-submissions', title: 'Submissions', subtitle: 'What you sent and what was marked', to: '/student/submissions', icon: Inbox, keywords: 'submissions submitted marks grades results history' },
  { id: 'd-notifications', title: 'Notifications', subtitle: 'Alerts and updates', to: '/student/notifications', icon: Bell, keywords: 'notifications alerts updates messages' },
  { id: 'd-settings', title: 'Preferences', subtitle: 'Notifications and workspace settings', to: '/student/settings', icon: Settings, keywords: 'settings preferences account profile privacy help' },
]

const STUDENT_ACTIONS = [
  { id: 'a-submit', title: 'Submit an assignment', subtitle: 'Upload and hand in your work', to: '/student/assignments', icon: Send, keywords: 'submit upload hand in turn in send' },
  { id: 'a-set-availability', title: 'Edit working hours', subtitle: 'Change when you are available', to: '/student/availability', icon: Clock, keywords: 'set edit change availability working hours schedule' },
  { id: 'a-view-plan', title: 'View today’s plan', subtitle: 'What to work on and when', to: '/student/timeline', icon: CalendarDays, keywords: 'plan today schedule what to do now' },
  { id: 'a-marks', title: 'View my marks', subtitle: 'Scores and feedback received', to: '/student/submissions', icon: Award, keywords: 'marks grades scores results feedback evaluation' },
]

const TEACHER_DESTINATIONS = [
  { id: 'td-assignments', title: 'Assignments', subtitle: 'Everything you have assigned', to: '/teacher/assignments', icon: BookOpen, keywords: 'assignments work active draft closed' },
  { id: 'td-students', title: 'Students', subtitle: 'Workload and capacity per student', to: '/teacher/students', icon: Users, keywords: 'students class roster workload capacity' },
  { id: 'td-workload', title: 'Class workload', subtitle: 'How much load your classes carry', to: '/teacher/workload', icon: BarChart3, keywords: 'workload analysis class capacity distribution subject' },
  { id: 'td-submissions', title: 'Submissions', subtitle: 'Review and mark student work', to: '/teacher/submissions', icon: Inbox, keywords: 'submissions review mark evaluate grade feedback' },
  { id: 'td-notifications', title: 'Notifications', subtitle: 'Alerts and updates', to: '/teacher/notifications', icon: Bell, keywords: 'notifications alerts updates' },
  { id: 'td-settings', title: 'Preferences', subtitle: 'Notifications and workspace settings', to: '/teacher/settings', icon: Settings, keywords: 'settings preferences account profile' },
]

const TEACHER_ACTIONS = [
  { id: 'ta-create', title: 'Create work', subtitle: 'Draft a new assignment', to: '/teacher/create', icon: PlusCircle, keywords: 'create new assignment work add draft publish assign' },
  { id: 'ta-check', title: 'Check student capacity', subtitle: 'See who can absorb new work', to: '/teacher/create', icon: BarChart3, keywords: 'check capacity analyse analyze before assign risk' },
  { id: 'ta-review', title: 'Review submissions', subtitle: 'Mark work and leave feedback', to: '/teacher/submissions', icon: FileText, keywords: 'review mark grade evaluate feedback submissions' },
  { id: 'ta-at-risk', title: 'Students needing attention', subtitle: 'Those with insufficient capacity', to: '/teacher/students?filter=high', icon: Users, keywords: 'at risk struggling attention high workload flagged' },
]

const ADMIN_DESTINATIONS = [
  { id: 'ad-students', title: 'Students', subtitle: 'Every student on the platform', to: '/admin/students', icon: GraduationCap, keywords: 'students roster enrolment workload' },
  { id: 'ad-teachers', title: 'Teachers', subtitle: 'Staff and assignment activity', to: '/admin/teachers', icon: School, keywords: 'teachers staff faculty lecturers' },
  { id: 'ad-subjects', title: 'Subjects', subtitle: 'Courses and assignment density', to: '/admin/subjects', icon: LayoutGrid, keywords: 'subjects courses modules density' },
  { id: 'ad-analytics', title: 'Workload analytics', subtitle: 'Trends and deadline congestion', to: '/admin/analytics', icon: BarChart3, keywords: 'analytics trends charts congestion reports insight' },
  { id: 'ad-assignments', title: 'Assignments', subtitle: 'All assignments across departments', to: '/admin/assignments', icon: ClipboardList, keywords: 'assignments work all departments' },
  { id: 'ad-departments', title: 'Departments', subtitle: 'Per-department workload standing', to: '/admin/departments', icon: Building2, keywords: 'departments faculties schools divisions' },
  { id: 'ad-notifications', title: 'Notifications', subtitle: 'Institution alerts', to: '/admin/notifications', icon: Bell, keywords: 'notifications alerts updates' },
  { id: 'ad-settings', title: 'System settings', subtitle: 'Thresholds and model information', to: '/admin/settings', icon: Shield, keywords: 'settings system thresholds model metrics configuration' },
]

const ADMIN_ACTIONS = [
  { id: 'aa-review-overload', title: 'Review overloaded students', subtitle: 'Students above capacity', to: '/admin/students?filter=high', icon: Users, keywords: 'overloaded review tight schedules at risk attention' },
  { id: 'aa-congestion', title: 'Deadline congestion', subtitle: 'Dates with too much due at once', to: '/admin/analytics', icon: CalendarDays, keywords: 'congestion deadline clash busy dates' },
]

const ROLE_CONFIG = {
  student: { destinations: STUDENT_DESTINATIONS, actions: STUDENT_ACTIONS },
  teacher: { destinations: TEACHER_DESTINATIONS, actions: TEACHER_ACTIONS },
  admin: { destinations: ADMIN_DESTINATIONS, actions: ADMIN_ACTIONS },
}

// ---------------------------------------------------------------------------
// Index construction
// ---------------------------------------------------------------------------

/**
 * Build the full searchable index for a role.
 *
 * @param {string} role - student | teacher | admin
 * @param {object} data - live records to fold in (assignments, students, …)
 */
export function buildIndex(role, data = {}) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student
  const entries = []

  for (const item of config.destinations) {
    entries.push({ ...item, group: 'Go to', type: 'destination' })
  }
  for (const item of config.actions) {
    entries.push({ ...item, group: 'Actions', type: 'action' })
  }

  for (const assignment of data.assignments || []) {
    entries.push({
      id: `asg-${assignment.id}`,
      group: 'Assignments',
      type: 'record',
      title: assignment.title,
      subtitle: `${assignment.subject} · ${assignment.deadlineLabel || assignment.deadline || ''}`,
      to: data.assignmentBase ? `${data.assignmentBase}/${assignment.id}` : '/student/assignments',
      icon: BookOpen,
      keywords: `${assignment.title} ${assignment.subject} ${assignment.teacher || ''} ${assignment.status || ''}`,
    })
  }

  for (const student of data.students || []) {
    entries.push({
      id: `stu-${student.id}`,
      group: 'Students',
      type: 'record',
      title: student.name,
      subtitle: `${student.department} · ${student.rollNo}`,
      to: `${data.studentBase || '/teacher/students'}/${student.id}`,
      icon: User,
      keywords: `${student.name} ${student.rollNo} ${student.department} ${student.section || ''}`,
    })
  }

  for (const teacher of data.teachers || []) {
    entries.push({
      id: `tea-${teacher.id}`,
      group: 'Teachers',
      type: 'record',
      title: teacher.name,
      subtitle: `${teacher.department} · ${teacher.subjects?.join(', ') || ''}`,
      to: data.teacherTo || '/admin/teachers',
      icon: School,
      keywords: `${teacher.name} ${teacher.department} ${teacher.subjects?.join(' ') || ''}`,
    })
  }

  for (const subject of data.subjects || []) {
    entries.push({
      id: `sub-${subject.id}`,
      group: 'Subjects',
      type: 'record',
      title: subject.name,
      subtitle: `${subject.code} · ${subject.teacher}`,
      to: data.subjectTo || '/admin/subjects',
      icon: LayoutGrid,
      keywords: `${subject.name} ${subject.code} ${subject.teacher} ${subject.department}`,
    })
  }

  return entries
}

/**
 * Rank index entries against a query.
 *
 * Scoring favours a title that starts with the query over one that merely
 * contains it, and destinations/actions over records — when someone types
 * "availability" they almost always want the screen, not a record mentioning it.
 */
export function searchIndex(entries, query, limit = 12) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const scored = []

  for (const entry of entries) {
    const title = entry.title.toLowerCase()
    const haystack = `${title} ${entry.subtitle || ''} ${entry.keywords || ''}`.toLowerCase()

    let score = 0
    if (title === q) score = 100
    else if (title.startsWith(q)) score = 80
    else if (title.includes(q)) score = 60
    else if (haystack.includes(q)) score = 40
    else {
      // Every word of a multi-word query must appear somewhere.
      const words = q.split(/\s+/).filter(Boolean)
      if (words.length > 1 && words.every((w) => haystack.includes(w))) score = 30
    }

    if (!score) continue
    if (entry.type === 'action') score += 8
    else if (entry.type === 'destination') score += 5

    scored.push({ ...entry, score })
  }

  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
  return scored.slice(0, limit)
}

/** Group ranked results under their headings, preserving rank order. */
export function groupResults(results) {
  const groups = []
  for (const result of results) {
    let group = groups.find((g) => g.name === result.group)
    if (!group) {
      group = { name: result.group, items: [] }
      groups.push(group)
    }
    group.items.push(result)
  }
  return groups
}

// ---------------------------------------------------------------------------
// Recent searches — stored per browser, never leaves the device
// ---------------------------------------------------------------------------
export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw).slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

export function addRecentSearch(entry) {
  try {
    const existing = getRecentSearches().filter((r) => r.title !== entry.title)
    const next = [{ title: entry.title, to: entry.to, subtitle: entry.subtitle }, ...existing].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* private mode or storage disabled — recents are a convenience, not a requirement */
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch {
    /* ignore */
  }
}
