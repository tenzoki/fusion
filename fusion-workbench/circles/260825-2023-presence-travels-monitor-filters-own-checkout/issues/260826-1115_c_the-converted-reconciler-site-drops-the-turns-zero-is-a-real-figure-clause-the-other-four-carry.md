# The converted reconciler site drops the "`turns=0` is a real figure" clause the other four carry

---
`6deeb33` routed `agents/reconciler.md:21` through `bin/fusion-events turns`, the fifth site to read
the one implementation. Four of the five state both halves of the degradation rule: report
`unavailable` rather than `0` when the figure could not be taken, **and** `turns=0` is a real figure
when it could. The reconciler states the first half only, and its wording — "never as `0`" — is the
half that inverts when read alone.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low. The sentence is not wrong: "Report it as `unavailable` whenever the helper is
absent or prints no `scope=checkout` line, never as `0`" scopes the prohibition to that condition. It
is the one of the five that can be misread into refusing a genuine zero, and a reconciler that
reports "unavailable" for a session that stopped before its first Turn is reporting an unknown where
a measured figure exists.

**Cross-references:**
`260826-0906_*_a-fifth-turn-count-definition-site-still-reads-the-whole-file-and-names-no-implementation.md`
(the record `6deeb33` closed).

## What is there

`agents/reconciler.md:21`, the converted clause:

> Report it as `unavailable` whenever the helper is absent or prints no `scope=checkout` line, never
> as `0` and never as a `scope=all-checkouts` number.

`agents/orchestrator.md:107` and `skills/setup/SKILL.md:394`, verbatim in both, closing the same
rule:

> `turns=0` is a real figure: the log was read and the session stopped before its first Turn.

The helper agrees with the four: `bin/fusion-events turns` prints `turns=0` with `scope=checkout` on
a session that has emitted no `turn_start`, and exits 0.

## Fix direction

Add the clause, or reword so the prohibition cannot detach from its condition — "any other outcome is
`unavailable`; a `turns=0` printed with `scope=checkout` is a real figure". The `agents/` growth bound
is the constraint on which form fits.

Resolved: `agents/reconciler.md` now states the rule in the order that cannot detach: a `turns=0` printed with `scope=checkout` is a real figure, every other outcome is `unavailable`, and the `scope=all-checkouts` number is never reported. The count of sites is one fewer than this record says: `440cad5` removed the `skills/setup/SKILL.md` site (it points at `rules/orchestrator-resume.md`, where the orchestrator's Setup-step-1 text also moved), so the sites reading `bin/fusion-events turns` are four: `rules/orchestrator-resume.md` Step 1, `agents/orchestrator.md` Phase 2 step 3 and its `progress.turn` table row, and the reconciler. Of those, the rule file and the reconciler carry the degradation rule with both halves; the two orchestrator sites state the definition and no degradation rule, which is not a defect since the rule file is what a resume reads.
