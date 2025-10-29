"use client";

import { useMemo } from "react";
import { MoonStar, SunMedium, ShieldCheck, Rocket, Bot, Phone } from "lucide-react";
import { CallControlCenter } from "@/components/CallControlCenter";
import { ScriptWorkbench } from "@/components/ScriptWorkbench";
import { WorkflowStudio } from "@/components/WorkflowStudio";
import { InsightsPanel } from "@/components/InsightsPanel";
import { useCallStore } from "@/store/useCallStore";

const gradientStyle = {
  background:
    "linear-gradient(120deg, rgba(99,102,241,0.12), rgba(56,189,248,0.1), rgba(244,114,182,0.12))",
  borderRadius: "24px",
  padding: "32px",
  boxShadow: "0 25px 50px -40px rgba(30,64,175,0.6)"
};

export default function Page() {
  const { customers } = useCallStore();

  const totalValue = useMemo(
    () => customers.reduce((acc, customer) => acc + customer.accountValue, 0),
    [customers]
  );

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("call-agent-theme", isDark ? "dark" : "light");
  };

  return (
    <main className="container" style={{ display: "grid", gap: 32 }}>
      <header style={gradientStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <span className="tag">
              <Bot size={16} style={{ marginRight: 8 }} />
              Freelance call agent
            </span>
            <h1 style={{ margin: "12px 0 16px", fontSize: "2.6rem", lineHeight: 1.1 }}>
              Control every customer conversation like you already hired your dream closer
            </h1>
            <p style={{ margin: 0, fontSize: "1.05rem", color: "rgba(15,23,42,0.75)" }}>
              Spin up an agent to answer, qualify, and convert prospects for your freelance
              business. Plan the call experience, deploy workflows, and keep every follow-through
              bulletproof.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 22 }}>
              <button
                className="primary"
                style={{ padding: "12px 24px", borderRadius: 12 }}
              >
                <Phone size={18} style={{ marginRight: 8 }} />
                Launch agent cockpit
              </button>
              <button
                onClick={toggleTheme}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.5)",
                  backgroundColor: "rgba(255,255,255,0.8)"
                }}
              >
                <MoonStar size={18} style={{ marginRight: 8 }} />
                Toggle mode
              </button>
            </div>
          </div>
          <div
            style={{
              padding: "18px 22px",
              borderRadius: 20,
              background: "rgba(15,23,42,0.85)",
              color: "white",
              minWidth: 240
            }}
          >
            <h3 style={{ margin: "0 0 12px" }}>Impact snapshot</h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, fontSize: "0.95rem" }}>
              <li>Respond to leads in &lt; 5 minutes with AI handoff.</li>
              <li>Track every objection and promise in one command center.</li>
              <li>Plug in your freelance scripts so the agent matches your voice.</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 20,
            marginTop: 30
          }}
        >
          <div className="card" style={{ padding: 20 }}>
            <ShieldCheck size={22} />
            <h3 style={{ margin: "12px 0 4px" }}>Never miss a call</h3>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              Smart routing, instant summaries, and agent guardrails aligned to your freelance
              brand.
            </p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <Rocket size={22} />
            <h3 style={{ margin: "12px 0 4px" }}>Deploy fast</h3>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              Launch call scripts, automation workflows, and follow-up tasks in minutes.
            </p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <SunMedium size={22} />
            <h3 style={{ margin: "12px 0 4px" }}>Own the relationship</h3>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              Keep prospects warm with precision follow-ups and real-time deal health checks.
            </p>
          </div>
        </div>
      </header>

      <CallControlCenter />
      <ScriptWorkbench />
      <WorkflowStudio />
      <InsightsPanel />

      <footer
        style={{
          borderRadius: 18,
          padding: "26px 32px",
          border: "1px solid rgba(148,163,184,0.25)",
          background: "rgba(15, 23, 42, 0.86)",
          color: "white",
          marginBottom: 48
        }}
      >
        <h2 style={{ margin: "0 0 8px" }}>Ready to stand up your call agent?</h2>
        <p style={{ margin: "0 0 16px", maxWidth: 560 }}>
          You are tracking {customers.length} relationships worth $
          {(totalValue / 1000).toFixed(1)}k in pipeline. Keep the cadence alive and outsource the
          busywork to this cockpit.
        </p>
        <button
          className="primary"
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            boxShadow: "0 18px 40px -30px rgba(59,130,246,0.9)"
          }}
        >
          Deploy on Vercel
        </button>
      </footer>
    </main>
  );
}
