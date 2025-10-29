import { useMemo, useState } from "react";
import { Edit3, Plus, Sparkles, AlignLeft } from "lucide-react";
import { useCallStore, ScriptSegment } from "@/store/useCallStore";
import { formatDateTime, capitalize, generateId } from "@/lib/utils";

const defaultScriptForm = () => ({
  title: "",
  persona: "",
  objective: "",
  tags: ""
});

export function ScriptWorkbench() {
  const { scripts, addScript, updateScriptSegment, addScriptSegment } = useCallStore();
  const [activeScriptId, setActiveScriptId] = useState(scripts.at(0)?.id);
  const [segmentDraft, setSegmentDraft] = useState("");
  const [segmentTitle, setSegmentTitle] = useState("Custom cue");
  const [form, setForm] = useState(defaultScriptForm);
  const [personaFilter, setPersonaFilter] = useState("all");

  const filteredScripts = useMemo(() => {
    if (personaFilter === "all") return scripts;
    return scripts.filter(
      (script) => script.persona.toLowerCase() === personaFilter.toLowerCase()
    );
  }, [personaFilter, scripts]);

  const activeScript =
    filteredScripts.find((script) => script.id === activeScriptId) ??
    filteredScripts.at(0);

  const personaOptions = Array.from(
    new Set(scripts.map((script) => script.persona.toLowerCase()))
  );

  const handleAddScript = () => {
    if (!form.title || !form.persona || !form.objective) return;
    addScript({
      title: form.title,
      persona: form.persona,
      objective: form.objective,
      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      segments: [
        {
          id: generateId(),
          title: "Opening",
          content:
            "Hey {first_name}, appreciate you carving out time. I build freelance GTM agents that act like a full-time SDR in 8 days."
        }
      ]
    });
    setForm(defaultScriptForm);
  };

  const handleSegmentUpdate = (segment: ScriptSegment, content: string) => {
    updateScriptSegment(activeScript!.id, {
      ...segment,
      content
    });
  };

  const handleAddSegment = () => {
    if (!segmentDraft || !segmentTitle || !activeScript) return;
    addScriptSegment(activeScript.id, {
      title: segmentTitle,
      content: segmentDraft
    });
    setSegmentDraft("");
    setSegmentTitle("Custom cue");
  };

  return (
    <section className="card" aria-label="Script Workbench">
      <header className="toolbar">
        <div>
          <span className="tag">Talk track</span>
          <h2 style={{ margin: "6px 0 0", fontSize: "1.5rem" }}>Script workbench</h2>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <select
            value={personaFilter}
            onChange={(event) => setPersonaFilter(event.target.value)}
          >
            <option value="all">All personas</option>
            {personaOptions.map((persona) => (
              <option key={persona} value={persona}>
                {capitalize(persona)}
              </option>
            ))}
          </select>
          <button
            className="primary"
            onClick={() => setActiveScriptId(filteredScripts.at(0)?.id)}
          >
            <Sparkles size={18} style={{ marginRight: 8 }} />
            Use top script
          </button>
        </div>
      </header>

      <div
        className="grid"
        style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)", gap: 28 }}
      >
        <article className="card">
          <header style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <AlignLeft size={22} />
            <div>
              <h3 style={{ margin: 0 }}>{activeScript?.title ?? "No script selected"}</h3>
              {activeScript && (
                <p style={{ margin: "6px 0 0", color: "rgba(15,23,42,0.65)" }}>
                  Persona: <strong>{activeScript.persona}</strong> • Updated{" "}
                  {formatDateTime(activeScript.lastUpdated)}
                </p>
              )}
            </div>
          </header>

          {activeScript ? (
            <div className="grid" style={{ gap: 18, marginTop: 18 }}>
              {activeScript.segments.map((segment) => (
                <section key={segment.id} className="card">
                  <header
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <strong>{segment.title}</strong>
                    <span className="pill">{segment.cues?.length ?? 0} cues</span>
                  </header>
                  <textarea
                    value={segment.content}
                    onChange={(event) => handleSegmentUpdate(segment, event.target.value)}
                    rows={4}
                    style={{
                      marginTop: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(148, 163, 184, 0.4)",
                      padding: 14,
                      fontFamily: "inherit",
                      background: "rgba(255,255,255,0.9)"
                    }}
                  />
                </section>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: 32 }}>
              Filter produced no scripts. Create a playbook to guide your freelance agent.
            </p>
          )}
        </article>

        <aside className="card" style={{ backgroundColor: "rgba(99, 102, 241, 0.08)" }}>
          <h3 style={{ marginTop: 0 }}>New script</h3>
          <div className="grid" style={{ gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Title</span>
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Persona</span>
              <input
                value={form.persona}
                onChange={(event) => setForm((prev) => ({ ...prev, persona: event.target.value }))}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Objective</span>
              <textarea
                rows={3}
                value={form.objective}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, objective: event.target.value }))
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
              <span>Tags</span>
              <input
                placeholder="Discovery, PLG, outbound…"
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
              />
            </label>
            <button className="primary" onClick={handleAddScript}>
              <Plus size={18} style={{ marginRight: 8 }} />
              Create script
            </button>
          </div>

          {activeScript && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ margin: "0 0 12px" }}>Append segment</h4>
              <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                <span>Segment title</span>
                <input
                  value={segmentTitle}
                  onChange={(event) => setSegmentTitle(event.target.value)}
                />
              </label>
              <textarea
                rows={4}
                value={segmentDraft}
                onChange={(event) => setSegmentDraft(event.target.value)}
                placeholder="Drop in objection handling, transition, or CTA..."
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  padding: 12,
                  fontFamily: "inherit",
                  backgroundColor: "rgba(255,255,255,0.9)"
                }}
              />
              <button
                style={{ marginTop: 12, borderRadius: 12, padding: "10px 16px" }}
                onClick={handleAddSegment}
              >
                <Edit3 size={16} style={{ marginRight: 6 }} />
                Save segment
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
