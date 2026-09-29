import { useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import { Card, PageHeader, Tabs, EmptyState } from '../../components/ui'
import { NotificationItem } from '../../components/cards'
import { useApp } from '../../context/AppContext'

export default function NotificationsPage({ scope, subtitle }) {
  const { notifications, markNotificationRead, markAllRead, showToast } = useApp()
  const [tab, setTab] = useState('All')

  const list = notifications[scope] || []
  const unread = list.filter((n) => n.unread)
  const rows = tab === 'Unread' ? unread : tab === 'Alerts' ? list.filter((n) => n.level === 'risk' || n.level === 'warn') : list

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={subtitle}
        actions={
          <button
            className="btn btn-secondary btn-md"
            disabled={!unread.length}
            onClick={() => { markAllRead(scope); showToast('All notifications marked as read', 'info') }}
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        }
      />

      <Card className="card-pad">
        <Tabs
          tabs={[
            { key: 'All', label: 'All', count: list.length },
            { key: 'Unread', label: 'Unread', count: unread.length },
            { key: 'Alerts', label: 'Alerts', count: list.filter((n) => n.level === 'risk' || n.level === 'warn').length },
          ]}
          active={tab}
          onChange={setTab}
        />

        {rows.length ? (
          <div className="mt-5 space-y-3">
            {rows.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={(id) => markNotificationRead(scope, id)} />
            ))}
          </div>
        ) : (
          <EmptyState
            animation={tab === 'Unread' ? '/animations/check.json' : '/animations/search.json'}
            title={tab === 'Unread' ? 'You are all caught up' : 'No notifications'}
            message="Workload alerts, deadline reminders and submission updates will appear here."
          />
        )}
      </Card>
    </>
  )
}
