import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Layers, Gauge, Users, Mail } from 'lucide-react'
import {
  Card, PageHeader, StatCard, Badge, StatusBadge, EmptyState, Avatar, WorkloadBadge, SectionHeader,
} from '../../components/ui'
import { AIInsightCard } from '../../components/cards'
import { ChartCard, Columns, CapacityIndicator, PALETTE } from '../../components/charts'
import { students, workloadLevel, studentAssignmentHistory, studentWorkloadTimeline } from '../../data/students'
import { useApp } from '../../context/AppContext'

export default function TeacherStudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useApp()
  const student = students.find((s) => s.id === id)

  if (!student) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Student not found"
          message="This student is not part of the demo roster."
          action={<Link to="/teacher/students" className="btn btn-primary btn-md">Back to students</Link>}
        />
      </Card>
    )
  }

  const level = workloadLevel(student.workload)
  const available = 18
  const pending = 14
  const remaining = available - pending

  return (
    <>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4 -ml-2">
        <ArrowLeft size={15} /> Back to students
      </button>

      <Card className="card-pad mb-5">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar initials={student.initials} name={student.name} size="lg" tone={level === 'high' ? 'violet' : 'brand'} />
            <div>
              <h1 className="text-[22px] font-extrabold tracking-tight text-ink">{student.name}</h1>
              <p className="mt-1 text-[14px] text-ink-muted">{student.department} · {student.className}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-muted">
                <Mail size={13} /> {student.email} · {student.rollNo}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <WorkloadBadge level={level} />
            <button className="btn btn-secondary btn-md" onClick={() => showToast('Message simulated — no delivery in this prototype', 'info')}>
              Message student
            </button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <Card className="card-pad flex flex-col items-center justify-center lg:w-[280px]">
          <p className="text-[13px] font-semibold text-ink-muted">Current workload</p>
          <CapacityIndicator value={student.workload} label={`${level} workload`} size={175} />
          <p className="mt-2 text-center text-[13px] text-ink-muted">Completion rate {student.completionRate}%</p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Available time" value={`${available} hours`} sub="Declared this week" icon={Clock} tone="info" />
          <StatCard label="Pending work" value={`${pending} hours`} sub={`${student.assignmentsPending} assignments`} icon={Layers} tone="violet" />
          <StatCard
            label="Remaining capacity"
            value={`${remaining} hours`}
            sub={remaining > 0 ? 'Before overload' : 'Over capacity'}
            icon={Gauge}
            tone={remaining >= 4 ? 'safe' : remaining > 0 ? 'warn' : 'risk'}
          />
          <div className="sm:col-span-3">
            <ChartCard title="Workload timeline" subtitle="Hours of committed work per day this week">
              <Columns
                data={studentWorkloadTimeline.map((d) => ({ label: d.day.slice(0, 3), value: d.hours }))}
                height={170}
                unit=" h"
                color={PALETTE.primary}
              />
            </ChartCard>
          </div>
        </div>
      </div>

      <Card className="mt-5">
        <div className="p-5 pb-4">
          <SectionHeader title="Assignment history" subtitle="Across every subject, not just yours" />
        </div>
        <div className="table-wrap">
          <table className="w-full min-w-[760px]">
            <thead className="border-y border-slate-100 bg-slate-50/60">
              <tr>
                <th className="th">Assignment</th>
                <th className="th">Subject</th>
                <th className="th">Deadline</th>
                <th className="th">Status</th>
                <th className="th">Submission</th>
                <th className="th">Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentAssignmentHistory.map((h) => (
                <tr key={h.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="td font-semibold text-ink">{h.assignment}</td>
                  <td className="td">{h.subject}</td>
                  <td className="td">{h.deadline}</td>
                  <td className="td"><StatusBadge status={h.status} /></td>
                  <td className="td">{h.submission}</td>
                  <td className="td font-semibold text-ink">{h.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AIInsightCard
        className="mt-5"
        title="Capacity note"
        body={`${student.name.split(' ')[0]} has ${student.availableHours} hours of declared availability against ${student.existingHours} hours of pending work across all subjects. A further ${(student.availableHours - student.existingHours).toFixed(1)} hours can be absorbed before the schedule tips into overload.`}
        footnote="Aggregated from declared availability. Individual reasons for unavailability are never shared."
      />
    </>
  )
}
