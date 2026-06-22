import { getAdminAnalytics } from "@/lib/admin-analytics";
import DashboardAnalytics from "@/components/admin/dashboard/dashboard-analytics";

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();
  return <DashboardAnalytics data={analytics} />;
}
