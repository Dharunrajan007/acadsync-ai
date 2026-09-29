import { Routes, Route, Navigate } from 'react-router-dom'
import {
  User, GraduationCap, Clock, Settings, HelpCircle, LogOut, BookOpen, Inbox,
  CalendarDays, BarChart3, Users, ClipboardList, Building2, LayoutGrid, School, Shield,
} from 'lucide-react'

import AppLayout from './layouts/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

import StudentHome from './pages/student/Home'
import StudentTimeline from './pages/student/Timeline'
import StudentAssignments from './pages/student/Assignments'
import AssignmentDetail from './pages/student/AssignmentDetail'
import StudentAvailability from './pages/student/Availability'
import StudentWorkload from './pages/student/Workload'
import StudentSubmissions from './pages/student/Submissions'
import StudentNotifications from './pages/student/Notifications'
import StudentSettings from './pages/student/Settings'

import TeacherHome from './pages/teacher/Home'
import TeacherAssignments from './pages/teacher/Assignments'
import CreateAssignment from './pages/teacher/CreateAssignment'
import TeacherStudents from './pages/teacher/Students'
import TeacherStudentProfile from './pages/teacher/StudentProfile'
import TeacherWorkload from './pages/teacher/WorkloadAnalysis'
import TeacherSubmissions from './pages/teacher/Submissions'
import TeacherNotifications from './pages/teacher/Notifications'
import TeacherSettings from './pages/teacher/Settings'

import AdminHome from './pages/admin/Home'
import AdminStudents from './pages/admin/Students'
import AdminTeachers from './pages/admin/Teachers'
import AdminSubjects from './pages/admin/Subjects'
import AdminAnalytics from './pages/admin/WorkloadAnalytics'
import AdminAssignments from './pages/admin/Assignments'
import AdminDepartments from './pages/admin/Departments'
import AdminSettings from './pages/admin/SystemSettings'
import AdminNotifications from './pages/admin/Notifications'

import { currentStudent, currentTeacher, currentAdmin, assignments, subjects, teachers } from './data/mockData'
import { students } from './data/students'

// Direct links in the rail, under Notifications. These are the screens people
// return to daily; search and Profile still reach everything else. Kept to five
// per role so the rail stays scannable rather than becoming a full sidebar again.
const studentJumpTo = [
  { label: 'My work', to: '/student/assignments', icon: BookOpen },
  { label: 'My timeline', to: '/student/timeline', icon: CalendarDays },
  { label: 'My availability', to: '/student/availability', icon: Clock },
  { label: 'Workload', to: '/student/workload', icon: BarChart3 },
  { label: 'Submissions', to: '/student/submissions', icon: Inbox },
]

const teacherJumpTo = [
  { label: 'Assignments', to: '/teacher/assignments', icon: BookOpen },
  { label: 'Students', to: '/teacher/students', icon: Users },
  { label: 'Class workload', to: '/teacher/workload', icon: BarChart3 },
  { label: 'Submissions', to: '/teacher/submissions', icon: Inbox },
]

const adminJumpTo = [
  { label: 'Students', to: '/admin/students', icon: GraduationCap },
  { label: 'Teachers', to: '/admin/teachers', icon: School },
  { label: 'Subjects', to: '/admin/subjects', icon: LayoutGrid },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Departments', to: '/admin/departments', icon: Building2 },
]

// The Profile panel is the app's "More" area. Everything that left the sidebar
// but is not a daily action lives here, grouped so nothing is a flat dump.
const studentProfileSections = [
  {
    title: 'Academic',
    items: [
      { label: 'My work', to: '/student/assignments', icon: BookOpen },
      { label: 'My timeline', to: '/student/timeline', icon: CalendarDays },
      { label: 'Availability', to: '/student/availability', icon: Clock },
      { label: 'Workload', to: '/student/workload', icon: BarChart3 },
      { label: 'Submissions & marks', to: '/student/submissions', icon: Inbox },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Academic profile', to: '/student/settings', icon: GraduationCap },
      { label: 'Preferences', to: '/student/settings', icon: Settings },
      { label: 'Help', to: '/student/settings', icon: HelpCircle },
      { label: 'Sign out', to: '/login', icon: LogOut, tone: 'danger' },
    ],
  },
]

const teacherProfileSections = [
  {
    title: 'Teaching',
    items: [
      { label: 'Assignments', to: '/teacher/assignments', icon: BookOpen },
      { label: 'Students', to: '/teacher/students', icon: Users },
      { label: 'Class workload', to: '/teacher/workload', icon: BarChart3 },
      { label: 'Submissions', to: '/teacher/submissions', icon: Inbox },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', to: '/teacher/settings', icon: User },
      { label: 'Preferences', to: '/teacher/settings', icon: Settings },
      { label: 'Help', to: '/teacher/settings', icon: HelpCircle },
      { label: 'Sign out', to: '/login', icon: LogOut, tone: 'danger' },
    ],
  },
]

const adminProfileSections = [
  {
    title: 'Manage',
    items: [
      { label: 'Students', to: '/admin/students', icon: GraduationCap },
      { label: 'Teachers', to: '/admin/teachers', icon: School },
      { label: 'Subjects', to: '/admin/subjects', icon: LayoutGrid },
      { label: 'Assignments', to: '/admin/assignments', icon: ClipboardList },
      { label: 'Departments', to: '/admin/departments', icon: Building2 },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Workload analytics', to: '/admin/analytics', icon: BarChart3 },
      { label: 'System settings', to: '/admin/settings', icon: Shield },
      { label: 'Help', to: '/admin/settings', icon: HelpCircle },
      { label: 'Sign out', to: '/login', icon: LogOut, tone: 'danger' },
    ],
  },
]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/student"
        element={
          <AppLayout
            role="student"
            roleLabel={currentStudent.department}
            user={currentStudent}
            homePath="/student"
            jumpTo={studentJumpTo}
            profileSections={studentProfileSections}
            searchData={{ assignments, subjects, teachers, assignmentBase: '/student/assignments' }}
          />
        }
      >
        <Route index element={<StudentHome />} />
        <Route path="timeline" element={<StudentTimeline />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="assignments/:id" element={<AssignmentDetail />} />
        <Route path="availability" element={<StudentAvailability />} />
        <Route path="workload" element={<StudentWorkload />} />
        <Route path="submissions" element={<StudentSubmissions />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <AppLayout
            role="teacher"
            roleLabel={currentTeacher.department}
            user={currentTeacher}
            homePath="/teacher"
            jumpTo={teacherJumpTo}
            profileSections={teacherProfileSections}
            searchData={{ students, subjects, studentBase: '/teacher/students' }}
          />
        }
      >
        <Route index element={<TeacherHome />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="create" element={<CreateAssignment />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="students/:id" element={<TeacherStudentProfile />} />
        <Route path="workload" element={<TeacherWorkload />} />
        <Route path="submissions" element={<TeacherSubmissions />} />
        <Route path="submissions/:id" element={<TeacherSubmissions />} />
        <Route path="notifications" element={<TeacherNotifications />} />
        <Route path="settings" element={<TeacherSettings />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AppLayout
            role="admin"
            roleLabel={currentAdmin.designation}
            user={currentAdmin}
            homePath="/admin"
            jumpTo={adminJumpTo}
            profileSections={adminProfileSections}
            searchData={{ students, teachers, subjects, studentBase: '/admin/students' }}
          />
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="assignments" element={<AdminAssignments />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
