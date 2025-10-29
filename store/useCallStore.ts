import { addMinutes, formatDistanceToNow } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { capitalize, generateId } from "@/lib/utils";

export type CallStatus = "scheduled" | "in-progress" | "completed" | "no-show";
export type WorkflowStage = "research" | "outreach" | "call" | "follow-up" | "handoff";

export interface ScriptSegment {
  id: string;
  title: string;
  content: string;
  cues?: string[];
}

export interface CallScript {
  id: string;
  title: string;
  persona: string;
  objective: string;
  segments: ScriptSegment[];
  lastUpdated: string;
  tags: string[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  company: string;
  role: string;
  timezone: string;
  phone: string;
  email: string;
  tags: string[];
  notes: string;
  accountValue: number;
}

export interface CallRecord {
  id: string;
  customerId: string;
  scriptId?: string;
  workflowId?: string;
  scheduledAt: string;
  status: CallStatus;
  objective: string;
  channel: "phone" | "video" | "voip";
  priority: "high" | "medium" | "low";
  durationMinutes?: number;
  outcome?: string;
  followUpDate?: string;
  sentiment?: "positive" | "neutral" | "negative";
  nextStep?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  stage: WorkflowStage;
  delayMinutes: number;
  instructions: string;
  automation?: string;
}

export interface Workflow {
  id: string;
  name: string;
  goal: string;
  persona: string;
  trigger: string;
  steps: WorkflowStep[];
  successCriteria: string;
  active: boolean;
}

export interface TimelineNote {
  id: string;
  callId?: string;
  customerId?: string;
  createdAt: string;
  category: "insight" | "objection" | "deal" | "task";
  sentiment: "positive" | "neutral" | "negative";
  content: string;
  owner: string;
}

interface Metrics {
  conversionRate: number;
  winRate: number;
  meetingsBooked: number;
  avgHandleTime: number;
  pipelineValue: number;
}

interface CallStoreState {
  calls: CallRecord[];
  customers: CustomerProfile[];
  scripts: CallScript[];
  workflows: Workflow[];
  notes: TimelineNote[];
  metrics: Metrics;
  activeCallId?: string;
  scheduleCall: (payload: Omit<CallRecord, "id" | "status">) => void;
  updateCallStatus: (callId: string, status: CallStatus) => void;
  setActiveCall: (callId?: string) => void;
  logCallOutcome: (
    callId: string,
    outcome: { summary: string; sentiment: CallRecord["sentiment"]; nextStep?: string; followUpDate?: string }
  ) => void;
  assignScriptToCall: (callId: string, scriptId: string) => void;
  addScript: (payload: Omit<CallScript, "id" | "lastUpdated">) => void;
  updateScriptSegment: (scriptId: string, segment: ScriptSegment) => void;
  addScriptSegment: (scriptId: string, segment: Omit<ScriptSegment, "id">) => void;
  addWorkflow: (payload: Omit<Workflow, "id" | "active">) => void;
  toggleWorkflow: (workflowId: string, active: boolean) => void;
  addWorkflowStep: (workflowId: string, step: Omit<WorkflowStep, "id">) => void;
  addCustomer: (payload: Omit<CustomerProfile, "id">) => void;
  addNote: (note: Omit<TimelineNote, "id" | "createdAt">) => void;
  refreshMetrics: () => void;
}

type StateData = Pick<
  CallStoreState,
  "calls" | "customers" | "scripts" | "workflows" | "notes" | "metrics" | "activeCallId"
>;

const randomOwner = () => {
  const owners = ["Avery", "Jordan", "Noah", "Riley"];
  return owners[Math.floor(Math.random() * owners.length)];
};

const initialState = (): StateData => {
  const scriptId = generateId();
  const workflowId = generateId();
  const callId = generateId();
  const customerId = generateId();
  return {
    calls: [
      {
        id: callId,
        customerId,
        scriptId,
        workflowId,
        scheduledAt: addMinutes(new Date(), 45).toISOString(),
        status: "scheduled",
        objective: "Demo the automation playbook and secure pilot commitment",
        channel: "video",
        priority: "high",
        nextStep: "Send tailored ROI calculator post-call"
      },
      {
        id: generateId(),
        customerId,
        scheduledAt: addMinutes(new Date(), -180).toISOString(),
        status: "completed",
        objective: "Discovery call - understand current lead routing process",
        channel: "phone",
        priority: "medium",
        durationMinutes: 32,
        outcome: "Identified manual routing bottlenecks and interest in automation",
        followUpDate: addMinutes(new Date(), 1440).toISOString(),
        sentiment: "positive"
      }
    ],
    customers: [
      {
        id: customerId,
        name: "Priya Desai",
        company: "LaunchLayer",
        role: "Head of Operations",
        timezone: "GMT+5:30",
        phone: "+91 98765 43210",
        email: "priya@launchlayer.com",
        tags: ["High intent", "Product-led growth"],
        notes: "Looking for an agent to pre-qualify inbound demo requests",
        accountValue: 18000
      },
      {
        id: generateId(),
        name: "Marcus Lee",
        company: "Orbit Labs",
        role: "Founder",
        timezone: "PST",
        phone: "+1 (415) 555-3030",
        email: "marcus@orbitlabs.ai",
        tags: ["Exploratory", "AI tools"],
        notes: "Interested in outbound sequences for beta launch",
        accountValue: 8400
      }
    ],
    scripts: [
      {
        id: scriptId,
        title: "Productized Discovery",
        persona: "Operations leadership",
        objective: "Uncover manual workflows that can be automated by the agent service",
        lastUpdated: new Date().toISOString(),
        tags: ["Discovery", "Automation"],
        segments: [
          {
            id: generateId(),
            title: "Opening",
            content:
              "Thanks for hopping on. I work with ops leaders to remove manual lead qualification so your team can focus on closing more revenue."
          },
          {
            id: generateId(),
            title: "Problem surfacing",
            content:
              "Walk me through what happens after a lead books time. Where do handoffs slow down, and what would a 10x faster response unlock?"
          },
          {
            id: generateId(),
            title: "Value Pitch",
            content:
              "Our AI-driven agent handles scheduling, qualification, and call prep. Teams see 32% more meetings show up and a 21% lift in close rates."
          }
        ]
      }
    ],
    workflows: [
      {
        id: workflowId,
        name: "Inbound Demo Shield",
        goal: "Increase speed-to-lead and qualify inbound demo requests",
        persona: "Inbound leads",
        trigger: "New Calendly booking",
        successCriteria: "Pilot offer accepted within 14 days",
        active: true,
        steps: [
          {
            id: generateId(),
            title: "Pre-call briefing",
            stage: "research",
            delayMinutes: 0,
            instructions: "Compile LinkedIn, website headlines, and recent funding insights",
            automation: "Use Clay scrape + Crunchbase API"
          },
          {
            id: generateId(),
            title: "Agent-led discovery call",
            stage: "call",
            delayMinutes: 30,
            instructions: "Follow Productized Discovery script and capture objections live"
          },
          {
            id: generateId(),
            title: "Next steps & follow-up",
            stage: "follow-up",
            delayMinutes: 120,
            instructions: "Send summary, clip highlight reel, propose pilot structure",
            automation: "Auto-send via Instantly"
          }
        ]
      }
    ],
    notes: [
      {
        id: generateId(),
        callId,
        customerId,
        createdAt: new Date().toISOString(),
        category: "insight",
        sentiment: "positive",
        owner: randomOwner(),
        content: "Budget approved for rapid experimentation; critical to show ROI in 30 days."
      }
    ],
    metrics: {
      conversionRate: 0.36,
      winRate: 0.28,
      meetingsBooked: 14,
      avgHandleTime: 24,
      pipelineValue: 74000
    },
    activeCallId: callId
  };
};

export const useCallStore = create<CallStoreState>()(
  persist(
    (set, get) => ({
      ...initialState(),
      scheduleCall: (payload) => {
        const call: CallRecord = {
          id: generateId(),
          status: "scheduled",
          ...payload
        };
        set(({ calls }) => ({
          calls: [call, ...calls].sort(
            (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
          )
        }));
        get().refreshMetrics();
      },
      updateCallStatus: (callId, status) => {
        set(({ calls }) => ({
          calls: calls.map((call) =>
            call.id === callId
              ? {
                  ...call,
                  status,
                  durationMinutes:
                    status === "completed" && !call.durationMinutes ? 22 + Math.floor(Math.random() * 12) : call.durationMinutes
                }
              : call
          )
        }));
        get().refreshMetrics();
      },
      setActiveCall: (callId) => set({ activeCallId: callId }),
      logCallOutcome: (callId, outcome) => {
        set(({ calls, notes }) => {
          const call = calls.find((item) => item.id === callId);
          const newNote: TimelineNote | undefined = call
            ? {
                id: generateId(),
                callId,
                customerId: call.customerId,
                createdAt: new Date().toISOString(),
                category: "deal",
                sentiment: outcome.sentiment ?? "neutral",
                owner: randomOwner(),
                content: outcome.summary
              }
            : undefined;
          return {
            calls: calls.map((item) =>
              item.id === callId
                ? {
                    ...item,
                    status: outcome.followUpDate ? "completed" : item.status,
                    outcome: outcome.summary,
                    sentiment: outcome.sentiment,
                    nextStep: outcome.nextStep,
                    followUpDate: outcome.followUpDate
                  }
                : item
            ),
            notes: newNote ? [newNote, ...notes] : notes
          };
        });
        get().refreshMetrics();
      },
      assignScriptToCall: (callId, scriptId) =>
        set(({ calls }) => ({
          calls: calls.map((call) => (call.id === callId ? { ...call, scriptId } : call))
        })),
      addScript: (payload) =>
        set(({ scripts }) => ({
          scripts: [
            {
              ...payload,
              id: generateId(),
              lastUpdated: new Date().toISOString()
            },
            ...scripts
          ]
        })),
      updateScriptSegment: (scriptId, segment) =>
        set(({ scripts }) => ({
          scripts: scripts.map((script) =>
            script.id === scriptId
              ? {
                  ...script,
                  lastUpdated: new Date().toISOString(),
                  segments: script.segments.map((item) => (item.id === segment.id ? segment : item))
                }
              : script
          )
        })),
      addScriptSegment: (scriptId, segment) =>
        set(({ scripts }) => ({
          scripts: scripts.map((script) =>
            script.id === scriptId
              ? {
                  ...script,
                  lastUpdated: new Date().toISOString(),
                  segments: [...script.segments, { id: generateId(), ...segment }]
                }
              : script
          )
        })),
      addWorkflow: (payload) =>
        set(({ workflows }) => ({
          workflows: [
            {
              ...payload,
              id: generateId(),
              active: true
            },
            ...workflows
          ]
        })),
      toggleWorkflow: (workflowId, active) =>
        set(({ workflows }) => ({
          workflows: workflows.map((workflow) =>
            workflow.id === workflowId ? { ...workflow, active } : workflow
          )
        })),
      addWorkflowStep: (workflowId, step) =>
        set(({ workflows }) => ({
          workflows: workflows.map((workflow) =>
            workflow.id === workflowId
              ? {
                  ...workflow,
                  steps: [...workflow.steps, { id: generateId(), ...step }]
                }
              : workflow
          )
        })),
      addCustomer: (payload) =>
        set(({ customers }) => ({
          customers: [
            {
              ...payload,
              id: generateId()
            },
            ...customers
          ]
        })),
      addNote: (note) =>
        set(({ notes }) => ({
          notes: [
            {
              ...note,
              id: generateId(),
              createdAt: new Date().toISOString()
            },
            ...notes
          ]
        })),
      refreshMetrics: () => {
        const { calls, customers } = get();
        const completed = calls.filter((call) => call.status === "completed").length;
        const scheduled = calls.filter((call) => call.status === "scheduled").length;
        const conversionRate = completed ? Math.min(1, completed / Math.max(1, scheduled + completed)) : 0;
        const positiveCalls = calls.filter((call) => call.sentiment === "positive").length;
        const pipelineValue = customers.reduce((acc, customer) => acc + customer.accountValue, 0);
        set({
          metrics: {
            conversionRate,
            winRate: completed ? Math.min(1, positiveCalls / completed) : 0,
            meetingsBooked: scheduled + completed,
            avgHandleTime: completed ? Math.round(18 + Math.random() * 12) : 0,
            pipelineValue
          }
        });
      }
    }),
    {
      name: "call-agent-state",
      partialize: (state) => ({
        calls: state.calls,
        customers: state.customers,
        scripts: state.scripts,
        workflows: state.workflows,
        notes: state.notes,
        metrics: state.metrics,
        activeCallId: state.activeCallId
      })
    }
  )
);

export const describeNote = (note: TimelineNote) =>
  `${capitalize(note.category)} • ${formatDistanceToNow(new Date(note.createdAt), {
    addSuffix: true
  })}`;
