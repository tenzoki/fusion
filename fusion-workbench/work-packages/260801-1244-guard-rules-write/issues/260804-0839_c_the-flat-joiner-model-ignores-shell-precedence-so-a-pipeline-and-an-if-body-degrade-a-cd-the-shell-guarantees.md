# The flat joiner model ignores shell precedence, so a pipeline and an `if` body degrade a `cd` the shell guarantees

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, Turn 7 review of `260801-1244-guard-rules-write` (`048f3db..c9c44a3`)
**Affects:** `hooks/lib/bash-mutation-guard.ts:2465`; `hooks/lib/shell-parse.ts` (`SegmentJoiner`)
**Kind:** REGRESSION introduced by `c9c44a3` — all rows allowed at `048f3db`.
**Cross-references:**
`260804-0837_*_…pipeline…` (the *under*-deny half of the same precedence gap — both must
be fixed together or `cd hooks && npx tsc | tee log` cannot come out right),
`260804-0838_*_…newline…`, `260804-0840_*_…cost-table…`.

---

## What is wrong

`SegmentJoiner` is a flat list of separators. The shell's reachability rules are not
flat: `|` binds tighter than `&&`, and a compound command's body is reached on a
condition the separator does not express. The degrade fires for any joiner that is not
literally `&&`, so it fires for constructs where the shell **does** guarantee the `cd`
succeeded.

Three families, all `allow → DENY`:

**A pipeline inside an `&&` chain.** `A && B | C` is `A && (B | C)`. The `&&` guarantees
`A`; the `|` does not reach past it.

```
  allow -> DENY   cd hooks && npx tsc | tee typecheck.log
  allow -> DENY   cd hooks && cat a | tee b.log
```

Verified in both shells that the write lands where the model originally said:

```
$ mkdir -p hooks
$ bash -c 'cd hooks && echo hi | tee out.log >/dev/null'   # creates hooks/out.log
$ zsh  -c 'cd hooks && echo hi | tee out.log >/dev/null'   # creates hooks/out.log
```

**A conditional body.** `then` and `do` are reached only when the condition succeeded.

```
  allow -> DENY   if cd build; then rm out.js; fi
  allow -> DENY   while cd build; do rm out.js; done
```

(`until cd build; do rm out.js; done` degrades **correctly** — the body runs when the
`cd` failed — so the family is not uniform and a blanket exemption for grammar words
would be wrong.)

**A brace group.** `{ cd build; } && rm out.js` — the group runs in the current shell
and the `&&` guarantees it.

```
  allow -> DENY   { cd build; } && rm out.js
```

The deny reason in each case names `&&` as the way through, which is not available
inside an `if` body and is already present in the pipeline rows. Same unactionable-remedy
problem as `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md`, at lower frequency.

## Recommended fix

Two separable steps; the first is small and closes most of the cost.

1. **`|` inherits the previous segment's conditionality rather than resetting it.** A
   `|`-joined segment is part of the same pipeline as the segment before it, so for the
   purpose of "was this reached unconditionally" it should carry the previous segment's
   joiner. Paired with `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md` (a `cd` in a pipeline does not move the shell), the
   pair gives the right answer on both sides.
2. **`then` / `do` after a directory builtin in the condition.** Lower value and more
   parsing. `until` is the counterexample that makes a blanket rule wrong. Consider
   leaving this one as a stated cost instead — but state it, which is `260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md`.

## Anti-vacuity

Pin `cd hooks && npx tsc | tee typecheck.log` as an allow and `cd hooks; npx tsc | tee
typecheck.log` as a deny in the same test, so the fix cannot be a blanket exemption for
`|`. Keep `until cd build; do rm out.js; done` pinned as a deny.

---
**Costed in a design record (T8-1, 2026-08-04), not implemented.** Measured: 84 of 84
generated `if cd X; then W; fi` / `while cd X; do W; done` / `{ cd X; } && W` /
`cd X && Y | tee log` rows deny today. `until cd X; do W; done` is the counter-example that
keeps an implementation honest — its body runs when the `cd` FAILED, so its 12 generated
rows must keep denying. Only option 2 of
`260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`
(model the and-or list) closes this; the cheap option 1 does not, measured identically
before and after. Three of these shapes are now named in the cost illustrations of
`rules/protected-path-discipline.md` as over-denies, so an agent meeting one knows it is a
cost rather than a hazard.

---

**Reconciliation 260804-1021-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Confirmed live at HEAD, and it is the one regression this session caused and did not close.**

The four shapes still deny at HEAD `cc012fc`: `if cd hooks; then rm -rf dist; fi`, `while cd build; do rm out.js; break; done`, `{ cd build; } && rm out.js`, and a pipeline stage after a `cd`. All allowed at `048f3db`. `c9c44a3` introduced it.

**Regression accounting for this session, recorded here because this file is the survivor.** Two of the five code commits in `6c447eb..cc012fc` introduced regressions:

| Commit | Introduced | State at HEAD |
|---|---|---|
| `9aacab5` (Turn 5) | `260803-2236_*_runsbuiltins-is-asserted-about-a-name-so-the-model-now-moves-the-shell-where-the-shell-did-not-move.md` — eleven measured rows flipped deny to allow | closed by `048f3db` and `cc012fc` |
| `c9c44a3` (Turn 7) | `260804-0838_*_a-newline-after-and-is-downgraded-to-newline-so-a-multi-line-and-chain-denies-with-an-unactionable-reason.md` (behaviour), **this issue** (behaviour), `260804-0840_*_the-shipped-cost-statement-five-shapes-and-nothing-else-measured-moved-is-false-in-every-agents-context.md` (accuracy), `260804-0841_*_the-supersession-inverts-the-fact-the-original-argument-rested-on-curl-o-rules-x-md-allows.md` (accuracy), `260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md` (new coverage gap) | 0838, 0840, 0841 closed by `cc012fc`; **this one and 0842 open** |

Five regressions plus one new coverage gap, four closed within the session, two open. The Turn 7 review's headline — zero commands allow at HEAD that denied at `048f3db`, across 222,319 generated commands — is true and is about the **security** direction only. Turn 7 opened no hole; it cost accuracy and over-denied. Both statements are true and the second is easy to lose behind the first.

**Why this one matters more than its Medium severity suggests.** It is not a hazard, it is a cost, and it is a cost an agent meets on ordinary work: `cd hooks && npx tsc | tee typecheck.log` is a command a coder writes without thinking. `rules/protected-path-discipline.md:254-258` and its illustration block now name three of these shapes as over-denies, so an agent meeting one can tell it is a cost rather than a hazard — which is the mitigation, and it is the right one while the fix waits on `260804-0947_*_`. Only option 2 of that decision closes this; option 1, the cheap one, measures identically before and after.

---

**Step 3 disposition (coder, 2026-08-05) — branch B, the gap written down. STAYS `_o_`, and is answered in another Circle.**

Not fixed here, and this Circle is not where it gets fixed. `260804-0947_*_…`
already established that only its option 2 — model the and-or list — closes this, and that
model is the Directive of `260804-1205-shell-reachability-model`.

**The residual entry was already standing** and needed no new prose: it travelled with its
section in step 2 and is now in
`260805-0717-protected-path-forensics.md` § 1, under "One honest edge, still open,
and it costs rather than leaks", with the `until cd X; do W; done` counter-example that
keeps any implementation honest. What was added is the routing — the entry now names the
Circle that answers it, so a reader arriving at the residual does not have to reconstruct
that from a decision record.

**What changed for the better is the reach.** Before this step the mitigation this issue's
reconciliation identified as the right one lived only in the illustration block, which after
step 2 no agent loads. The core rule now names the shape in its closing pointer: a
conditional body, a loop body, a brace group and a pipeline stage give the directory up
although the shell guarantees the `cd`, and this costs a deny rather than leaking one. So
an agent meeting `cd hooks && npx tsc | tee typecheck.log` still learns from the file it
actually carries that it has met a cost and not a hazard.

**Counted once.** This finding stays in this Circle's issue store; the reference to
`260804-1205` is a citation, not a move — the Origin Rule's second corollary, reach is
cited, never placed.

---
Resolved: Der beschriebene Über-Verweigerer existiert nicht mehr, und zwar weil die Verweigerung selbst entfallen ist. Die betroffene Stelle `hooks/lib/bash-mutation-guard.ts:2465` liegt in einer mit `ba7ccda` gelöschten Datei; `SegmentJoiner` kommt in `hooks/lib/shell-parse.ts` nicht mehr vor (in der Reconciliation 260807-1515 gegen HEAD `e684eae` gegrept, kein Treffer außerhalb `hooks/dist/`). Auf der Shell verweigert der Guard seit v6.0.0 gar nichts mehr vor der Ausführung; die vier Befehlsformen dieses Befunds (`cd hooks && npx tsc | tee typecheck.log`, `if cd hooks; then rm -rf dist; fi` und ihre Geschwister) laufen durch. Geschützte Pfade werden nach dem Aufruf gemessen und zurückgeschrieben. Der Befund ist damit nicht gelöst, sondern gegenstandslos — das ist die ausdrückliche Folge der Entscheidung `260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`, Option 3, deren Datenlage dieser Befund mitgetragen hat.
