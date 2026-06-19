import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface text-foreground border-t border-border">
      <div className="container-wide py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              ESHOP
            </h2>
            <p className="text-muted text-sm max-w-sm leading-relaxed">
              Streetwear essenziale. Qualità premium, design minimal, stile
              autentico.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Tutti i Prodotti", href: "/prodotti" },
                { label: "Nuovi Arrivi", href: "/prodotti?sort=newest" },
                { label: "Offerte", href: "/prodotti?sale=true" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground hover:text-muted transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted mb-4">
              Supporto
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Spedizioni", href: "/spedizioni" },
                { label: "Resi", href: "/resi" },
                { label: "Privacy", href: "/privacy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground hover:text-muted transition-colors duration-300"
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
            &copy; {currentYear} ESHOP. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}
