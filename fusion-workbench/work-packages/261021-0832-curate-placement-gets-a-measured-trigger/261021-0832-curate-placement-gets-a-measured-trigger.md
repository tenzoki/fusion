# Whether `/fusion:curate` should include placement without the user typing `--placement` when a CLAUDE.md is over threshold

## Directive

Filed on the user's word of 2026-10-21 in chat: "Mach daraus ein Paket für später. Wir lassen es vorläufig bei der Meldung und dem Schalter." Until this package is worked, fusion stays as package `261020-0917-consumer-claude-md-stays-lean` left it: a session start names an over-threshold `CLAUDE.md` (the notice), and `/fusion:curate --placement` is the opt-in that asks for relocations (the switch).

The question is the open decision `261021-0821-should-fusion-curate-turn-placement-on-by-itself-when-the-weight-helper-measures-a-section-over-threshold.md`, filed in that package's decision store: keep the opt-in, switch placement on automatically when `bin/fusion-claude-md-weight` reports `over > 0`, or ask once per run. One point found after the decision was filed bears on it. The helper's header defines its 4000-byte threshold as a chosen *reporting cut-off* that "never decides what must move". The automatic option makes that cut-off something that changes behaviour, so choosing it also means overturning that definition, ruled at `260916-1126_*_may-the-drift-check-report-weight-when-it-cannot-decide-topic.md`. This makes the ask-per-run option relatively stronger.

Reached when: the decision is answered and the answer is realised, or the opt-in is confirmed as final with the reason recorded. Motivating evidence: krk's `CLAUDE.md` (179 260 bytes, six sections over threshold, the largest 124 103 bytes), and the analysis `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`.
