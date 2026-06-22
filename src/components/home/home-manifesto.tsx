import ScrollReveal from "@/components/home/scroll-reveal";

export default function HomeManifesto() {
  return (
    <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden bg-foreground text-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05), transparent 35%)",
        }}
      />

      <div className="container-wide relative">
        <ScrollReveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-background/45 mb-6 sm:mb-8">
            RewindDrop manifesto
          </p>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <h2 className="text-display text-[clamp(2rem,8vw,4.5rem)] font-semibold leading-[0.95] max-w-4xl">
            Drop curati.
            <span className="block text-background/75">Zero compromessi.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <p className="mt-6 sm:mt-8 max-w-xl text-sm sm:text-base text-background/55 leading-relaxed">
            Selezioniamo pezzi con carattere — dalle Jordan heat alle felpe
            editoriali. Ogni drop racconta una storia urbana.
          </p>
        </ScrollReveal>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-background/10 pt-8 sm:pt-10">
          {[
            { n: "01", t: "Curato", d: "Solo pezzi che parlano da soli" },
            { n: "02", t: "Autentico", d: "Streetwear con attitude vera" },
            { n: "03", t: "Limitato", d: "Drop che non aspettano" },
          ].map((item, index) => (
            <ScrollReveal key={item.n} delay={200 + index * 80} direction="up">
              <div className="group">
                <span className="text-[10px] uppercase tracking-[0.3em] text-background/35 block mb-3 transition-colors group-hover:text-background/60">
                  {item.n}
                </span>
                <h3 className="text-sm sm:text-base font-medium mb-2">{item.t}</h3>
                <p className="text-xs sm:text-sm text-background/45">{item.d}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
