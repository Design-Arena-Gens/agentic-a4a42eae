import { useMemo } from "react";
import { TrendingUp, Flame, Clock3, Target, NotebookPen } from "lucide-react";
import { useCallStore, TimelineNote } from "@/store/useCallStore";
import { describeNote } from "@/store/useCallStore";
import { formatDateTime } from "@/lib/utils";

const sentimentShade: Record<TimelineNote["sentiment"], string> = {
  positive: "rgba(34, 197, 94, 0.18)",
  neutral: "rgba(148, 163, 184, 0.22)",
  negative: "rgba(248, 113, 113, 0.18)"
};

export function InsightsPanel() {
  const { metrics, notes, calls, customers } = useCallStore();

  const scorecards = [
    {
      label: "Conversion rate",
      value: `${Math.round(metrics.conversionRate * 100)}%`,
      icon: <TrendingUp size={20} />,
      helper: "Momentum on meetings turning into wins.",
      progress: metrics.conversionRate
    },
    {
      label: "Meetings booked",
      value: metrics.meetingsBooked.toString(),
      icon: <Flame size={20} />,
      helper: "Warm conversations scheduled this week.",
      progress: Math.min(1, metrics.meetingsBooked / 20)
    },
    {
      label: "Avg. handle time",
      value: `${metrics.avgHandleTime}m`,
      icon: <Clock3 size={20} />,
      helper: "Average talk time across completed calls.",
      progress: Math.min(1, metrics.avgHandleTime / 30)
    },
    {
      label: "Pipeline value",
      value: `$${(metrics.pipelineValue / 1000).toFixed(1)}k`,
      icon: <Target size={20} />,
      helper: "Total potential revenue tied to active accounts.",
      progress: Math.min(1, metrics.pipelineValue / 90000)
    }
  ];

  const upcomingFollowUps = useMemo(
    () =>
      calls
        .filter((call) => Boolean(call.followUpDate))
        .sort(
          (a, b) =>
            new Date(a.followUpDate ?? 0).getTime() -
            new Date(b.followUpDate ?? 0).getTime()
        )
        .slice(0, 4),
    [calls]
  );

  return (
    <section className="card" aria-label="Insights & Intelligence">
      <header className="toolbar">
        <div>
          <span className="tag">Intelligence</span>
          <h2 style={{ margin: "6px 0 0" }}>Insights cockpit</h2>
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {scorecards.map((item) => (
          <article key={item.label} className="card" style={{ padding: 20 }}>
            <header style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {item.icon}
              <span style={{ fontWeight: 600 }}>{item.label}</span>
            </header>
            <h3 style={{ margin: "12px 0 6px", fontSize: "1.8rem" }}>{item.value}</h3>
            <p style={{ margin: 0, color: "rgba(15,23,42,0.6)", fontSize: "0.85rem" }}>
              {item.helper}
            </p>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${Math.min(100, Math.round(item.progress * 100))}%` }}
              />
            </div>
          </article>
        ))}
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 26,
          marginTop: 24
        }}
      >
        <article className="card">
          <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotebookPen size={20} />
            <h3 style={{ margin: 0 }}>Engagement timeline</h3>
          </header>
          <div className="list" style={{ marginTop: 16 }}>
            {notes.slice(0, 5).map((note) => {
              const customer = customers.find((item) => item.id === note.customerId);
              return (
                <div
                  key={note.id}
                  className="list-item"
                  style={{ backgroundColor: sentimentShade[note.sentiment] }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{customer?.name ?? "Unknown contact"}</strong>
                    <p style={{ margin: "4px 0 6px" }}>{note.content}</p>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "rgba(15,23,42,0.6)",
                        letterSpacing: "0.01em"
                      }}
                    >
                      {describeNote(note)}
                    </span>
                  </div>
                  <div>
                    <span className="badge">{note.owner}</span>
                  </div>
                </div>
              );
            })}
            {notes.length === 0 && <p>No notes logged yet. Capture insights post-call.</p>}
          </div>
        </article>

        <aside className="card" style={{ backgroundColor: "rgba(239, 246, 255, 0.6)" }}>
          <h3 style={{ marginTop: 0 }}>Follow-ups to protect</h3>
          <div className="list">
            {upcomingFollowUps.map((call) => {
              const customer = customers.find((item) => item.id === call.customerId);
              return (
                <div key={call.id} className="list-item">
                  <div>
                    <strong>{customer?.name ?? "Prospect"}</strong>
                    <p style={{ margin: "6px 0 0" }}>{call.nextStep ?? "Review notes"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="pill" style={{ marginBottom: 6, display: "inline-block" }}>
                      {formatDateTime(call.followUpDate!)}
                    </span>
                    <div style={{ fontSize: "0.8rem", color: "rgba(15,23,42,0.6)" }}>
                      Status • {call.status}
                    </div>
                  </div>
                </div>
              );
            })}
            {upcomingFollowUps.length === 0 && (
              <p style={{ margin: 0 }}>No follow-ups scheduled — build compounding trust.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
