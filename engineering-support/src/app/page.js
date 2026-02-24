import styles from "./page.module.css";

export default function HomePage() {
  const pricingPlans = [
    {
      planId: "base",
      planName: "Base",
      planPriceLabel: "€0",
      planPricePeriodLabel: "demo / free",
      planSummary:
        "Per chi deve fare un solo progetto e vuole un flusso guidato.",
      planModules: [
        "1 progetto personale",
        "Compilazione guidata documentazione",
        "Template essenziali (SRS, RACI, Risk)",
        "Export PDF della documentazione",
        "Accesso alla Public Page (lista utenti)"
      ]
    },
    {
      planId: "premium",
      planName: "Premium",
      planPriceLabel: "€9,99",
      planPricePeriodLabel: "/mese",
      planSummary:
        "Per chi gestisce più progetti e vuole più libertà operativa e template completi.",
      planModules: [
        "Più progetti personali",
        "Template avanzati (Test Plan, Use Cases, Meeting Notes)",
        "Export PDF + versioni aggiornate",
        "Gestione commenti sul progetto (se abilitata da amministratore)",
        "Priorità sulle funzionalità"
      ]
    },
    {
      planId: "admin",
      planName: "Admin",
      planPriceLabel: "€19,99",
      planPricePeriodLabel: "/mese",
      planSummary:
        "Per chi coordina un team: governance, controllo, commenti e gestione progetti del team.",
      planModules: [
        "Più progetti personali",
        "Template avanzati (Test Plan, Use Cases, Meeting Notes)",
        "Export PDF + versioni aggiornate",
        "Gestione commenti sul progetto",
        "Priorità sulle funzionalità",
        "Creazione team + gestione membri (invite/remove)",
        "Visione progetti del team (admin console)",
        "Commenti admin sui progetti degli utenti",
        "Supporto rapido (contact admin via email)"
      ]
    }
  ];

  return (
    <main className={styles.page}>
      {/* HERO */}
      <section className={styles.heroCard}>
        <h1 className={styles.heroTitle}>Engineering Support</h1>
        <div className={styles.heroTagline}>VUOI OTTIMIZZARE IL TUO TEMPO?</div>

        <p className={styles.heroDescription}>
          Ci pensa la Engineering Support Web App! <br></br>
          Con questa piattaforma avrai una documentazione guidata per tutti i tuoi progetti. <br></br>
          Prova la piattaforma in modo gratuito e ricorda che, con un piccolo contributo, da il meglio di sé!
        </p>
      </section>

      {/* PRODUCT */}
      <section className={styles.sectionCard} id="product">
        <h2 className={styles.sectionTitle}>Product</h2>
        <p className={styles.sectionLead}>
          Engineering Support è un “workspace” dove centralizzi un progetto e produci la documentazione
          in modo guidato: meno caos, più controllo, più coerenza. <br></br> Organizzare, guidare e documentare non è mai stato cosi semplice, la piattaforma 
          è pensata per essere intuitiva, scalabile e facilmente presentabile, con un'architettura pulita e componenti riutilizzabili.
        </p>

        <ul className={styles.bulletList}>
          <li>
            <strong>Documentazione guidata:</strong> compili blocchi strutturati (scope, requisiti, rischi,
            testing)
          </li>
          <li>
            <strong>Single source of truth:</strong> un progetto = un punto unico dove tenere dati e output.
          </li>
          <li>
            <strong>Export PDF:</strong> scarichi la documentazione in PDF.
          </li>
        </ul>
      </section>

      <section className={styles.sectionCard} id="solutions">
        <h2 className={styles.sectionTitle}>Solutions</h2>
        <p className={styles.sectionLead}>
          Cosa puoi fare dentro la piattaforma, step-by-step.
        </p>

        <ul className={styles.bulletList}>
          <li>
            <strong>Creare e gestire progetti:</strong> creazione, modifica e cancellazione con regole basate su plan.
          </li>
          <li>
            <strong>Compilare contenuti strutturati:</strong> trasformi “idee sparse” in sezioni coerenti e pronte all’export.
          </li>
          <li>
            <strong>Collaborare:</strong> puoi collaborare con i tuoi colleghi e con i tuoi supervisor, quindi potrai condividere feedback e gestire la documentazione.
          </li>
          <li>
            <strong>Se sei un amministratore:</strong> potrai coordinare il lavoro del gruppo e intervenire rapidamente quando richiesto.
          </li>
        </ul>
      </section>

      <section className={styles.sectionCard} id="templates">
        <h2 className={styles.sectionTitle}>Templates</h2>
        <p className={styles.sectionLead}>
          Template pronti che ti fanno risparmiare tempo e ti tengono dentro uno standard.
        </p>

        <div className={styles.templateGrid}>
          <div className={styles.templateBox}>
            <div className={styles.templateTitle}>Software Requirements</div>
            <div className={styles.templateText}>Requisiti funzionali / non funzionali, vincoli e assunzioni.</div>
          </div>

          <div className={styles.templateBox}>
            <div className={styles.templateTitle}>RACI</div>
            <div className={styles.templateText}>Ruoli e responsabilità: chi fa cosa, chi approva, chi è informato.</div>
          </div>

          <div className={styles.templateBox}>
            <div className={styles.templateTitle}>Risk Register</div>
            <div className={styles.templateText}>Rischi, impatto, probabilità, mitigazioni e owner.</div>
          </div>

          <div className={styles.templateBox}>
            <div className={styles.templateTitle}>Test Plan</div>
            <div className={styles.templateText}>Casi di test, criteri di accettazione e tracciabilità.</div>
          </div>
        </div>
      </section>

      <section className={styles.sectionCard} id="pricing">
        <h2 className={styles.sectionTitle}>Pricing</h2>
        <p className={styles.sectionLead}>
          Piani chiari, feature gating chiaro: base (1 progetto), premium (più progetti), admin (premium + team).
        </p>

        <div className={styles.pricingGrid}>
          {pricingPlans.map((plan) => (
            <div key={plan.planId} className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <div className={styles.planName}>{plan.planName}</div>
                <div className={styles.planPriceRow}>
                  <span className={styles.planPrice}>{plan.planPriceLabel}</span>
                  <span className={styles.planPeriod}>{plan.planPricePeriodLabel}</span>
                </div>
                <div className={styles.planSummary}>{plan.planSummary}</div>
              </div>

              <ul className={styles.featureList}>
                {plan.planModules.map((moduleLabel) => (
                  <li key={moduleLabel}>{moduleLabel}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sectionCard} id="help">
        <h2 className={styles.sectionTitle}>Help</h2>

        <div className={styles.helpGrid}>
          <div className={styles.helpBox}>
            <div className={styles.helpTitle}>Guida rapida</div>
            <ul className={styles.bulletList}>
              <li><a href="/register"> <em>Registrati</em></a> → crea credenziali → fai <a href="/login"> <em>Login</em></a>.</li>
              <li>Accedi <a href="/private-page"><em>all'area privata</em></a> → gestisci progetto e documentazione.</li>
              <li>Scarica PDF quando la documentazione è pronta.</li>
            </ul>
          </div>

          <div className={styles.helpBox}>
            <div className={styles.helpTitle}>Work Support </div>
            <p className={styles.helpText}>
              Nell’area privata sarà disponibile un pulsante fisso per contattare l’admin via email.
            </p>
          </div>

          <div className={styles.helpBox}>
            <div className={styles.helpTitle}>App Support</div>
            <ul className={styles.bulletList}>
              <li> Contatta il supporto da <a href="mailto:support@engineersupport.com"><em>qui</em></a></li>
              <li>Attendi qualche istante affinchè un nostro operatore risponda.</li>
              <li>In alternativa, accedi <a href="/private-page"><em>all'area privata</em></a> e sfrutta il chat bot.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
