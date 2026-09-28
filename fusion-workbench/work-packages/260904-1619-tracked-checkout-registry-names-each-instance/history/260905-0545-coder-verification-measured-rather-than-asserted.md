# coder — verification, measured rather than asserted

**Date:** 2026-09-05
**Status:** Complete
**Agent:** coder
**Circle:** 260904-1619-tracked-checkout-registry-names-each-instance
**Plan:** `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 13
**Files changed:** none. This step runs commands and records their output.

Run at working-tree HEAD `9b488aac`, in checkout `5e8248d7`, `Kai Stalmann <ks@qantr.com>`.

## 1. `cd hooks && npm run build && npm test`

Build: clean, no output beyond the script banner.

Test tally, verbatim:

```
 Test Files  1 failed | 47 passed (48)
      Tests  1 failed | 824 passed (825)
   Start at  05:26:44
   Duration  40.87s (transform 912ms, setup 0ms, collect 3.29s, tests 172.94s, environment 12ms, prepare 4.17s)
```

Exit code `1`. One failing suite, by name:

```
 FAIL  lib/__tests__/citation-sweep.test.ts > citation-sweep over fusion's own tree > --dry-run over this repository's workbench reports rewrites=0
```

It is the suite already filed as
`260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`
and verified red at this session's start commit `cda72f71`. `monitor-warnings-panel.test.ts`
did not fire.

**No growth-bound baseline was edited.** Measured, not asserted:
`git diff --stat v10.20.0..HEAD -- hooks/lib/__tests__/helpers/ hooks/lib/__tests__/rules-emission-golden.test.ts hooks/lib/__tests__/surface-growth-bound.test.ts`
prints nothing. So step 13's acceptance is met in its second half and not in its first: the
honest reading is **green except one, and that one was inherited.**

### What the census says that the filed issue could not yet say

The issue records `files=12 rewrites=17` at `cda72f71` and leaves open which of two causes
applied — a non-idempotent sweep, or a corpus carrying citations nobody swept. Today's
dry-run over the same tree:

```
files=8 rewrites=15 residual=2796 record=0 circle-record=0 circle-dir=0 bare-record=15 stamp-bare=0 mode=dry-run
```

Every one of the 15 is `bare-record`, and the `bare-record` rewrite is one line of
`hooks/citation-sweep.ts`: a citation carrying a literal state marker becomes the wildcard
(`_o_` → `_*_`). So the cause is the **corpus**, not the sweep — nothing here is a rewrite
the sweep itself produced.

Seven of the eight files are **this Circle's own history records**, each citing the plan with
a literal `_o_` in the marker slot where the storeless grammar wants the wildcard `_*_`:

```
circles/260904-1619-tracked-checkout-registry-names-each-instance/_t_circle.md                              rewrites=1
…/history/260904-1908-coder-layout-tree-and-four-class-partition.md                                         rewrites=1
…/history/260904-2029-coder-presence-canonicalisation.md                                                    rewrites=1
…/history/260904-2110-coder-setup-registers-this-checkout.md                                                rewrites=1
…/history/260904-2119-coder-setup-registers-this-checkout.md                                                rewrites=1
…/history/260904-2128-coder-sessionstart-exports-fusion-alias.md                                            rewrites=1
…/history/260904-2130-coder-monitor-header-carries-the-checkout-name.md                                     rewrites=1
shared/history/260904-1636-playmaker-direct-dispatch.md                                                     rewrites=8
```

Nothing was repaired here. Step 13 measures; the repair belongs to the open issue, whose
acceptance this measurement answers.

## 2. `bin/fusion-citation-check`

Exit `0`. Header, verbatim:

```
anchor=workbench-root
root=.
files=1771
tokens=17854
judged=14162
resolved=13730
dangling=247
store-prefixed=0
undecidable=2346
exempt=1531
verdict=violations
```

`store-prefixed=0`: no citation anywhere in the corpus carries a store segment. The 247
danglers are the long-standing archive and stale-marker residue, 250 detail lines in all,
and none of them is a store-prefixed shape. The helper reports and never gates.

## 3. `bin/fusion-review-coverage --since v10.20.0` — the release precondition

Exit `0`. This is the clause in `## Where this Circle stops` that the tag may not be pushed
without. It reports a gap, and the clause requires the gap to be **visible before the tag**,
not absent:

```
anchor=workbench-root
since=v10.20.0
head=HEAD
commits=16
reviews=87
unusable=24
uncovered=16
verdict=uncovered
```

All 16 commits in the range are uncovered, this Circle's nine feature and documentation
commits among them. Advisory, not a gate. The gap is now stated in the session log, which
is what the precondition asks for.

## 4. `claude plugin validate .`

Exit `0`, verbatim:

```
Validating plugin manifest: /Users/k1/Projects/productive/fusion/.claude-plugin/plugin.json

Validating plugin: /Users/k1/Projects/productive/fusion/CLAUDE.md

⚠ Found 1 warning:

  ❯ root: CLAUDE.md at the plugin root is not loaded as project context. To ship context with your plugin, use a skill (skills/<name>/SKILL.md) instead.

✔ Validation passed with warnings
```

Passed. The warning is the standing one about this repository's own `CLAUDE.md` and is not
this Circle's.

## The two readings that are this Circle's claim

### How the fixture was built, so a reader can repeat it

The live store was never touched: `fusion-workbench/shared/checkouts/5e8248d7.md` is
byte-identical to `HEAD` (`md5` of the working file equals `md5` of `git show HEAD:` — both
`5af05409b88de3013a8d349518ab7c88`). Everything below ran in a throwaway tree at
`<scratch>/presence-fixture`:

```sh
git init -q .
git config user.name "Kai Stalmann"; git config user.email "ks@qantr.com"
printf '{"setup_at":"…","plugin_version":"10.22.0"}\n' > fusion-workbench/.fusion-setup
printf 'aaaaaaaa\n' > fusion-workbench/.checkout-id
```

Three `session_start` lines in `fusion-workbench/orchestrator-events.jsonl`, all inside the
seven-day window: the reader's own (`aaaaaaaa`, `Kai Stalmann <ks@qantr.com>`), and two
others carrying **two distinct git identities**, `Jane Roe <jane@example.com>` on checkout
`bbbbbbbb` and `J. Roe <jane@corp.example>` on `cccccccc`.

Every invocation ran the work tree's `bin/fusion-events` under
`env -u FUSION_PERSON -u FUSION_CHECKOUT`, so the identity is derived from the scratch tree
rather than inherited from this session's SessionStart export.

The entries were written by the store's only writer, not by hand — `.checkout-id` and the
git configuration were set to each checkout in turn and
`bin/fusion-checkout-name register --person "Jane Roe"` was run, then both were restored to
the reader's.

### Reading A — the store absent

`ls fusion-workbench/shared/checkouts` → `No such file or directory`. Exit `0`, stderr empty.

```
window_days=7
scope=pulled
other_people=2
other_checkouts=0
party=person	J. Roe <jane@corp.example>	cccccccc	2026-09-04T10:00:00	260901-1200-alpha	-
party=person	Jane Roe <jane@example.com>	bbbbbbbb	2026-09-03T09:00:00	260901-1200-alpha	-
```

### Reading B — two entries mapping two git identities to one person

`shared/checkouts/bbbbbbbb.md` and `shared/checkouts/cccccccc.md`, each carrying
`**Person:** Jane Roe` and its own `**Git identity:**`. Exit `0`, stderr empty.

```
window_days=7
scope=pulled
other_people=1
other_checkouts=0
party=person	J. Roe <jane@corp.example>	cccccccc	2026-09-04T10:00:00	260901-1200-alpha	ivory-marsh
party=person	Jane Roe <jane@example.com>	bbbbbbbb	2026-09-03T09:00:00	260901-1200-alpha	plum-tarn
```

### The claim holds, and the acceptance criterion as written is too tight by one field

`other_people` moves 2 → 1: two git identities registered to one person count as one person.
That is the Circle's claim and it is measured, not asserted.

A `diff` of the two readings shows a **second** difference the criterion's "and in nothing
else" does not allow for: the sixth `party=` field goes `-` → `ivory-marsh` / `plum-tarn`.
That is not a side effect of the join. It is the alias rendering this same Circle added, and
`bin/fusion-events`'s own header specifies it — "the alias the checkout registry holds for
that checkout, or `-` where it holds none". Reading A has no store, so it can only print
`-`; any reading B with a store must print the alias whether or not the join happens.

So the criterion as written cannot be met by that pair, for a reason that has nothing to do
with the mechanism under test. A **control reading** separates the two effects. Same fixture,
same two entries, one field changed — `cccccccc`'s `**Person:**` re-registered as
`Robin Fell`, so the store is present and the join does not happen:

```
window_days=7
scope=pulled
other_people=2
other_checkouts=0
party=person	J. Roe <jane@corp.example>	cccccccc	2026-09-04T10:00:00	260901-1200-alpha	ivory-marsh
party=person	Jane Roe <jane@example.com>	bbbbbbbb	2026-09-03T09:00:00	260901-1200-alpha	plum-tarn
```

`diff` against reading B, in full:

```
3c3
< other_people=2
---
> other_people=1
```

**One line. `other_people` and nothing else.** With the store held fixed and only the
`**Person:**` field deciding whether two git identities join, the criterion holds exactly as
written. The alias delta between A and B is the store's presence, not the canonicalisation.

Three further properties the readings carry, each read off the output above rather than
inferred: `other_checkouts` stays `0` in all three, so no line was reclassified between the
checkout class and the person class; both `party=` lines survive the join, because a party is
a person-and-checkout pair and the join collapses persons, not pairs; and `scope=pulled` and
`window_days=7` are constant.

## What a later step has to act on

1. **`npm test` is not green.** Step 13's acceptance is half met. The failure is inherited and
   filed, and this entry now names its cause (the corpus, not the sweep) and its eight files.
   Seven of them are this Circle's own records and each is a one-token fix.
2. **The review range is fully uncovered** — 16 of 16 commits. Recorded, as the precondition
   requires; whether a reviewer opens the range before the tag is the user's call.
3. **The plan's acceptance wording for step 13 is too tight by one field**, for the reason
   above. The mechanism is correct; the criterion needs the control pair, or the phrase "in
   `other_people` and in the alias field the store's presence renders".
4. **An untracked file appeared during this step** — one artifact in the shared consult store,
   stamped `260905-0529`, on consumer findings about citation form and decision authority,
   written at 05:30, after the test run had finished. Nothing in step 13 wrote it. Named here
   rather than explained; it is not this step's product. The name is spelled as a description
   and not as an address, so this entry adds no citation of its own.
