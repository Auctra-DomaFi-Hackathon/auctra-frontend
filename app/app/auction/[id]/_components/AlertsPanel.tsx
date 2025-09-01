'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'

type Alerts = {
  outbid: boolean
  fiveMinutes: boolean
  revealStart: boolean
}

export default function AlertsPanel({
  isSealed,
  alerts,
  setAlerts,
}: {
  isSealed: boolean
  alerts: Alerts
  setAlerts: React.Dispatch<React.SetStateAction<Alerts>>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Row
            label="Notify when outbid"
            active={alerts.outbid}
            onToggle={() => setAlerts(prev => ({ ...prev, outbid: !prev.outbid }))}
          />
          <Row
            label="5 minutes before end"
            active={alerts.fiveMinutes}
            onToggle={() => setAlerts(prev => ({ ...prev, fiveMinutes: !prev.fiveMinutes }))}
          />
          {isSealed && (
            <Row
              label="Reveal phase starts"
              active={alerts.revealStart}
              onToggle={() => setAlerts(prev => ({ ...prev, revealStart: !prev.revealStart }))}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Row({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <Button variant="ghost" size="sm" onClick={onToggle}>
        {active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      </Button>
    </div>
  )
}
