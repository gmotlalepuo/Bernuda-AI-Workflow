"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { LoadingLink } from "@/components/loading-link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Logo />
        <nav className={open ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <Link href="/#how">How it works</Link>
          <Link href="/#features">Platform</Link>
          <Link href="/#security">Security</Link>
          <LoadingLink href="/login" className="nav-login">Sign in</LoadingLink>
          <LoadingLink href="/register" className="button button-primary">Request access</LoadingLink>
          <ThemeToggle />
        </nav>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}
