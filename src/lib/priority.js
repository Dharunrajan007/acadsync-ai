// Priority engine.
//
// Home answers one question: "what should I do now?" To answer it the app has to
// rank everything competing for attention onto a single scale, so that the top of
// the feed is chosen rather than merely first in an array.
//
// The score is never shown to the user. Only its consequence is: one priority
// card, then at most three secondary activities.

export const PRIORITY = {
  OVERDUE: 100,
  DUE_TODAY: 90,
  DUE_TOMORROW: 80,
  HIGH_RISK: 70,
  ACTION_REQUIRED: 60,
  SCHEDULED_TODAY: 50,
  UPCOMING: 40,
  GENERAL: 10,
}

/** Rough day distance from the mock `dueSort` field used across the demo data. */
const daysAway = (assignment) => (typeof assignment.dueSort === 'number' ? assignment.dueSort : 99)

/**
 * Score one student assignment.
 * Returns the numeric score plus the label and tone the cards render.
 */
export function scoreAssignment(assignment) {
  const days = daysAway(assignment)

  if (assignment.status === 'Overdue') {
    return { score: PRIORITY.OVERDUE, label: 'Overdue', tone: 'risk', urgency: 'ACTION REQUIRED' }
  }
  if (assignment.status === 'Completed') {
    return { score: 0, label: 'Completed', tone: 'safe', urgency: null }
  }
  if (days <= 0) {
    return { score: PRIORITY.DUE_TODAY, label: 'Due today', tone: 'risk', urgency: 'DUE TODAY' }
  }
  if (days === 1) {
    return { score: PRIORITY.DUE_TOMORROW, label: 'Due tomorrow', tone: 'risk', urgency: 'DUE TOMORROW' }
  }
  if (assignment.priority === 'High') {
    return { score: PRIORITY.HIGH_RISK, label: `Due in ${days} days`, tone: 'warn', urgency: 'HIGH PRIORITY' }
  }
  if (days <= 7) {
    return { score: PRIORITY.UPCOMING, label: `Due in ${days} days`, tone: 'warn', urgency: null }
  }
  return { score: PRIORITY.GENERAL, label: `Due in ${days} days`, tone: 'neutral', urgency: null }
}

/**
 * Build the ranked student activity feed.
 *
 * Workload pressure is injected as its own activity rather than a permanent
 * widget: it earns a place on Home only when the week genuinely does not fit.
 */
export function buildStudentFeed({ assignments, weeklyWorkload = [], availabilitySet = true }) {
  const activities = []

  for (const assignment of assignments) {
    if (assignment.status === 'Completed') continue
    const { score, label, tone, urgency } = scoreAssignment(assignment)
    activities.push({
      id: assignment.id,
      kind: 'assignment',
      score,
      title: assignment.title,
      subject: assignment.subject,
      meta: label,
      urgency,
      tone,
      detail: `About ${assignment.estimatedHours} ${assignment.estimatedHours === 1 ? 'hour' : 'hours'}`,
      to: `/student/assignments/${assignment.id}`,
      actionLabel: assignment.status === 'Not Started' ? 'Start working' : 'Open assignment',
    })
  }

  // Onboarding gap: without availability nothing else can be planned properly.
  if (!availabilitySet) {
    activities.push({
      id: 'setup-availability',
      kind: 'setup',
      score: PRIORITY.ACTION_REQUIRED,
      title: 'Complete your schedule',
      meta: 'Setup needed',
      urgency: 'ACTION REQUIRED',
      tone: 'warn',
      detail: 'AcadSync needs to know when you are available.',
      to: '/student/availability',
      actionLabel: 'Set availability',
    })
  }

  const required = weeklyWorkload.reduce((sum, day) => sum + day.required, 0)
  const available = weeklyWorkload.reduce((sum, day) => sum + day.available, 0)

  if (required > available) {
    activities.push({
      id: 'workload-tight',
      kind: 'workload',
      score: PRIORITY.HIGH_RISK,
      title: 'Your schedule is tight',
      meta: 'This week',
      urgency: 'HEADS UP',
      tone: 'warn',
      detail: `About ${required} hours of work against ${available} available hours.`,
      to: '/student/workload',
      actionLabel: 'View plan',
    })
  }

  activities.sort((a, b) => b.score - a.score)
  return {
    activities,
    workload: { required, available, tight: required > available },
  }
}

/** Build the ranked teacher feed from assignments and class risk. */
export function buildTeacherFeed({ teacherAssignments, riskStudentCount = 0, pendingReviews = 0 }) {
  const activities = []

  if (riskStudentCount > 0) {
    activities.push({
      id: 'students-at-risk',
      kind: 'risk',
      score: PRIORITY.HIGH_RISK,
      title: `${riskStudentCount} students may struggle`,
      meta: 'Upcoming deadlines',
      urgency: 'ATTENTION NEEDED',
      tone: 'warn',
      detail: 'They may not have enough available time before their next deadline.',
      to: '/teacher/students?filter=high',
      actionLabel: 'Review students',
    })
  }

  if (pendingReviews > 0) {
    activities.push({
      id: 'pending-reviews',
      kind: 'review',
      score: PRIORITY.ACTION_REQUIRED,
      title: `${pendingReviews} submissions waiting for review`,
      meta: 'Across your active work',
      urgency: 'ACTION REQUIRED',
      tone: 'info',
      detail: 'Students are waiting on marks and feedback.',
      to: '/teacher/submissions',
      actionLabel: 'Review',
    })
  }

  for (const assignment of teacherAssignments) {
    if (assignment.status !== 'Active') continue
    const closingTomorrow = assignment.deadline?.toLowerCase().includes('tomorrow')
    activities.push({
      id: assignment.id,
      kind: 'assignment',
      score: closingTomorrow ? PRIORITY.DUE_TOMORROW : PRIORITY.UPCOMING,
      title: assignment.title,
      subject: assignment.subject,
      meta: closingTomorrow ? 'Deadline tomorrow' : `Due ${assignment.deadline}`,
      urgency: closingTomorrow ? 'CLOSING SOON' : null,
      tone: closingTomorrow ? 'risk' : 'neutral',
      detail: `${assignment.submitted} of ${assignment.students} submitted`,
      to: '/teacher/assignments',
      actionLabel: 'View',
    })
  }

  activities.sort((a, b) => b.score - a.score)
  return { activities }
}

/** Build the ranked admin feed. */
export function buildAdminFeed({ overloadedStudents = 0, alerts = [] }) {
  const activities = []

  if (overloadedStudents > 0) {
    activities.push({
      id: 'overloaded',
      kind: 'risk',
      score: PRIORITY.HIGH_RISK,
      title: `${overloadedStudents} students have tight schedules`,
      meta: 'Institution-wide',
      urgency: 'ATTENTION NEEDED',
      tone: 'warn',
      detail: 'Their committed work is close to or beyond their available time.',
      to: '/admin/students?filter=high',
      actionLabel: 'Review',
    })
  }

  for (const alert of alerts) {
    if (alert.level === 'warn' && overloadedStudents > 0) continue // already surfaced above
    activities.push({
      id: alert.id,
      kind: 'alert',
      score: alert.level === 'risk' ? PRIORITY.ACTION_REQUIRED : PRIORITY.GENERAL,
      title: alert.title,
      meta: 'Academic overview',
      urgency: alert.level === 'risk' ? 'REVIEW' : null,
      tone: alert.level === 'risk' ? 'risk' : 'info',
      detail: alert.body,
      to: '/admin/analytics',
      actionLabel: 'Open analytics',
    })
  }

  activities.sort((a, b) => b.score - a.score)
  return { activities }
}

/**
 * Split a ranked feed into the one card that leads and the few that follow.
 * The cap is the point: Home must not become a list of everything again.
 */
export function splitFeed(activities, secondaryLimit = 3) {
  return {
    primary: activities[0] ?? null,
    secondary: activities.slice(1, 1 + secondaryLimit),
    remaining: Math.max(0, activities.length - 1 - secondaryLimit),
  }
}
