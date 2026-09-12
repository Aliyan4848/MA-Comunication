import { Check, Package, ClipboardCheck, Cog, Boxes, Truck, MapPin, Home, XCircle } from "lucide-react"

const STEPS = [
  { key: "pending", label: "Order Placed", icon: ClipboardCheck },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "processing", label: "Processing", icon: Cog },
  { key: "packed", label: "Packed", icon: Boxes },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: Home },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function OrderTimeline({
  status, history, trackingEvents,
}: {
  status: string
  history: { from_status: string | null; to_status: string; created_at: string }[]
  trackingEvents?: { status_raw: string; description: string; event_time: string }[]
}) {
  if (status === "cancelled") {
    const cancelledAt = history.find(h => h.to_status === "cancelled")?.created_at
    return (
      <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
        <XCircle size={18} className="text-red-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-[var(--ma-foreground)]">Order Cancelled</p>
          {cancelledAt && <p className="text-xs text-[var(--ma-muted)]">{fmtDate(cancelledAt)}</p>}
        </div>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex(s => s.key === status)
  const dateFor = (key: string) => history.find(h => h.to_status === key)?.created_at

  return (
    <div>
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const done = i <= currentIdx
          const isLast = i === STEPS.length - 1
          const date = dateFor(step.key)
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative min-w-0">
              {!isLast && (
                <div
                  className="absolute top-4 left-1/2 w-full h-[2px]"
                  style={{ background: i < currentIdx ? "#2B8EF0" : "var(--ma-border)" }}
                />
              )}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0"
                style={{
                  background: done ? "#2B8EF0" : "var(--ma-card)",
                  border: done ? "none" : "1px solid var(--ma-border)",
                }}
              >
                <Icon size={14} className={done ? "text-white" : "text-[var(--ma-muted)]"} />
              </div>
              <p className={`text-[10px] sm:text-xs mt-2 text-center leading-tight ${done ? "text-[var(--ma-foreground)] font-medium" : "text-[var(--ma-muted)]"}`}>
                {step.label}
              </p>
              {date && <p className="text-[9px] text-[var(--ma-muted)] mt-0.5 hidden sm:block">{fmtDate(date)}</p>}
            </div>
          )
        })}
      </div>

      {trackingEvents && trackingEvents.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[var(--ma-border)]">
          <p className="text-xs text-[var(--ma-muted)] mb-3 uppercase tracking-wide flex items-center gap-1.5">
            <Package size={12} /> Latest Updates
          </p>
          <div className="space-y-2.5">
            {[...trackingEvents].reverse().map((e, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[var(--ma-foreground)]">{e.description || e.status_raw}</span>
                <span className="text-[var(--ma-muted)] text-xs shrink-0 ml-3">{fmtDate(e.event_time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
