"use client";

import Link from "next/link";
import SiteLogo from "@/components/ui/site-logo";
import LocaleSwitcher from "@/components/layout/locale-switcher";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";

export default function Footer() {
  const { t } = useI18n();
  const paths = usePaths();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface text-foreground border-t border-border">
      <div className="container-wide py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-2">
            <Link href={paths.home} className="inline-block mb-4 text-foreground">
              <SiteLogo size="compact" />
            </Link>
            <p className="text-muted text-sm max-w-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
            <p className="text-muted text-xs max-w-sm leading-relaxed mt-4 border-l-2 border-border pl-3">
              {t("common.demoLong")}
            </p>
            <div className="mt-6">
              <LocaleSwitcher />
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted mb-4">
              {t("footer.shop")}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t("footer.allProducts"), href: paths.products },
                { label: t("footer.newArrivals"), href: paths.productsNewest },
                { label: t("nav.sale"), href: paths.productsSale },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2.5 text-sm text-foreground hover:text-muted transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted mb-4">
              {t("footer.support")}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t("footer.shipping"), href: paths.shipping },
                { label: t("footer.returns"), href: paths.returns },
                { label: t("footer.privacy"), href: paths.privacy },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2.5 text-sm text-foreground hover:text-muted transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-xs text-muted">
            &copy; {currentYear} RewindDrop. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
