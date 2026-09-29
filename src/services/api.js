// Client for the AcadSync AI backend (FastAPI, see /backend).
//
// The prototype must stay fully explorable with the backend switched off, so
// every call here is written to fail soft: callers get a clear {ok:false} and
// fall back to the local mock analysis rather than showing an error screen.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TIMEOUT_MS = 8000

async function request(path, { method = 'GET', body, timeout = TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      // Surface FastAPI's validation detail, which is genuinely useful in dev.
      let detail = `HTTP ${response.status}`
      try {
        const payload = await response.json()
        if (payload?.detail) detail = typeof payload.detail === 'string' ? payload.detail : JSON.stringify(payload.detail)
      } catch {
        /* response had no JSON body */
      }
      return { ok: false, error: detail }
    }

    return { ok: true, data: await response.json() }
  } catch (error) {
    const reason = error.name === 'AbortError' ? 'Request timed out' : 'Backend unreachable'
    return { ok: false, error: reason }
  } finally {
    clearTimeout(timer)
  }
}

/** Is the ML service up, and are both model artefacts loaded? */
export const checkHealth = () => request('/api/health', { timeout: 2500 })

/** Full hybrid analysis for one student. */
export const analyzeStudent = (assignment, student) =>
  request('/api/analyze/student', { method: 'POST', body: { assignment, student } })

/** Full hybrid analysis for a whole class. */
export const analyzeClass = (assignment, students) =>
  request('/api/analyze/class', { method: 'POST', body: { assignment, students } })

/** Measured metrics from the last training run — never hand-written figures. */
export const getModelInfo = () => request('/api/models/info')

// ---------------------------------------------------------------------------
// Adapters between the frontend's mock shapes and the API contract
// ---------------------------------------------------------------------------

/** Map a roster row from data/students.js onto the API's StudentData schema. */
export function toStudentPayload(student) {
  return {
    student_id: student.id,
    student_name: student.name,
    available_hours: student.availableHours,
    existing_pending_hours: student.existingHours,
    number_of_pending_assignments: student.assignmentsPending ?? 0,
    // completionRate is a percentage in the mock data; the model wants 0-1.
    previous_completion_rate: Math.min(1, Math.max(0, (student.completionRate ?? 85) / 100)),
    previous_late_submissions: student.lateSubmissions ?? 0,
    average_previous_completion_hours: student.averageCompletionHours ?? 2.0,
  }
}

/** Map the Create Assignment draft onto the API's AssignmentData schema. */
export function toAssignmentPayload(draft, hoursUntilDeadline = 24) {
  return {
    title: draft.title,
    subject: draft.subject,
    assignment_type: draft.assignmentType || 'Coding',
    difficulty: draft.difficulty,
    teacher_estimated_hours: Number(draft.estimatedHours) || 1,
    hours_until_deadline: hoursUntilDeadline,
  }
}

/**
 * Convert an API class analysis into the exact shape the existing capacity
 * screen already renders, so the UI itself needs no structural change.
 */
export function toAnalysisView(apiResult) {
  const levelFor = (status) =>
    status === 'HIGH RISK' ? 'insufficient' : status === 'MODERATE' ? 'moderate' : 'safe'

  const rows = apiResult.students.map((s) => ({
    id: s.student_id,
    name: s.student_name,
    initials: s.student_name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
    rollNo: s.student_id,
    availableHours: s.available_hours,
    existingHours: s.existing_workload,
    newHours: s.predicted_completion_hours,
    remaining: s.capacity_after_assignment,
    level: levelFor(s.overall_status),
    // ML-only fields the mock path cannot provide.
    predictedHours: s.predicted_completion_hours,
    teacherEstimate: s.teacher_estimated_hours,
    riskProbability: s.deadline_risk_probability,
    deadlineRisk: s.deadline_risk,
    recommendation: s.recommendation,
  }))

  return {
    rows,
    total: apiResult.total_students,
    safe: apiResult.safe_students,
    moderate: apiResult.moderate_students,
    insufficient: apiResult.high_risk_students,
    affected: rows.filter((r) => r.level !== 'safe'),
    statistics: apiResult.statistics,
    classRecommendation: apiResult.class_recommendation,
    source: 'ml',
  }
}
