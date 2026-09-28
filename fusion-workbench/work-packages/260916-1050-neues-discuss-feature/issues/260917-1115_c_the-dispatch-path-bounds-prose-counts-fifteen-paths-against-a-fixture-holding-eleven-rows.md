# The dispatch-path bound's prose counts fifteen paths against a fixture holding eleven rows

---

`hooks/lib/__tests__/rules-emission-golden.test.ts` says `fifteen` in four places while
`hooks/lib/__tests__/fixtures/dispatch-path.baseline` holds eleven rows and the test itself asserts
set equality between those rows and `agents/*.md`. One of the four sits inside the failure message a
reader sees when the bound fires, so the wrong count is what the instrument says about itself at the
moment somebody reads it.

---
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md

## Evidence

Measured at `f0aa5b77`. `grep -c '^\[' hooks/lib/__tests__/fixtures/dispatch-path.baseline` returns
11. `grep -n fifteen hooks/lib/__tests__/rules-emission-golden.test.ts` returns four lines: the
banner comment, the comment distinguishing level from rate, the failure string reading `puts all
fifteen paths`, and a comment on the shared-component case. The roster fell from fifteen to eleven at
v11.

## The acceptance test

No occurrence of a spelled-out count of dispatch paths survives in that file that a reader could
compare against the fixture and find false. `rules/critical-stance.md` §5 gives the two admissible
forms: name the members, or derive the figure from the thing that holds them. The test already
derives the set through `agentNames()`, so the failure message can read its length rather than spell
one.

## Cost

The file sits on `hooks/lib/__tests__/**.ts`, which stands at zero lines of head-room
(22 068 against a budget of 22 068). A fix that replaces words inside existing lines is line-neutral
and needs no raise; one that adds a line does.

Also seen: 260917-1124 by planner — the same banner comment carries a second false statement, four
lines above the first `fifteen`. It reads "The hard bound above measures the UNIVERSAL CORE", in the
present tense, about the always-on rule bound that was retired on 2026-09-11; that bound now reports
and cannot fail, so no hard bound stands above it. Verified at `f0aa5b77` against
`README-hooks.md` `### Growth bounds on the shipped text`, which records the retirement. Line-neutral
to fix, like the counts.

---
Resolved: no spelled-out count of dispatch paths survives in `hooks/lib/__tests__/rules-emission-golden.test.ts`: the failure message derives the figure from `agentNames().length`, the banner says one path per agent, the level paragraph says a row is set at the event that wrote it (the arming, or the one merge the fixture records) and never follows the cut down, which is true for the `reviewer` row too, and the two present-tense claims that a hard core bound stands above (the banner and the extras test) now say that bound was retired 2026-09-11. In-place line replacement; the file stays at 1 330 lines. The fixture's own "fifteen rows below" is data a test asserts against and is filed for the data executor as `260918-1250_*_the-dispatch-path-baseline-fixture-says-fifteen-rows-below-while-it-holds-eleven.md`. Concept accepted by a consultant read with changes; fixed in the commit that carries this line.
