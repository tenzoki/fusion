# Can fusion be radically simplified, and along which axis

**Domain:** code
**Filed by:** user (hand-written, 260811-0826), split out by playmaker 260814-1733
**Related:** `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`, `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md`

The user's closing question in the original dump, asked twice and in two forms: "Ist Fusion ein
token- und zeitfressendes Monster geworden, das sich nur noch um sich selbst dreht?" and "Wie können
wir fusion radikal vereinfachen?" Beside it stands the observation that gives the question its force
— "Fusion ist dauernd damit beschäftigt, die eigenen Fehler auszubessern. Die produktive Arbeit am
Projekt tritt in den Hintergrund." The idea is that the simplification is not a cleanup pass but a
choice of axis: which whole mechanisms fusion stops carrying, and what it gives up by stopping. Two
analyses already on disk answer it with measurements rather than opinion, so this can be shaped
without new analysis. The first carries a costed removal list and the finding that the binding
constraint is the rate of addition rather than the size of the system; the second names a single
first move — derive the hand-maintained session counters from git and the event log at read time
instead of maintaining them — and puts the saving at up to 28 percent of session time, 43 130 tokens
out of every orchestrator Setup, and roughly 5 400 lines of drift machinery.

Split from `shared/backlog/260811-0826_*_observations.md`.

Promoted: circles/260815-0007-remove-eight-mechanisms-and-cap-growth — eight unused mechanisms leave the shipped plugin, the eight administrative names collapse to setup, cleanup and cadence, and a failing cap is extended to agents/, skills/ and the hook tests.
