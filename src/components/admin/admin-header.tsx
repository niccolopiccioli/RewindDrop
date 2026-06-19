"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/button";

export default function AdminHeader() {
  const { data: session } = useSession();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border h-14">
      <div className="flex items-center justify-between h-full px-6">
        <span className="lg:hidden text-xs font-semibold uppercase tracking-[0.2em]">Admin</span>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted">{session?.user?.email}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut size={14} className="mr-1" /> Esci
          </Button>
        </div>
      </div>
    </header>
  );
}
