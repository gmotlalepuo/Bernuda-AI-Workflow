"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { AnchorHTMLAttributes, MouseEvent, ReactNode, useState } from "react";

type LoadingLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { children: ReactNode };

export function LoadingLink({ children, className, onClick, ...props }: LoadingLinkProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === "_blank") return;
    const href = typeof props.href === "string" ? props.href : props.href.pathname ?? "";
    if (href && href !== pathname && !href.startsWith("#")) {
      setLoading(true);
      window.setTimeout(() => setLoading(false), 4500);
    }
  }

  return (
    <>
      <Link {...props} className={className} onClick={handleClick}>{children}</Link>
      {loading ? <div className="route-loading-overlay" role="status" aria-live="polite"><span className="loading-ring" />Loading Bernuda</div> : null}
    </>
  );
}
