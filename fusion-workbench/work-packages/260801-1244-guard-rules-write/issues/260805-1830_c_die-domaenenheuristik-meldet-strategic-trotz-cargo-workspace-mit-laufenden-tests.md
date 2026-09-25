Die Domänenheuristik von Setup Schritt 5 meldet `strategic` trotz Cargo-Workspace mit laufenden Tests

---

Im Konsumprojekt krk lieferte die Domänenerkennung des Orchestrator-Setups `strategic`, weil die Zahl offener Entscheidungen (5) die der offenen Defekte (3) erreichte, ohne zu prüfen, ob Quellcode vorliegt. Vorgefunden: ein Cargo-Workspace mit vier Crates, 16 Rust-Quelldateien und laufenden Tests. Die Sitzung hat von Hand auf `code` korrigiert.

---

Beleg: `/Users/k1/Projects/productive/krk/260803-1038-orchestrator-session.md`, Abschnitt "Domänenerkennung", mit den Eingangswerten der Heuristik und der Begründung der Korrektur. Der erste Zweig der Heuristik greift auf das Verhältnis Entscheidungen zu Defekten, bevor ein Quellcode-Kriterium gesehen wird; ein aktives Bauprojekt mit lebhafter Entscheidungsdisziplin kippt damit systematisch nach `strategic`.

Vorschlag: vor dem Entscheidungs-Defekt-Verhältnis einen Quellcode-Bestandscheck (vorhandene Build-Manifeste wie `Cargo.toml`, `go.mod`, `package.json`, `pyproject.toml` plus Quelldateien) als dominantes Signal für `code` werten. Die Heuristik lebt im Setup-Ablauf des Orchestrators (`agents/orchestrator.md` bzw. `skills/setup/SKILL.md`, Schritt 5).

Quelle: Analyse `260805-1830-zweck-nutzung-und-stand-des-plugins.md`, Befund 1.

---
Resolved: The strategic outcome was retired (hooks/lib/domain-cascade.ts RETIRED_DOMAINS) and the artifact-count branches that produced it removed in 0894d0d; Setup Step 5 now reads bin/fusion-count-sources first, which is the source-inventory check this record proposed.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147-orchestrator-session.md, after a re-verification pass against HEAD confirmed the condition no longer holds.
