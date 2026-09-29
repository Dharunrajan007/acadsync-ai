import { useMemo } from 'react'
import { PlusCircle, Users, Inbox, BarChart3 } from 'lucide-react'
import HomeFeed, { AllClear, QuickActions } from '../../components/HomeFeed'
import { buildTeacherFeed, splitFeed } from '../../lib/priority'
import { currentTeacher } from '../../data/mockData'
import { useApp } from '../../context/AppContext'

/**
 * Teacher Home.
 *
 * Answers "what needs my attention?". The stat grid, class-capacity panel and
 * weekly-load chart moved to Workload analysis; the assignment list moved to
 * Assignments. What remains is the decision queue.
 */
export default function TeacherHome() {
  const { teacherAssignments } = useApp()

  // Derived from the same mock data the rest of the teacher app uses.
  const riskStudentCount = 8
  const pendingReviews = teacherAssignments
    .filter((a) => a.status === 'Active')
    .reduce((sum, a) => sum + a.pending, 0)

  const { activities } = useMemo(
    () => buildTeacherFeed({ teacherAssignments, riskStudentCount, pendingReviews }),
    [teacherAssignments, pendingReviews]
  )

  const { primary, secondary, remaining } = splitFeed(activities, 3)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const quickActions = [
    { to: '/teacher/create', icon: PlusCircle, label: 'Create work', hint: 'Draft and check before assigning' },
    { to: '/teacher/submissions', icon: Inbox, label: 'Review submissions', hint: 'Mark and give feedback' },
    { to: '/teacher/students', icon: Users, label: 'View students', hint: 'Workload and capacity' },
    { to: '/teacher/workload', icon: BarChart3, label: 'Class workload', hint: 'Where the load concentrates' },
  ]

  return (
    <HomeFeed
      greeting={greeting}
      name={currentTeacher.name}
      subtitle={primary ? 'Here is what needs your attention.' : 'Nothing needs your attention right now.'}
      primary={primary}
      secondary={secondary}
      remaining={remaining}
      viewAllTo="/teacher/assignments"
      viewAllLabel="View all work"
      emptyState={
        <AllClear
          title="Nothing needs your attention"
          message="No students are flagged and no submissions are waiting. Create new work when you are ready."
        />
      }
    >
      <QuickActions actions={quickActions} />
    </HomeFeed>
  )
}
