Arbeitspakete haben jetzt Abhängigkeiten, und der Orchestrator darf wieder an alles

Bevor du an deiner fusion-Installation etwas von Hand einträgst: der Orchestrator
hat keine Werkzeugliste mehr und erbt alles von der Sitzung, MCP-Server
eingeschlossen. Ein lokaler Flicken ist damit unnötig und wird beim nächsten
Update ohnehin überschrieben. Agenten dürfen einander jetzt aufrufen; stößt einer
dabei auf etwas Zustimmungspflichtiges, hält er an, ein Analyst stellt fest ob es
wirklich vorliegt, und nur dann wirst du gefragt. Ein Arbeitsposten hat zwei
Kopffelder mehr Bedeutung als vorher, und `./bin/fusion-work-order` zeigt dir
Reihenfolge, Startbereitschaft und Zyklen, ohne irgendetwas zu speichern.

A work item's `**Depends-on:**` now asserts one relation only, the named item
reaching a terminal state first; every other citation goes in the new
`**Cross-references:**` field. `/fusion:migrate` writes neither on a guess.
The `bin/` roster left `CLAUDE.md` for `README-hooks.md`, which took 28 548
bytes off every dispatch path. Records: 260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md,
260911-2237_*_where-does-the-bin-helper-roster-belong-when-a-third-of-claude-md-is-pointers-charged-eleven-times.md,
260913-0818_*_the-new-cross-references-field-has-two-unswept-consumers-and-one-is-a-safety-filter.md (open, high).
You need not re-measure the surfaces or re-read the test corpus: both are in the
commit messages, and the cut that paid for the new test is already applied.
