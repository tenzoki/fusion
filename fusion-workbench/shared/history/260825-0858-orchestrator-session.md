# Orchestrator Session — 260825-0858

**Directive:** (not yet stated — Setup only; awaiting the user's task)
**Mode:** (unresolved — Phase 0 not yet run)
**Status:** In progress

## Setup snapshot

- **Workbench:** /Users/k1/Projects/productive/fusion/fusion-workbench
- **Source root:** /Users/k1/Projects/productive/fusion (plugin's own work tree; `bin/fusion-source-root` preferred the checkout over the install copy at /Users/k1/.fusion)
- **Setup marker:** written, plugin_version 10.7.0
- **git HEAD at start:** a99e680
- **Turn budget:** max_turns=12 (resolved from fusion.json; no configuration diagnostics on stderr)
- **Detected workbench domain:** code (code_files=105, data_files=10, counted_by=git-ls-files)
- **Interrupted session:** none (no agentstate.yaml)
- **Active Circle:** none (no .active-circle, no `_t_` record)
- **Identity:** PERSON=Kai Stalmann <ks@qantr.com>, CHECKOUT=5e8248d7
- **Legacy halt flag:** absent
- **Stylometric profiles:** all four present and byte-identical to the shipped copies (case1-equal), stamped in .asset-provenance
- **Permissions:** .claude/settings.local.json already carries defaultMode bypassPermissions; allow list already complete, no write needed
- **.gitattributes:** union merge driver already applies to orchestrator-events.jsonl
- **Monitor:** refreshed from the install copy
- **Circle-count hint:** not printed (0 anticipated, 0 active)

## Open state

| Store | Count |
|---|---|
| Open defects (shared/issues, `_o_`+`_p_`) | 0 |
| Open plans (shared/planning, `_o_`+`_p_`) | 1 |
| Open decisions (shared/decisions, `_o_`) | 3 |

Circles: 15 closed-coherent, 2 bounded, 1 superseded, 0 anticipated, 0 active.

Open plan: `shared/planning/260822-1136_o_spec-fusion-becomes-a-multi-user-tool.md` (Status: Partially Complete).

Open decisions:
- `shared/decisions/260822-1154_o_does-the-hook-test-line-budget-cover-comment-prose.md`
- `shared/decisions/260822-1154_o_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`
- `shared/decisions/260823-1414_o_does-the-workbench-citation-gates-corpus-cover-review-files.md`

## Ad-hoc: die .gitignore eines Consumers

Der Nutzer legte die `.gitignore` eines fusion-verbrauchenden Projekts zur Durchsicht vor.
Gemessen gegen `rules/workbench-tracking.md` `## The four classes`, Pattern-Semantik in
einem Scratch-Repository mit `git check-ignore` verifiziert.

**Befund.** Zwei Einträge ignoriert, die reisen müssen (`orchestrator-events.jsonl`, R2;
`.fusion-setup`, R3), zwei fehlende Ausschlüsse für Class L (`.active-circle`,
`portfolio.md`), und `.checkout-id` liegt aus einem früheren Commit im Repo, obwohl der
Pfad inzwischen in der Datei steht. Dazu zwei tote Blöcke (Plane-Bridge, Bus-Protokoll),
deren fusion-Oberflächen 2026-08-15 bzw. in v3.15.0 entfernt wurden.

**Gemessen, kein Befund.** Die 151 MB unter `archive/…/.guard-state/` sind kein
`.gitignore`-Effekt: `**/fusion-workbench/.guard-state/` greift dort nicht, weil `**` nur
führende Segmente frisst. Getestet, nicht geschlossen.

**Warum fusion es nicht bemerkt hat.** Drei Schichten, jede aus eigenem Grund blind:
Setup liest `.gitignore` nur wegen `.claude/settings.local.json`; `workbench-tracking.md`
wird an keinen Agenten emittiert; und `bin/fusion-staging-drift` stuft genau die zwei
falsch ignorierten Dateien namentlich als `in-flight` ein, also niemals ein Befund. Die
Frage *wurde das committet* und die Frage *wird das getrackt* haben auf diesen zwei
Dateien gegenteilige Antworten, und nur die erste wird gestellt.

**Gefiltert und abgelegt.**

- Defekt: `shared/issues/260825-1019_*_nothing-checks-that-a-tracked-workbenchs-gitignore-matches-the-four-class-partition.md`
- Entscheidung des Nutzers, beantwortet: `shared/decisions/260825-1030_*_does-setup-repair-a-gitignore-that-departs-from-the-four-class-partition.md` — Setup repariert statt zu melden, und die Prüfung gehört zu Setup, nicht zum Archive-Schritt. Begründung des Nutzers: sonst scheitert die Zusammenarbeit.
- Daraus offen: `shared/decisions/260825-1030_*_may-a-project-depart-from-the-four-class-partition-deliberately-and-say-so-once.md` — muss vor dem Bau der Reparatur beantwortet werden, weil die Form der Reparatur davon abhängt.

### Die Anschlussfrage ist beantwortet

Der Nutzer wählte Option 1 mit der Ausnahme: getrennt nach Richtung, und in Richtung B
wird repariert, wo Tracking eine falsche Antwort erzeugt, gemeldet, wo es Rauschen erzeugt.
Heute trifft das genau `.checkout-id`.

Zwei Messungen aus diesem Austausch stehen im Datensatz, weil sie seine Randbedingung
korrigierten: `git check-ignore -q` ist blind für eine getrackte Datei, deren Muster passt,
meldet also *nicht ignoriert*, und eine `.gitignore`-Zeile enttrackt nichts. Eine dritte
Korrektur betraf meine eigene Darstellung: `git rm --cached` lässt die Datei auf der Platte,
das Gewicht der Richtung-B-Reparatur ist keine Datenverlust-Frage.

Der Ausstiegsmechanismus wird nicht gebaut, und das ist das Ergebnis, nicht ein Aufschub:
Setup repariert einen ausgeschlossenen R1-Store nie, also bleibt nichts, wovon ein Projekt
aussteigen müsste. Kein Schlüssel in `fusion.json`, kein zu lesender Zustand.

Ein Residuum steht im Datensatz statt in einer Sonderregel: ein Projekt, das `circles/`
ausschließt und `shared/` trackt, bekommt keine Warnung. Ob Setup einen R1-Ausschluss
wenigstens melden soll, wurde dabei aufgeworfen und bewusst nicht mitentschieden.

Beide Entscheidungsdatensätze stehen jetzt auf beantwortet (`_a_`). Der Defekt
`260825-1019` bleibt offen: er ist die Arbeit, die daraus folgt.
