README-hooks.md Files-Tabelle führt lib/ Datei für Datei auf — fs-locator.ts, rules-write-exemption.ts und project-relative.ts fehlen
---
Schweregrad: niedrig-mittel. README-hooks.md:105-125 listet die lib-Module einzeln (paths, config, escalation, events, churn, cross-file, workbench-root, self-detect, shell-parse, command-word, git-branch-guard, bash-mutation-guard). Es fehlen drei getrackte, ausgelieferte Module: hooks/lib/fs-locator.ts, hooks/lib/rules-write-exemption.ts (das README-hooks:148 selbst zitiert!), hooks/lib/project-relative.ts.
---
Klasse 3, verifiziert (git ls-files). Analyse: circles/260801-1244-guard-rules-write/analyses/260805-1840-doku-gesamtpruefung-gegen-code.md
---
Resolved: 2026-08-06 — Dateitabelle um `lib/project-relative.ts`, `lib/rules-write-exemption.ts` und `lib/fs-locator.ts` ergänzt (`README-hooks.md:117-119`; Schwester-Record `260805-1839_c_die-dateitabelle-…` desselben Befunds ebenfalls geschlossen). Commit 9a96466, Circle 260805-2005-textschicht-gegen-code-nachziehen (Plan-Schritt 11, Batch B).
