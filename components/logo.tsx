import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("brand", className)} aria-label="Bernuda home">
      <Image src="/bernuda-logo.png" alt="" width={52} height={52} className="brand-mark" priority />
      {!compact && <span className="brand-name">BERNUDA</span>}
    </Link>
  );
}
