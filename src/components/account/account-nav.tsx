"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";
import { stripLocaleFromPath } from "@/lib/i18n/routing";

export default function AccountNav() {
  const pathname = usePathname();
  const paths = usePaths();
  const { t } = useI18n();
  const barePath = stripLocaleFromPath(pathname);

  const links = [
    { href: paths.account, bare: "/account", label: t("account.overview") },
    { href: paths.accountOrders, bare: "/account/orders", label: t("account.orders") },
    { href: paths.accountAddresses, bare: "/account/addresses", label: t("account.addresses") },
    { href: paths.accountWishlist, bare: "/account/wishlist", label: t("account.wishlist") },
    { href: paths.accountProfile, bare: "/account/profile", label: t("account.profile") },
  ];

  return (
    <nav className="flex flex-wrap gap-2 md:flex-col md:gap-1">
      {links.map((link) => {
        const active =
          link.bare === "/account"
            ? barePath === "/account"
            : barePath.startsWith(link.bare);
        return (
          <Link
            key={link.bare}
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
