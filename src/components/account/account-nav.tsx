"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/account", label: "Panoramica" },
  { href: "/account/ordini", label: "Ordini" },
  { href: "/account/indirizzi", label: "Indirizzi" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/profilo", label: "Profilo" },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 md:flex-col md:gap-1">
      {links.map((link) => {
        const active =
          link.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 text-xs uppercase tracking-widest rounded-lg transition-colors ${
              active
                ? "bg-foreground text-white"
                : "text-muted hover:text-foreground hover:bg-surface"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
