import AdminSidebar from "./admin-sidebar";
import AdminHeader from "./admin-header";
import { AdminLocaleProvider } from "./admin-locale-provider";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminLocaleProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-surface">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AdminLocaleProvider>
  );
}
