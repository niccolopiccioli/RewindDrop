import { DEMO_DISCLAIMER, SITE_NAME } from "@/lib/site";

export default function PrivacyPage() {
  return (
    <div className="container-wide max-w-2xl py-12 md:py-16">
      <h1 className="text-display text-2xl font-semibold mb-6">Privacy</h1>
      <div className="prose prose-sm text-muted space-y-4">
        <section id="demo" className="rounded-lg border border-border bg-surface p-5 not-prose">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-3">
            Sito dimostrativo
          </h2>
          <p className="text-sm text-muted leading-relaxed">{DEMO_DISCLAIMER}</p>
          <p className="text-sm text-muted leading-relaxed mt-3">
            I nomi dei prodotti nel catalogo sono fittizi o generici. Eventuali
            loghi o riferimenti visivi a marchi di terzi nelle immagini non
            implicano partnership, autorizzazione o vendita di merce originale
            da parte di {SITE_NAME}.
          </p>
        </section>

        <p>
          I tuoi dati personali sono trattati nel rispetto del GDPR. Utilizziamo
          le informazioni fornite solo per gestire ordini, spedizioni e
          comunicazioni relative al servizio.
        </p>
        <p>
          Non vendiamo né condividiamo i tuoi dati con terze parti per finalità
          di marketing senza il tuo consenso esplicito.
        </p>
        <p>
          Per richieste relative ai tuoi dati, contattaci all&apos;indirizzo
          privacy@rewinddrop.demo.
        </p>
      </div>
    </div>
  );
}
