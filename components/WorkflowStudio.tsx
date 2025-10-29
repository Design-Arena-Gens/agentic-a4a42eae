import { useMemo, useState } from "react";
import { WorkflowStage, useCallStore } from "@/store/useCallStore";
import {
  Workflow,
  PlayCircle,
  PauseCircle,
  PlusCircle,
  Layers,
  CheckCircle2
} from "lucide-react";
import { capitalize, generateId } from "@/lib/utils";

const stagePalette: Record<WorkflowStage, string> = {
  research: "#38bdf8",
  outreach: "#6366f1",
  call: "#ec4899",
  "follow-up": "#22c55e",
  handoff: "#f59e0b"
};

const defaultWorkflowForm = () => ({
  name: "",
  goal: "",
  persona: "",
  trigger: "",
  successCriteria: ""
});

export function WorkflowStudio() {
  const { workflows, toggleWorkflow, addWorkflowStep, addWorkflow } = useCallStore();
  const [activeWorkflowId, setActiveWorkflowId] = useState(workflows.at(0)?.id);
  const [form, setForm] = useState(defaultWorkflowForm);
  const [stepDraft, setStepDraft] = useState({
    title: "",
    stage: "call" as WorkflowStage,
    instructions: "",
    delayMinutes: 30,
    automation: ""
  });

  const activeWorkflow =
    workflows.find((workflow) => workflow.id === activeWorkflowId) ?? workflows.at(0);

  const usageStats = useMemo(() => {
    const active = workflows.filter((workflow) => workflow.active).length;
    const coverage = active ? Math.round((active / Math.max(1, workflows.length)) * 100) : 0;
    return { active, coverage };
  }, [workflows]);

  const handleCreateWorkflow = () => {
    if (!form.name || !form.goal || !form.trigger) return;
    addWorkflow({
      ...form,
      steps: [
        {
          id: generateId(),
          title: "Kick-off",
          stage: "outreach",
          delayMinutes: 0,
          instructions: "Personalize outreach intro and confirm agenda for call."
        }
      ]
    });
    setForm(defaultWorkflowForm);
  };

  const handleAddStep = () => {
    if (!activeWorkflow || !stepDraft.title || !stepDraft.instructions) return;
    addWorkflowStep(activeWorkflow.id, {
      title: stepDraft.title,
      stage: stepDraft.stage,
      delayMinutes: stepDraft.delayMinutes,
      instructions: stepDraft.instructions,
      automation: stepDraft.automation || undefined
    });
    setStepDraft({
      title: "",
      stage: "call",
      instructions: "",
      delayMinutes: 30,
      automation: ""
    });
  };

  return (
    <section className="card" aria-label="Workflow Studio">
      <header className="toolbar">
        <div>
          <span className="tag">Automation</span>
          <h2 style={{ margin: "6px 0 0" }}>Workflow studio</h2>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <span className="pill">
            {usageStats.active} active • {usageStats.coverage}% coverage
          </span>
          <button
            className="primary"
            onClick={() => setActiveWorkflowId(workflows.find((w) => w.active)?.id)}
          >
            <Layers size={18} style={{ marginRight: 8 }} />
            Focus active flow
          </button>
        </div>
      </header>

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)", gap: 28 }}
      >
        <article className="card">
          <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Workflow size={22} />
            <div>
              <h3 style={{ margin: 0 }}>{activeWorkflow?.name ?? "No workflow"}</h3>
              {activeWorkflow && (
                <p style={{ margin: "6px 0 0", color: "rgba(15,23,42,0.65)" }}>
                  Trigger: <strong>{activeWorkflow.trigger}</strong> • Persona:{" "}
                  {activeWorkflow.persona || "General"}
                </p>
              )}
            </div>
          </header>

          <div className="list" style={{ marginTop: 18 }}>
            {activeWorkflow?.steps.map((step, index) => (
              <div key={step.id} className="list-item">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: stagePalette[step.stage],
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <header
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <strong>{step.title}</strong>
                    <span className="badge">{capitalize(step.stage)}</span>
                  </header>
                  <p style={{ margin: "6px 0", color: "rgba(15,23,42,0.7)" }}>
                    {step.instructions}
                  </p>
                  <footer
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: "0.85rem",
                      color: "rgba(15,23,42,0.6)"
                    }}
                  >
                    <span>Delay {step.delayMinutes} mins</span>
                    {step.automation && <span>• {step.automation}</span>}
                  </footer>
                </div>
              </div>
            ))}
            {!activeWorkflow && (
              <p style={{ margin: 0 }}>Create a workflow to automate your freelance agent.</p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            {activeWorkflow && (
              <>
                <button
                  onClick={() => toggleWorkflow(activeWorkflow.id, !activeWorkflow.active)}
                >
                  {activeWorkflow.active ? (
                    <>
                      <PauseCircle size={18} style={{ marginRight: 6 }} />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} style={{ marginRight: 6 }} />
                      Activate
                    </>
                  )}
                </button>
                <button className="primary" onClick={handleAddStep}>
                  <PlusCircle size={16} style={{ marginRight: 6 }} />
                  Add step
                </button>
              </>
            )}
          </div>
        </article>

        <aside className="card" style={{ backgroundColor: "rgba(20, 83, 45, 0.08)" }}>
          <h3 style={{ marginTop: 0 }}>New workflow</h3>
          <div className="grid" style={{ gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Goal</span>
              <input
                value={form.goal}
                onChange={(event) => setForm((prev) => ({ ...prev, goal: event.target.value }))}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Persona</span>
              <input
                value={form.persona}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, persona: event.target.value }))
                }
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Trigger</span>
              <input
                value={form.trigger}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, trigger: event.target.value }))
                }
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Success criteria</span>
              <input
                value={form.successCriteria}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, successCriteria: event.target.value }))
                }
              />
            </label>
            <button className="primary" onClick={handleCreateWorkflow}>
              <CheckCircle2 size={18} style={{ marginRight: 8 }} />
              Save workflow
            </button>
          </div>

          {activeWorkflow && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ margin: "0 0 12px" }}>Draft step</h4>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Title</span>
                <input
                  value={stepDraft.title}
                  onChange={(event) =>
                    setStepDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Stage</span>
                <select
                  value={stepDraft.stage}
                  onChange={(event) =>
                    setStepDraft((prev) => ({
                      ...prev,
                      stage: event.target.value as WorkflowStage
                    }))
                  }
                >
                  {(Object.keys(stagePalette) as WorkflowStage[]).map((stage) => (
                    <option key={stage} value={stage}>
                      {capitalize(stage)}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Delay minutes</span>
                <input
                  type="number"
                  min={0}
                  value={stepDraft.delayMinutes}
                  onChange={(event) =>
                    setStepDraft((prev) => ({
                      ...prev,
                      delayMinutes: Number(event.target.value)
                    }))
                  }
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Instructions</span>
                <textarea
                  rows={4}
                  value={stepDraft.instructions}
                  onChange={(event) =>
                    setStepDraft((prev) => ({ ...prev, instructions: event.target.value }))
                  }
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    padding: 12,
                    fontFamily: "inherit"
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>Automation (optional)</span>
                <input
                  value={stepDraft.automation}
                  onChange={(event) =>
                    setStepDraft((prev) => ({ ...prev, automation: event.target.value }))
                  }
                />
              </label>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
