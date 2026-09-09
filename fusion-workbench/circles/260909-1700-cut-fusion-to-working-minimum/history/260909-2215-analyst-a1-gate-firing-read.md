# Step A1: counted how often each gate scheduled for removal actually fired

**Status:** Complete
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

**Asked.** Step A1 of `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`: measure, per gate the cut removes, whether it ever fired and how often, scoped by checkout, with the denominator stated beside every numerator and the command named for each pair. Report a gate with no row kind as unmeasurable rather than as zero, and put every gate above half its population in the analysis head as returns to the user.

**Done.** Read three event logs in full: fusion at `e8dbeb74` (3 289 lines), krk at `7f692708` (2 419), unite-co-creator at `e337da91` (3 886). Excluded `/Users/k1/Projects/productive/fusion-news` as a second clone of the fusion repository rather than a fourth project. Scoped fusion and krk by their own `.checkout-id` with an absent identifier read as the reader's own; unite-co-creator holds no `.checkout-id`, so its figures are whole-file and labelled `scope=all-checkouts`. Wrote `260909-2215-gate-firing-read-before-the-cut.md`.

**Result.** Two entries on the returns-to-the-user list: the per-Turn Coherence gate, above half in all three projects (87/94, 54/57, 112/120), and the Rebalance gate's four moves together in krk alone (29/57). The circuit breaker fired 8 times in 94 fusion sessions, and the eight are enumerated by condition. Three of the six named gates emit no row of any kind and are reported unmeasurable: the convergence check, the review-coverage read and the interrupted-session resume.

**Verified.** Every gate figure was re-taken against the working tree at the end of the pass and none had changed. The per-checkout scoping reproduces the prior measurement in `260827-1210_*_do-the-rare-orchestrator-flows-stay-in-every-sessions-context.md`: its five figures at an 83-session population have each grown or held, none shrunk. The malformed-line count agrees with `bin/fusion-events`, which reports 4 on stderr in the unite tree. `bin/fusion-citation-check` reads `verdict=clean` with none of the four new files in the violation list; `bin/fusion-prose-metric` reads 0 em-dashes over 3 366 prose words.

**Filed.** Three defects: `260909-2215_o_the-plans-current-state-says-every-removed-gate-has-its-own-row-kind-and-three-of-six-have-none.md` and `260909-2215_o_step-a1s-denominator-names-a-field-eleven-rows-carry-and-the-plans-own-figure-uses-ninety-four.md` in the Circle, `260909-2215_o_four-truncated-lines-make-a-streaming-jq-read-of-the-event-log-stop-at-forty-percent.md` in the shared store.

**Not done, deliberately.** No design proposed, no plan or spec edited, nothing deleted. Two questions are left to the user and named in the analysis: which quantity the head list protects, and whether a gate protected in a consuming project binds fusion's own cut.
