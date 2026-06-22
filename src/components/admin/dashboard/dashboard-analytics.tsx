"use client";

import { type AdminAnalytics } from "@/lib/admin-analytics";
import DashboardClient from "./dashboard-client";

export default function DashboardAnalytics({ data }: { data: AdminAnalytics }) {
  return <DashboardClient data={data} />;
}