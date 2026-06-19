export default function SpedizioniPage() {
  return (
    <div className="container-wide max-w-2xl py-12 md:py-16">
      <h1 className="text-display text-2xl font-semibold mb-6">Spedizioni</h1>
      <div className="prose prose-sm text-muted space-y-4">
        <p>Spedizione gratuita per ordini superiori a €50. Per ordini inferiori, costo fisso di €5,99.</p>
        <p>Tempi di consegna: 2-5 giorni lavorativi in Italia. Riceverai un tracking via email quando l&apos;ordine verrà spedito.</p>
        <p>Spediamo in tutta Italia tramite corriere espresso.</p>
      </div>
    </div>
  );
}
