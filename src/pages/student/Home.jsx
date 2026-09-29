import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Clock, BookOpen, CalendarDays, BarChart3 } from 'lucide-react'
import HomeFeed, { AllClear, QuickActions } from '../../components/HomeFeed'
import { buildStudentFeed, splitFeed } from '../../lib/priority'
import { todayPlan, weeklyWorkload, currentStudent } from '../../data/mockData'
import { useApp } from '../../context/AppContext'

/**
 * Student Home.
 *
 * Answers "what should I do now?" and nothing else. The stat grid, capacity
 * chart, full deadline list and AI panels that used to live here are all still
 * in the app — on Workload, Timeline and Assignments — but they are not what a
 * student needs the second they open the page.
 */
export default function StudentHome() {
  const { assignments, availability } = useApp()

  const availabilitySet = availability.some((day) => !day.unavailable && day.slots.length > 0)

  const { activities, workload } = useMemo(
    () => buildStudentFeed({ assignments, weeklyWorkload, availabilitySet }),
    [assignments, availabilitySet]
  )

  const { primary, secondary, remaining } = splitFeed(activities, 3)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  // Quick actions appear only when they apply to the situation on screen.
  const quickActions = []
  if (!availabilitySet) {
    quickActions.push({ to: '/student/availability', icon: Clock, label: 'Set availability', hint: 'So work can be planned around you' })
  }
  if (assignments.some((a) => a.status !== 'Completed')) {
    quickActions.push({ to: '/student/assignments', icon: BookOpen, label: 'View my work', hint: 'Everything assigned to you' })
  }
  if (todayPlan.length > 0) {
    quickActions.push({ to: '/student/timeline', icon: CalendarDays, label: "Today's plan", hint: 'When to work on what' })
  }
  if (workload.tight) {
    quickActions.push({ to: '/student/workload', icon: BarChart3, label: 'Check my workload', hint: 'Where the week is tight' })
  }

  const subtitle = primary
    ? "Here's what needs your attention."
    : 'Nothing needs your attention right now.'

  return (
    <HomeFeed
      greeting={greeting}
      name={currentStudent.shortName}
      subtitle={subtitle}
      primary={primary}
      secondary={secondary}
      remaining={remaining}
      viewAllTo="/student/assignments"
      viewAllLabel="View all work"
      emptyState={
        <AllClear
          message="No academic work needs your attention. New assignments will appear here as soon as they are set."
          action={<Link to="/student/timeline" className="btn btn-secondary btn-md">View upcoming schedule</Link>}
        />
      }
    >
      <QuickActions actions={quickActions.slice(0, 4)} />
    </HomeFeed>
  )
}
