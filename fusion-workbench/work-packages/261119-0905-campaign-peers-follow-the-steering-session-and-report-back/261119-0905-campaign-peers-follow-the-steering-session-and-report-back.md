# Campaign peers follow the steering session, and their results and questions come back to it

## Directive

The user's words, verbatim (2026-11-19):

> ok, lege die prior integration zur seite.
> wir machen ein patch release: mir ist aufgefallen, dass bei einer campaign die abhängigen fusion instanzen die anweisungen des zentralen orchestrators nicht ohne weiteres akzeptieren, auch kommen die ergebnisse nicht immer beim zentralen orch. an.
> - das erste problem hängt damit zusammen, dass die peers der zentrale nicht vertrauen: sie fordern mich auf zu intervenieren. Im autonomen modus (wenn die zentral autonom läuft) sollte, die übergabe verbindlich sein und der peer den auftrag ausführen.
> - das zweite problem ist wahrscheinlich komplexer: es gibt zwei kommunikationswege: pipes (wenn die peers auf der gleichen maschine sind und fusions git news (geht immer). Der Weg über die Pipes ist schneller und direkter, der andere funktioniert bei verteilten rechnern. für den zweiten weg müssen die zentrale das git überwachen.
> wir müssen klären, wie wir die beiden probleme lösen. meine erwartung ist, das fusion eine kampagne steuern kann. wenn ein peer nicht im automode ist oder eine unentscheidbare  rückfrage hat, dann sollte die an die zentrale geleitet und dort beantwortet werden. generell sollte eine kampagne also von der zentrale steuerbar sein.

## Ground

- Analysis `261119-0737-campaign-steering-binding-handover-and-the-route-back.md`.
- Decision `261119-0851-how-does-a-campaign-steer-its-peers-and-get-their-results-and-questions-back.md`. It records three rulings:
  - The user answers a peer's question in the steering session, and the record carries the answer back.
  - The steering session polls the upstream while its session is open.
  - The release is a minor one, 13.6.0, which supersedes the "patch release" of the directive.
