"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bot, Database, FileSearch, GitBranch, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, UserRound, Users, X, Zap } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { WorkflowProfile } from "@/lib/auth";
import { LoadingLink } from "@/components/loading-link";
import { ThemeToggle } from "@/components/theme-toggle";

const navByRole = {
  admin: [
    ["/portal/admin", "Administration", ShieldCheck],
    ["/portal/designer", "Designer workspace", GitBranch],
    ["/portal/viewer", "Viewer portal", LayoutDashboard],
    ["/portal/admin#users", "Users", Users],
    ["/portal/admin#audit", "Audit logs", FileSearch]
  ],
  designer: [
    ["/portal/designer", "Designer workspace", GitBranch],
    ["/portal/designer#builder", "Builder", Bot],
    ["/portal/designer#data", "Data models", Database],
    ["/portal/viewer", "Preview review", Zap]
  ],
  viewer: [
    ["/portal/viewer", "Viewer portal", LayoutDashboard],
    ["/portal/viewer#previews", "Previews", Zap],
    ["/portal/viewer#audit", "Activity", FileSearch]
  ]
} as const;

export function PortalShell({ children, profile }: { children: React.ReactNode; profile: WorkflowProfile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const nav = navByRole[profile.workflow_role];

  async function signOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="app-layout">
      <aside className={cn("sidebar", open && "sidebar-open")}>
        <div className="sidebar-top">
          <Logo />
          <button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button>
        </div>
        <nav className="side-nav" aria-label="Portal navigation">
          {nav.map(([href, label, Icon]) => (
            <LoadingLink key={href} href={href} className={cn((pathname === href || pathname.startsWith(`${href}/`)) && "active")} onClick={() => setOpen(false)}>
              <Icon />{label}
            </LoadingLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <Bot />
          <strong>Preview engine</strong>
          <span>Role: {profile.workflow_role}</span>
          <span>Department: {profile.workflow_department ?? "Unassigned"}</span>
        </div>
        <div className="side-bottom">
          <LoadingLink href="/portal/admin#settings"><Settings />Settings</LoadingLink>
          <button onClick={signOut} disabled={signingOut}><LogOut />{signingOut ? "Signing out..." : "Sign out"}</button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <button className="top-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div className="global-search">
            <Search />
            <input aria-label="Search Bernuda" placeholder="Search workflows, previews, data models" />
            <kbd>/</kbd>
          </div>
          <div className="top-actions">
            <Link href="/portal/viewer#audit" aria-label="Open notifications" className="notification-button"><Bell /><i /></Link>
            <ThemeToggle />
            <div className="user-menu">
              <span><UserRound size={17} /></span>
              <div><strong>{profile.workflow_full_name}</strong><small>{profile.workflow_role} portal</small></div>
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
        {signingOut ? <div className="route-loading-overlay" role="status" aria-live="polite"><span className="loading-ring" />Signing out</div> : null}
      </div>
    </div>
  );
}
