import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  assignments as seedAssignments,
  weeklyAvailability as seedAvailability,
  monthlyExceptions as seedExceptions,
  studentNotifications,
  teacherNotifications,
  adminNotifications,
} from '../data/mockData'
import { teacherAssignments as seedTeacherAssignments } from '../data/teacherData'

const AppContext = createContext(null)

let idCounter = 100
const nextId = (prefix) => `${prefix}-${++idCounter}`

export function AppProvider({ children }) {
  const [role, setRole] = useState(null)
  const [toast, setToast] = useState(null)

  const [assignments, setAssignments] = useState(seedAssignments)
  const [availability, setAvailability] = useState(seedAvailability)
  const [exceptions, setExceptions] = useState(seedExceptions)
  const [teacherAssignments, setTeacherAssignments] = useState(seedTeacherAssignments)
  const [notifications, setNotifications] = useState({
    student: studentNotifications,
    teacher: teacherNotifications,
    admin: adminNotifications,
  })

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone, id: Date.now() })
    setTimeout(() => setToast(null), 3200)
  }, [])

  // --- student actions -----------------------------------------------------
  const updateAssignment = useCallback((id, patch) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  const submitAssignment = useCallback((id, fileName) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'Completed', progress: 100, submittedFile: fileName, submittedAt: 'Just now' }
          : a
      )
    )
  }, [])

  const addSlot = useCallback((day, start, end) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, unavailable: false, slots: [...d.slots, { id: nextId('av'), start, end }] }
          : d
      )
    )
  }, [])

  const updateSlot = useCallback((day, slotId, patch) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === day ? { ...d, slots: d.slots.map((s) => (s.id === slotId ? { ...s, ...patch } : s)) } : d
      )
    )
  }, [])

  const removeSlot = useCallback((day, slotId) => {
    setAvailability((prev) =>
      prev.map((d) => (d.day === day ? { ...d, slots: d.slots.filter((s) => s.id !== slotId) } : d))
    )
  }, [])

  const toggleDayUnavailable = useCallback((day) => {
    setAvailability((prev) =>
      prev.map((d) => (d.day === day ? { ...d, unavailable: !d.unavailable } : d))
    )
  }, [])

  const setException = useCallback((date, patch) => {
    setExceptions((prev) => {
      const existing = prev.find((e) => e.date === date)
      if (!patch) return prev.filter((e) => e.date !== date)
      if (existing) return prev.map((e) => (e.date === date ? { ...e, ...patch } : e))
      return [...prev, { date, ...patch }]
    })
  }, [])

  // --- teacher actions -----------------------------------------------------
  const createAssignment = useCallback((draft, status = 'Active') => {
    const record = {
      id: nextId('tasg'),
      title: draft.title || 'Untitled assignment',
      subject: draft.subject,
      className: draft.className,
      students: 60,
      submitted: 0,
      pending: 60,
      deadline: draft.deadlineLabel || 'Not scheduled',
      estimatedHours: Number(draft.estimatedHours) || 1,
      difficulty: draft.difficulty,
      marks: Number(draft.marks) || 10,
      status,
      riskCount: draft.riskCount ?? 0,
    }
    setTeacherAssignments((prev) => [record, ...prev])

    if (status === 'Active') {
      // The assignment also lands in the student's own list — this is the
      // teacher → student handoff that the prototype is meant to demonstrate.
      setAssignments((prev) => [
        {
          id: nextId('asg'),
          title: record.title,
          subject: record.subject,
          teacher: 'Dr. Kumar',
          deadlineLabel: record.deadline,
          deadlineFull: record.deadline,
          dueSort: 2,
          estimatedHours: record.estimatedHours,
          difficulty: record.difficulty,
          priority: record.difficulty === 'Hard' ? 'High' : record.difficulty === 'Medium' ? 'Medium' : 'Low',
          status: 'Not Started',
          progress: 0,
          marks: record.marks,
          formats: draft.formats?.length ? draft.formats : ['PDF'],
          description: draft.description || 'No description provided.',
          instructions: (draft.instructions || '').split('\n').filter(Boolean),
          isNew: true,
        },
        ...prev,
      ])
      setNotifications((prev) => ({
        ...prev,
        student: [
          {
            id: nextId('n'),
            level: 'info',
            title: `New assignment: ${record.title}`,
            body: `${record.subject} · estimated ${record.estimatedHours} hours · due ${record.deadline}.`,
            time: 'Just now',
            unread: true,
          },
          ...prev.student,
        ],
      }))
    }
    return record
  }, [])

  const markNotificationRead = useCallback((scope, id) => {
    setNotifications((prev) => ({
      ...prev,
      [scope]: prev[scope].map((n) => (n.id === id ? { ...n, unread: false } : n)),
    }))
  }, [])

  const markAllRead = useCallback((scope) => {
    setNotifications((prev) => ({ ...prev, [scope]: prev[scope].map((n) => ({ ...n, unread: false })) }))
  }, [])

  const value = useMemo(
    () => ({
      role,
      setRole,
      toast,
      showToast,
      assignments,
      updateAssignment,
      submitAssignment,
      availability,
      addSlot,
      updateSlot,
      removeSlot,
      toggleDayUnavailable,
      exceptions,
      setException,
      teacherAssignments,
      createAssignment,
      notifications,
      markNotificationRead,
      markAllRead,
    }),
    [
      role, toast, showToast, assignments, updateAssignment, submitAssignment, availability,
      addSlot, updateSlot, removeSlot, toggleDayUnavailable, exceptions, setException,
      teacherAssignments, createAssignment, notifications, markNotificationRead, markAllRead,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
