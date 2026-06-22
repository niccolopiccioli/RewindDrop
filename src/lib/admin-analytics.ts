import { prisma } from "@/lib/prisma";

const REVENUE_STATUSES = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export type RevenueStatus = (typeof REVENUE_STATUSES)[number];

export type DailyMetric = {
  date: string;
  revenue: number;
  orders: number;
};

export type StatusMetric = {
  status: string;
  label: string;
  count: number;
};

export type RankedProduct = {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  revenue: number;
};

export type CategoryMetric = {
  categoryId: string;
  name: string;
  revenue: number;
  units: number;
};

export type AdminAnalytics = {
  threshold: number;
  revenue: {
    total: number;
    today: number;
    month: number;
    previousMonth: number;
    monthChange: number | null;
  };
  orders: {
    total: number;
    today: number;
    month: number;
    previousMonth: number;
    monthChange: number | null;
    averageOrderValue: number;
  };
  customers: {
    total: number;
    month: number;
    previousMonth: number;
    monthChange: number | null;
  };
  catalog: {
    totalProducts: number;
    activeProducts: number;
    hiddenProducts: number;
    totalVariants: number;
    totalUnits: number;
    outOfStock: number;
    lowStock: number;
  };
  engagement: {
    newsletterSubscribers: number;
    pendingReviews: number;
    wishlistItems: number;
  };
  dailyMetrics: DailyMetric[];
  ordersByStatus: StatusMetric[];
  topProductsByRevenue: RankedProduct[];
  topProductsByQuantity: RankedProduct[];
  categoryPerformance: CategoryMetric[];
  recentOrders: {
    id: string;
    number: string;
    total: number;
    status: string;
    createdAt: Date;
    customer: string;
  }[];
  lowStockVariants: {
    id: string;
    productId: string;
    name: string;
    productName: string;
    stock: number;
  }[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "In attesa",
  PROCESSING: "In lavorazione",
  PAID: "Pagato",
  SHIPPED: "Spedito",
  DELIVERED: "Consegnato",
  CANCELLED: "Annullato",
  REFUNDED: "Rimborsato",
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null;
  }
  return ((current - previous) / previous) * 100;
}

function sumOrderTotals(
  orders: { total: { toString(): string } | number }[]
): number {
  return orders.reduce((sum, order) => sum + Number(order.total), 0);
}

function buildDailyMetrics(
  orders: { createdAt: Date; total: { toString(): string } | number }[],
  days = 30
): DailyMetric[] {
  const today = startOfDay(new Date());
  const buckets = new Map<string, DailyMetric>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, { date: key, revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const key = startOfDay(order.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += Number(order.total);
    bucket.orders += 1;
  }

  return [...buckets.values()];
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(
    new Date(now.getFullYear(), now.getMonth() - 1, 1)
  );
  const previousMonthEnd = new Date(monthStart.getTime() - 1);
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(todayStart.getDate() - 29);

  const revenueWhere = { status: { in: [...REVENUE_STATUSES] } };

  const [
    totalProducts,
    activeProducts,
    totalVariants,
    stockAggregate,
    outOfStock,
    lowStock,
    totalCustomers,
    customersThisMonth,
    customersPreviousMonth,
    newsletterSubscribers,
    pendingReviews,
    wishlistItems,
    revenueOrders,
    ordersThisMonth,
    ordersPreviousMonth,
    ordersToday,
    ordersByStatusRaw,
    recentOrders,
    lowStockVariants,
    orderItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.variant.count({ where: { active: true } }),
    prisma.variant.aggregate({
      where: { active: true },
      _sum: { stock: true },
    }),
    prisma.variant.count({ where: { active: true, stock: 0 } }),
    prisma.variant.count({
      where: { active: true, stock: { gt: 0, lt: threshold } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: monthStart } },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
      },
    }),
    prisma.newsletterSubscriber.count(),
    prisma.review.count({ where: { approved: false } }),
    prisma.wishlist.count(),
    prisma.order.findMany({
      where: revenueWhere,
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.count({
      where: { ...revenueWhere, createdAt: { gte: monthStart } },
    }),
    prisma.order.count({
      where: {
        ...revenueWhere,
        createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
      },
    }),
    prisma.order.count({
      where: { ...revenueWhere, createdAt: { gte: todayStart } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.variant.findMany({
      where: { stock: { lt: threshold }, active: true },
      include: { product: { select: { name: true } } },
      take: 6,
      orderBy: { stock: "asc" },
    }),
    prisma.orderItem.findMany({
      where: {
        productId: { not: null },
        order: { status: { in: [...REVENUE_STATUSES] } },
      },
      select: {
        productId: true,
        quantity: true,
        total: true,
        name: true,
        product: {
          select: {
            name: true,
            slug: true,
            categoryId: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  const totalRevenue = sumOrderTotals(revenueOrders);
  const revenueToday = sumOrderTotals(
    revenueOrders.filter((order) => order.createdAt >= todayStart)
  );
  const revenueMonth = sumOrderTotals(
    revenueOrders.filter((order) => order.createdAt >= monthStart)
  );
  const revenuePreviousMonth = sumOrderTotals(
    revenueOrders.filter(
      (order) =>
        order.createdAt >= previousMonthStart &&
        order.createdAt <= previousMonthEnd
    )
  );

  const revenueOrdersLast30 = revenueOrders.filter(
    (order) => order.createdAt >= thirtyDaysAgo
  );

  const productMap = new Map<
    string,
    { name: string; slug: string; quantity: number; revenue: number }
  >();
  const categoryMap = new Map<
    string,
    { name: string; revenue: number; units: number }
  >();

  for (const item of orderItems) {
    if (!item.productId) continue;

    const productEntry = productMap.get(item.productId) ?? {
      name: item.product?.name || item.name,
      slug: item.product?.slug || "",
      quantity: 0,
      revenue: 0,
    };
    productEntry.quantity += item.quantity;
    productEntry.revenue += Number(item.total);
    productMap.set(item.productId, productEntry);

    const category = item.product?.category;
    if (!category) continue;

    const categoryEntry = categoryMap.get(category.id) ?? {
      name: category.name,
      revenue: 0,
      units: 0,
    };
    categoryEntry.revenue += Number(item.total);
    categoryEntry.units += item.quantity;
    categoryMap.set(category.id, categoryEntry);
  }

  const topProductsByRevenue = [...productMap.entries()]
    .map(([productId, data]) => ({
      productId,
      ...data,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topProductsByQuantity = [...productMap.entries()]
    .map(([productId, data]) => ({
      productId,
      ...data,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const categoryPerformance = [...categoryMap.entries()]
    .map(([categoryId, data]) => ({
      categoryId,
      name: data.name,
      revenue: data.revenue,
      units: data.units,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const paidOrdersCount = revenueOrders.length;

  return {
    threshold,
    revenue: {
      total: totalRevenue,
      today: revenueToday,
      month: revenueMonth,
      previousMonth: revenuePreviousMonth,
      monthChange: percentChange(revenueMonth, revenuePreviousMonth),
    },
    orders: {
      total: paidOrdersCount,
      today: ordersToday,
      month: ordersThisMonth,
      previousMonth: ordersPreviousMonth,
      monthChange: percentChange(ordersThisMonth, ordersPreviousMonth),
      averageOrderValue:
        paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0,
    },
    customers: {
      total: totalCustomers,
      month: customersThisMonth,
      previousMonth: customersPreviousMonth,
      monthChange: percentChange(customersThisMonth, customersPreviousMonth),
    },
    catalog: {
      totalProducts,
      activeProducts,
      hiddenProducts: totalProducts - activeProducts,
      totalVariants,
      totalUnits: stockAggregate._sum.stock ?? 0,
      outOfStock,
      lowStock,
    },
    engagement: {
      newsletterSubscribers,
      pendingReviews,
      wishlistItems,
    },
    dailyMetrics: buildDailyMetrics(revenueOrdersLast30),
    ordersByStatus: ordersByStatusRaw
      .map((entry) => ({
        status: entry.status,
        label: STATUS_LABELS[entry.status] || entry.status,
        count: entry._count._all,
      }))
      .sort((a, b) => b.count - a.count),
    topProductsByRevenue,
    topProductsByQuantity,
    categoryPerformance,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      number: order.number,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      customer: order.user.name || order.user.email,
    })),
    lowStockVariants: lowStockVariants.map((variant) => ({
      id: variant.id,
      productId: variant.productId,
      name: variant.name,
      productName: variant.product.name,
      stock: variant.stock,
    })),
  };
}

export function formatEuro(value: number, compact = false) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  }).format(value);
}

export function formatPercent(value: number | null) {
  if (value === null) return "—";
  const formatted = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
  return `${formatted}%`;
}

export function formatShortDate(isoDate: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${isoDate}T12:00:00`));
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
