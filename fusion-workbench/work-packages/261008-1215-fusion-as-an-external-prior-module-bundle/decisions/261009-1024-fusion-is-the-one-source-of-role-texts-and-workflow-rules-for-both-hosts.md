Fusion is the one source of role texts and workflow rules for both hosts
---
Does Prior keep a fusion role catalog of its own, or does it load and execute role definitions and workflow rules that fusion authors?
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261009-0644-host-parity-claude-and-prior.md (the analysis that asked it), Prior `docs/design/fusion-dual-host-implementation-plan.md:303` and `:460` (FH03, shared role/workflow authoring), 261008-1215-fusion-as-an-external-prior-module-bundle.md

## Context

The host-parity analysis of 2026-10-09 found that only the data layer (codec, schemas, workbench format) is shared between Claude Code and Prior. The method runs on Claude alone: 11 agent prompts, skills and hooks. Prior carries its own embedded catalog of 17 one-line role descriptions and 9 Go workflows, whose names do not map onto fusion's. The analysis named one ruling as the gate for parity of method: whether Prior's role texts are generated from fusion's agent prompts or kept as a second catalog.

## Ruling

The user ruled on 2026-10-09, in the user's words:

> Fusion soll die gemeinsame Quelle für Rollentexte und Arbeitsweise sein. Prior soll diese Definitionen laden und ausführen. Einen unabhängig gepflegten fachlichen Fusion-Katalog in Prior sollten wir nicht fortführen.
>
> Diese Richtung steht bereits im Dual-Host-Plan, FH03 (docs/design/fusion-dual-host-implementation-plan.md:460). Die Entscheidung ist also beschrieben, aber noch nicht umgesetzt und offenbar nicht ausreichend klar übergeben.
>
> Dabei sollte Fusion aus seinen bestehenden Agenten-Prompts gemeinsame Rollenbeschreibungen herauslösen und daraus beide Ausgaben erzeugen:
>
> Gemeinsam in Fusion gepflegt: Rollenauftrag, fachliche Regeln, Review-Kriterien; Rollen-IDs, Eingaben und Ergebnisse; Arbeitsschritte, Übergaben, Abschlussbedingungen.
> Je Host angepasst: Werkzeuge und Aufrufmechanik; Berechtigungen und Freigaben; Hooks, Slash-Befehle, Wiederaufnahme und Abrechnung.
>
> Prior behält einen technischen Katalog installierter Rollen samt Versionen und Berechtigungen. Dessen fachliche Inhalte stammen jedoch aus dem Fusion-Paket. Unterschiede bei heutigen Rollennamen werden ausdrücklich zugeordnet; fehlende Rollen werden ergänzt.
>
> Gemeinsame Prompts allein reichen allerdings nicht. Wenn Fusion einen Review verlangt, Prior aber durch seinen eigenen Go-Workflow einen anderen Abschluss zulässt, bleibt die Arbeitsweise verschieden. Deshalb müssen auch fachliche Ablaufregeln Fusion gehören. Prior stellt die Ausführung bereit und erzwingt seine Laufzeitbedingungen.
>
> „Genauso" bedeutet dabei: gleiche fachliche Aufgaben, Übergaben und Qualitätsanforderungen. Bedienung, technische Durchsetzung und einzelne Modellergebnisse können sich unterscheiden.
>
> Der nächste Umsetzungsschritt ist damit klar: Fusion liefert einen gemeinsamen Rollenkatalog samt ausführbarem Workflow; Prior ersetzt dafür seine eingebetteten Fusion-Definitionen. Zuerst weisen wir das mit dem Explorer nach, anschließend mit einem vollständigen Reparaturablauf aus Implementierung, Review und Zustandsprüfung. Erst dieser Nachweis schließt die von dir benannte Integrationslücke.

## What it binds

- Fusion authors the host-neutral part of every role (mission, domain rules, review criteria, role ids, inputs and outputs) and of every workflow (steps, hand-overs, completion conditions), extracted from today's `agents/*.md`, and generates both host outputs from it.
- Each host adapts only tools and invocation, permissions and approvals, hooks, slash commands, resumption and accounting.
- Prior keeps a technical catalog (installed roles, versions, permissions) whose domain content comes from the fusion package; today's name differences (e.g. `code-reviewer`, `explorer`) are mapped explicitly, missing roles added.
- "The same way" means the same tasks, hand-overs and quality requirements; operation, technical enforcement and individual model results may differ.
- Proof order: the explorer first, then a full repair flow of implementation, review and state audit. Only that proof closes the integration gap.
- The work belongs to the module-bundle package `261008-1215-fusion-as-an-external-prior-module-bundle`, after 13.0.0's release acceptance (FJ05), which this ruling does not extend.

---
Answered: this record — fusion is the one source of role texts and workflow rules; Prior loads and executes them, its own fusion catalog is not continued; ruled by user, Kai Stalmann <ks@qantr.com>
