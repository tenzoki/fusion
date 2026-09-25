templates/plane.config.yaml: Leserliste ohne "map", und ein Issue-Marker _s_, den das Issue-Vokabular nicht kennt
---
Schweregrad: niedrig. (1) templates/plane.config.yaml:8: "What reads this file: bin/fusion-plane (push | seed | states | doctor | plan)" — auch map --prune lädt die Config (bin/fusion-plane map_prune: cfg_load). (2) Zeile 87 kommentiert "Cancelled" mit "Circle/issue/decision _s_/_d_" — Issues kennen kein _s_ (Vokabular _o_/_p_/_c_/_d_; fusion-plane-Mapping behandelt für Issues nur o/p/c/d).
---
Klasse 3, verifiziert (Code gelesen). Analyse: 260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — Leserliste um `map` ergänzt (`templates/plane.config.yaml:8`); der Cancelled-Kommentar behauptet kein Issue-`_s_` mehr (jetzt: "Circle _s_/_d_; issue _d_; decision _s_/_d_", :87). Nur Kommentarzeilen, kein Datenwert berührt. Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 12, Batch C).
