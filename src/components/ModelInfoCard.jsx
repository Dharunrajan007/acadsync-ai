import { useEffect, useState } from 'react'
import { Cpu, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { Card, SectionHeader, Badge, InlineAlert } from './ui'
import { getModelInfo } from '../services/api'

/**
 * Phase 13 — model monitoring.
 *
 * Every number here is read from the metrics file the training scripts write.
 * Nothing is hard-coded, so what the UI claims is what was actually measured on
 * the held-out split. If the backend is down the card says so rather than
 * showing stale or invented figures.
 */
export default function ModelInfoCard() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })

  useEffect(() => {
    let cancelled = false
    getModelInfo().then((result) => {
      if (cancelled) return
      setState(
        result.ok
          ? { status: 'ready', data: result.data, error: null }
          : { status: 'offline', data: null, error: result.error }
      )
    })
    return () => { cancelled = true }
  }, [])

  if (state.status === 'loading') {
    return (
      <Card className="card-pad">
        <SectionHeader title="Model information" />
        <div className="mt-5 flex items-center gap-2.5 text-[14px] text-ink-muted">
          <Loader2 size={16} className="animate-spin" aria-hidden />
          Reading measured metrics from the prediction service…
        </div>
      </Card>
    )
  }

  if (state.status === 'offline') {
    return (
      <Card className="card-pad">
        <SectionHeader title="Model information" />
        <InlineAlert tone="warn" title="Prediction service unavailable" className="mt-5">
          {state.error}. Start the backend with{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px]">
            uvicorn app.main:app --port 8000
          </code>{' '}
          to see the measured model metrics. No figures are shown here rather than stale ones.
        </InlineAlert>
      </Card>
    )
  }

  const { completion_model: completion, deadline_model: deadline, disclaimer } = state.data

  return (
    <Card className="card-pad">
      <SectionHeader
        title="Model information"
        subtitle="Measured on a held-out 20% test split during the last training run"
        action={<Badge tone="violet" icon={Cpu}>Live from service</Badge>}
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {completion && (
          <ModelPanel
            name="Completion time"
            type={completion.model_type}
            task="Regression"
            rows={[
              ['MAE', `${completion.metrics.mae} h`],
              ['RMSE', `${completion.metrics.rmse} h`],
              ['R²', completion.metrics.r2],
            ]}
            footer={
              completion.baselines?.teacher_estimate && (
                <>
                  Teacher estimate alone scores MAE {completion.baselines.teacher_estimate.mae} h —
                  the model is{' '}
                  <strong className="font-bold text-ink">
                    {Math.round((1 - completion.metrics.mae / completion.baselines.teacher_estimate.mae) * 100)}%
                  </strong>{' '}
                  closer.
                </>
              )
            }
          />
        )}

        {deadline && (
          <ModelPanel
            name="Deadline risk"
            type={deadline.model_type}
            task="Binary classification"
            rows={[
              ['Accuracy', deadline.metrics.accuracy],
              ['Precision', deadline.metrics.precision],
              ['Recall', deadline.metrics.recall],
              ['F1 score', deadline.metrics.f1],
              ['ROC-AUC', deadline.metrics.roc_auc],
            ]}
            footer={
              <>
                Majority-class accuracy is {deadline.majority_class_accuracy} — accuracy alone would be
                misleading here, so selection used F1 on the late class.
              </>
            }
          />
        )}
      </div>

      <InlineAlert tone="warn" title="Trained on synthetic data" className="mt-5">
        {disclaimer}
      </InlineAlert>
    </Card>
  )
}

function ModelPanel({ name, type, task, rows, footer }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-ink">{name}</p>
          <p className="mt-0.5 text-[12px] text-ink-muted">{task}</p>
        </div>
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-safe" aria-hidden />
      </div>

      <p className="mt-2.5 inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] font-semibold text-ink-soft">
        {type}
      </p>

      <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="text-[12.5px] font-semibold text-ink-muted">{label}</dt>
            <dd className="tnum text-[13px] font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {footer && <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">{footer}</p>}
    </div>
  )
}
