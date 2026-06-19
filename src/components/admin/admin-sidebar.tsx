"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Store, Menu, X, Warehouse, MessageSquare } from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Prodotti", href: "/admin/prodotti", icon: Package },
  { name: "Categorie", href: "/admin/categorie", icon: FolderTree },
  { name: "Ordini", href: "/admin/ordini", icon: ShoppingCart },
  { name: "Inventario", href: "/admin/inventario", icon: Warehouse },
  { name: "Recensioni", href: "/admin/recensioni", icon: MessageSquare },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-colors ${
              isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={16} strokeWidth={1.5} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-foreground text-white rounded-full shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:flex-shrink-0 bg-[#1d1d1f] text-white">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.2em]">ESHOP Admin</Link>
        </div>
        <div className="flex-1 p-4"><NavLinks /></div>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            <Store size={14} /> Vai allo shop
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside className="w-64 h-full bg-[#1d1d1f] text-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Admin</span>
              <button onClick={() => setMobileOpen(false)}><X size={18} /></button>
            </div>
            <div className="flex-1 p-4"><NavLinks onNavigate={() => setMobileOpen(false)} /></div>
          </aside>
        </div>
      )}
    </>
  );
}
