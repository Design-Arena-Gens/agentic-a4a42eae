import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  PhoneCall,
  Play,
  Pause,
  Check,
  X,
  CalendarPlus,
  CircleAlert
} from "lucide-react";
import { useCallStore, CallRecord } from "@/store/useCallStore";
import { formatDateTime, statusColor, capitalize } from "@/lib/utils";

const statusLabel: Record<CallRecord["status"], string> = {
  "in-progress": "In progress",
  completed: "Completed",
  "no-show": "No show",
  scheduled: "Scheduled"
};

const defaultCallForm = () => ({
  customerId: "",
  objective: "",
  scheduledAt: "",
  channel: "video" as CallRecord["channel"],
  priority: "medium" as CallRecord["priority"],
  scriptId: undefined as string | undefined,
  workflowId: undefined as string | undefined,
  nextStep: ""
});

export function CallControlCenter() {
  const {
    calls,
    customers,
    scripts,
    workflows,
    activeCallId,
    scheduleCall,
    updateCallStatus,
    setActiveCall,
    logCallOutcome,
    assignScriptToCall
  } = useCallStore();
  const [form, setForm] = useState(defaultCallForm);
  const [summary, setSummary] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [sentiment, setSentiment] = useState<CallRecord["sentiment"]>("positive");
  const [nextStep, setNextStep] = useState("");

  const upcomingCalls = useMemo(
    () =>
      calls
        .filter((call) => call.status === "scheduled")
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        ),
    [calls]
  );

  const activeCall = calls.find((call) => call.id === activeCallId) ?? upcomingCalls[0];

  const handleSchedule = () => {
    if (!form.customerId || !form.objective || !form.scheduledAt) return;
    scheduleCall({
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString()
    });
    setForm(defaultCallForm);
  };

  const handleAssignScript = (scriptId: string) => {
    if (activeCall) {
      assignScriptToCall(activeCall.id, scriptId);
    }
  };

  const currentCustomer = customers.find(
    (customer) => customer.id === activeCall?.customerId
  );
  const currentScript = scripts.find((script) => script.id === activeCall?.scriptId);

  return (
    <section className="card" aria-label="Call Control Center">
      <header className="toolbar">
        <div>
          <span className="tag">Live control</span>
          <h2 style={{ margin: "6px 0 0", fontSize: "1.5rem" }}>
            Command your freelance call pipeline
          </h2>
        </div>
        <button className="primary" onClick={() => setActiveCall(activeCall?.id)}>
          <PhoneCall size={18} style={{ marginRight: 8 }} />
          {activeCall ? "Resume active" : "Select call"}
        </button>
      </header>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1.2fr", gap: 28 }}>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12
            }}
          >
            <h3 style={{ margin: 0 }}>Queue</h3>
            <span className="pill">
              {upcomingCalls.length} scheduled •{" "}
              {calls.filter((call) => call.status === "completed").length} completed today
            </span>
          </div>
          <div className="list">
            {upcomingCalls.slice(0, 4).map((call) => {
              const customer = customers.find((item) => item.id === call.customerId);
              const script = scripts.find((item) => item.id === call.scriptId);
              return (
                <article
                  key={call.id}
                  className="list-item"
                  style={{
                    borderColor:
                      call.id === activeCall?.id
                        ? "rgba(99, 102, 241, 0.6)"
                        : "rgba(148, 163, 184, 0.25)",
                    cursor: "pointer"
                  }}
                  onClick={() => setActiveCall(call.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <strong>{customer?.name ?? "Customer"}</strong>
                      <span className="status">
                        <span
                          className="status-dot"
                          style={{ backgroundColor: statusColor(call.status) }}
                        />
                        {statusLabel[call.status]}
                      </span>
                    </div>
                    <p style={{ margin: "6px 0 0", color: "rgba(15,23,42,0.7)" }}>
                      {call.objective}
                    </p>
                    <footer
                      style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 12,
                        fontSize: "0.85rem",
                        color: "rgba(15,23,42,0.6)"
                      }}
                    >
                      <span>
                        {formatDistanceToNow(new Date(call.scheduledAt), {
                          addSuffix: true
                        })}
                      </span>
                      {customer?.company && <span>• {customer.company}</span>}
                      {script && <span className="badge">{script.title}</span>}
                    </footer>
                  </div>
                  <aside style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{ borderRadius: 999, padding: "10px 12px" }}
                      onClick={(event) => {
                        event.stopPropagation();
                        updateCallStatus(call.id, "in-progress");
                        setActiveCall(call.id);
                      }}
                    >
                      <Play size={16} />
                    </button>
                    <button
                      style={{ borderRadius: 999, padding: "10px 12px" }}
                      onClick={(event) => {
                        event.stopPropagation();
                        updateCallStatus(call.id, "no-show");
                      }}
                    >
                      <X size={16} />
                    </button>
                  </aside>
                </article>
              );
            })}
            {upcomingCalls.length === 0 && (
              <div className="list-item">
                <CircleAlert size={20} />
                <div>
                  <strong>No calls queued</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
                    Schedule a new conversation to keep your freelance funnel hot.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="card" style={{ backgroundColor: "rgba(93, 95, 239, 0.1)" }}>
          <h3 style={{ marginTop: 0 }}>Schedule a call</h3>
          <div className="grid" style={{ gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Customer</span>
              <select
                value={form.customerId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, customerId: event.target.value }))
                }
              >
                <option value="" disabled>
                  Select customer
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} • {customer.company}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Objective</span>
              <input
                placeholder="What are you driving toward?"
                value={form.objective}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, objective: event.target.value }))
                }
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Schedule</span>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))
                }
              />
            </label>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, 1fr)" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Channel</span>
                <select
                  value={form.channel}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      channel: event.target.value as CallRecord["channel"]
                    }))
                  }
                >
                  <option value="video">Video</option>
                  <option value="phone">Phone</option>
                  <option value="voip">VoIP</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      priority: event.target.value as CallRecord["priority"]
                    }))
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Assign workflow</span>
              <select
                value={form.workflowId ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    workflowId: event.target.value || undefined
                  }))
                }
              >
                <option value="">No automation</option>
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Assign script</span>
              <select
                value={form.scriptId ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    scriptId: event.target.value || undefined
                  }))
                }
              >
                <option value="">Select script</option>
                {scripts.map((script) => (
                  <option key={script.id} value={script.id}>
                    {script.title}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Next best action</span>
              <input
                placeholder="Send recap, share ROI sheet…"
                value={form.nextStep}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nextStep: event.target.value }))
                }
              />
            </label>
            <button className="primary" onClick={handleSchedule}>
              <CalendarPlus size={18} style={{ marginRight: 8 }} />
              Schedule call
            </button>
          </div>
        </aside>
      </div>

      {activeCall && (
        <div
          style={{
            marginTop: 32,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)",
            gap: 28
          }}
        >
          <article className="card">
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Active call cockpit</h3>
                <p style={{ margin: "6px 0 0", color: "rgba(15,23,42,0.65)" }}>
                  {currentCustomer?.name} • {formatDateTime(activeCall.scheduledAt)}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="primary"
                  onClick={() => updateCallStatus(activeCall.id, "in-progress")}
                >
                  <Play size={16} style={{ marginRight: 6 }} />
                  Start call
                </button>
                <button onClick={() => updateCallStatus(activeCall.id, "scheduled")}>
                  <Pause size={16} style={{ marginRight: 6 }} />
                  Pause
                </button>
                <button onClick={() => updateCallStatus(activeCall.id, "completed")}>
                  <Check size={16} style={{ marginRight: 6 }} />
                  Complete
                </button>
              </div>
            </header>

            <div className="grid" style={{ marginTop: 20, gap: 16 }}>
              <div className="card" style={{ background: "rgba(20, 184, 166, 0.08)" }}>
                <h4 style={{ marginTop: 0 }}>Context snapshot</h4>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>
                    Persona: <strong>{currentScript?.persona ?? "TBD"}</strong>
                  </li>
                  <li>
                    Goal: <strong>{activeCall.objective}</strong>
                  </li>
                  <li>
                    Workflow:{" "}
                    <strong>
                      {workflows.find((workflow) => workflow.id === activeCall.workflowId)
                        ?.name ?? "Manual follow-up"}
                    </strong>
                  </li>
                  {activeCall.nextStep && (
                    <li>
                      Next action: <strong>{activeCall.nextStep}</strong>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 style={{ margin: "16px 0 8px" }}>Assign script</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {scripts.map((script) => (
                    <button
                      key={script.id}
                      onClick={() => handleAssignScript(script.id)}
                      style={{
                        borderRadius: 999,
                        padding: "10px 18px",
                        border:
                          activeCall.scriptId === script.id
                            ? "2px solid rgba(99,102,241,0.8)"
                            : "1px solid rgba(148,163,184,0.6)",
                        backgroundColor:
                          activeCall.scriptId === script.id
                            ? "rgba(99,102,241,0.14)"
                            : "rgba(255,255,255,0.9)"
                      }}
                    >
                      {script.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="card">
            <h3 style={{ marginTop: 0 }}>Post-call intelligence</h3>
            <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <span>Outcome summary</span>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                rows={4}
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  padding: 12,
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
                placeholder="Capture decisions, blockers, and momentum..."
              />
            </label>
            <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <span>Sentiment pulse</span>
              <div style={{ display: "flex", gap: 10 }}>
                {(["positive", "neutral", "negative"] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setSentiment(value)}
                    style={{
                      borderRadius: 12,
                      padding: "10px 16px",
                      border:
                        sentiment === value
                          ? "2px solid rgba(16,185,129,0.8)"
                          : "1px solid rgba(148,163,184,0.3)",
                      backgroundColor:
                        sentiment === value
                          ? "rgba(16,185,129,0.18)"
                          : "rgba(255,255,255,0.9)"
                    }}
                  >
                    {capitalize(value)}
                  </button>
                ))}
              </div>
            </label>
            <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <span>Next step</span>
              <input
                value={nextStep}
                onChange={(event) => setNextStep(event.target.value)}
                placeholder="Send pilot package, align with technical buyer..."
              />
            </label>
            <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <span>Follow-up date (optional)</span>
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={(event) => setFollowUpDate(event.target.value)}
              />
            </label>
            <button
              className="primary"
              onClick={() => {
                if (!summary) return;
                logCallOutcome(activeCall.id, {
                  summary,
                  sentiment,
                  nextStep,
                  followUpDate: followUpDate
                    ? new Date(followUpDate).toISOString()
                    : undefined
                });
                setSummary("");
                setNextStep("");
                setFollowUpDate("");
                setSentiment("positive");
              }}
            >
              <Check size={16} style={{ marginRight: 6 }} />
              Log outcome
            </button>
          </article>
        </div>
      )}
    </section>
  );
}
