"use client";

import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";
import Button from "@/components/ui/button";
import { useAdminT } from "./admin-locale-provider";

export default function AdminHeader() {
  const { data: session } = useSession();
  const t = useAdminT();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border h-14">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 min-w-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="lg:hidden p-1.5 -ml-1 text-muted hover:text-foreground rounded-lg hover:bg-surface transition-colors"
            onClick={() => window.dispatchEvent(new CustomEvent("admin:open-mobile-menu"))}
            aria-label={t("admin.common.menu")}
          >
            <Menu size={18} />
          </button>
          <span className="lg:hidden text-xs font-semibold uppercase tracking-[0.2em] shrink-0">{t("admin.title")}</span>
        </div>
        <div className="hidden lg:block flex-1" />
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <span className="hidden sm:inline text-xs text-muted truncate max-w-[10rem] md:max-w-xs">
            {session?.user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut size={14} className="mr-1" /> {t("admin.common.signOut")}
          </Button>
        </div>
      </div>
    </header>
  );
}