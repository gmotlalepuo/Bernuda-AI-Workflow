"use client";

import Image from "next/image";
import {
  Activity,
  Bell,
  Boxes,
  ChevronDown,
  Database,
  FileSearch,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Workflow,
  Zap
} from "lucide-react";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Builder", icon: Workflow },
  { label: "Preview Engine", icon: Zap },
  { label: "Data Models", icon: Database },
  { label: "Audit Logs", icon: FileSearch },
  { label: "System Health", icon: HeartPulse },
  { label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <div className="brand">
          <Image className="brand-mark" src="/bernuda-logo.png" alt="Bernuda logo" width={56} height={56} priority />
          <div>
            <div className="brand-name">BERNUDA</div>
            <div className="brand-subtitle">AI Workflow Builder</div>
          </div>
        </div>
        <nav className="nav-list">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <a className={`nav-item ${item.active ? "active" : ""}`} href={`#${item.label.toLowerCase().replaceAll(" ", "-")}`} key={item.label}>
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <label className="search">
            <Search size={19} aria-hidden="true" />
            <input aria-label="Global search" placeholder="Search workflows, personas, data models, audit events" />
          </label>
          <button className="icon-button" aria-label="Open notifications">
            <Bell size={19} />
          </button>
          <button className="button" aria-label="Open user profile menu">
            <ShieldCheck size={18} />
            Admin
            <ChevronDown size={16} />
          </button>
        </div>
        <div aria-label="Breadcrumb" className="muted" style={{ marginBottom: 12 }}>
          Workspace / Bernuda / Loan Approval Preview
        </div>
        {children}
        <section className="section grid cols-3" id="system-health" aria-label="System health">
          {[
            ["Database", "Connected", Database],
            ["Queue", "3 background jobs", Activity],
            ["Storage", "Healthy", Boxes],
            ["Version", "0.1.0-dev", Gauge]
          ].map(([label, value, Icon]) => (
            <div className="card" key={label as string}>
              <h3>
                <Icon size={18} aria-hidden="true" /> {label as string}
              </h3>
              <p className="muted">
                <span className="status-dot" />
                {value as string}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
