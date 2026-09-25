# Code review — the release range and the fix behind it, Turn 4

**Date:** 2026-08-17
**Sender:** coderev
**Reviewed-range:** `1d1d3a3..01932d6`
**Not-opened:** `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`
**Circle:** `260816-1741-guard-becomes-observation-only`
**Plan under review:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md`, steps 10 to 16, plus the post-release fix

## Summary

The twelve commits after `1d1d3a3` are the strongest stretch of this Circle. The release surfaces
are coherent, the growth baselines moved for exactly the reason they claim, the compiled tree is
byte-identical to a fresh build, and the suite is green at 653 tests. Five new defects come out of
the pass and none of them asks for a change to the release itself. **Nothing blocks the v10.0.1
patch.** One finding must ride *inside* it: `01932d6` makes a sentence in
`docs/upgrading-to-v10.md` false, so shipping the fix without that edit ships a patch that
contradicts its own migration note.

The dominant pattern has moved once more. Turn 1's was *a step reasons about a symbol's last
consumer and the consumer is somewhere the step never grepped*; Turn 2's was *the executor's
departure is recorded and the plan's instruction text is not*. Turn 4's is **a sweep opens a file,
edits the line it was sent for, and does not read the rest of it** — findings A, C and D are three
instances, and A is in a file the sweep did open.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 2 |

All five are filed in this Circle's issue store under the Origin Rule. Nothing went to `shared/`.

## What was verified and holds

Stated because a review that only lists defects leaves the reader unable to tell a checked claim
from an unchecked one.

**1. The growth baselines moved for the written-down reason, and the two refusals are arithmetic.**
Measured from git at the four commits the file names, summing `agents/*.md` and `skills/*/SKILL.md`
blob sizes:

```
                 0609945(arming)   3d41d4a    5763550     HEAD
agents/*.md          399 843       405 229    405 031    405 588
skills/*/SKILL.md    220 439       226 897    229 784    229 924
```

Every figure in `e489133`'s commit message and in the new `## The cleanup re-baseline, 2026-08-17`
section reproduces exactly: `agents/` −198 through the Circle, `skills/` **+2 887**, and pre-Circle
growth of 5 386 and 6 458 against the arming. So the two refused baselines were refused because
their surfaces grew, not to make a red bound green — the opposite of the failure the instrument
exists to refuse. At HEAD `skills/` stands at 9 485 of 20 000 head-room, which is the 47 per cent
the commit names and the reason it filed `260817-1032_*_two-of-the-three-bounded-surfaces-grew-through-this-circle-so-only-the-hook-tests-baseline-moves.md`.

**2. `hooks/dist/` is byte-identical to a fresh `npm run build`.** Checked by copying the committed
tree aside, rebuilding and `diff -r`. This matters more than usual: `install.sh` ships the committed
`dist` and the tarball must be runnable with no `npm`.

**3. `npm test` is green at HEAD.** 35 files, 653 tests, exit 0. The reference-resolution baseline
(`paths 1120, anchors 139, records 94`) and the four growth bounds all pass, and each baseline move
in `reference-resolution-lint.test.ts` carries a per-file measurement of what moved it.

**4. The four version surfaces and the fifth thing are coherent.** `plugin.json` 10.0.0,
`marketplace.json` fusion 10.0.0, `install.sh:27` `tags/v10.0.0`, `README.md:26` `tags/v10.0.0`. The
two prose descriptions — the manifest's and the marketplace entry's — are **byte-identical**, which
is the surface `CLAUDE.md` warns drifts because two well-formed sentences can disagree where two
version strings cannot. The tag `v10.0.0` resolves to `e331332` and is on the remote.

**5. `docs/upgrading-to-v10.md` gets the ordering right, which is the half that matters.** The
budget is copied across at `### 1` before `rm fusion-guard.json` at `:71`, the reason is stated
("a budget left behind … is not read"), and the never-had-one case is covered at `:80`. The two
checks are complete against what the release removed.

**6. The migration works, measured rather than read.** A scratch project carrying a workbench
marker and a leftover `fusion-guard.json` with `{"orchestrator":{"maxTurns":12}}` and no
`fusion.json`: `bin/fusion-turn-budget` printed `max_turns=5` on stdout and the full retired-file
sentence on stderr. Adding `{"orchestrator": 5, "guard": {…}}` produced two further stderr lines,
the container-shape drop and the retired-key notice. A top-level array produced the non-object
refusal. So the premise behind `01932d6` is real and the widened mandate has something to repeat.

**7. `01932d6`'s two surfaces cannot be read as disagreeing.** `agents/orchestrator.md:132` states
the obligation over *every* diagnostic the loader returned;
`skills/setup/SKILL.md:292` defers to that section and adds only that the diagnostics arrive even
when the budget resolves. Its claim that the loader has exactly two channels is correct:
`grep -rn 'loadConfig'` over `hooks/` returns `guard.ts:149` and `turn-budget.ts:90` and nothing
else, and `guard.ts` writes `{}` with no `systemMessage`, so its advisories reach `events.jsonl`
alone. **A third surface disagrees, and that is finding C.**

**8. No shipped text presents the guard as deciding, except in the two places under finding A.**
Grepped `agents/`, `skills/`, `rules/`, `docs/`, `templates/`, `README*`, `bin/`, `install.sh` and
`.claude-plugin/` for `protectedPaths`, `guard.enabled`, `clear-halt`, `escalation`, `halt`,
`config.example.json` and every "guard blocks / denies" shape, and read each hit in context. Every
survivor outside finding A is explicitly past tense and carries its removal date.

**9. The three hook-source edits in the range are comment-only and each is accurate.**
`guard-state-file.ts` drops `escalation.ts` from its caller list and rewrites the optional-`root`
rationale to say plainly that no live caller passes the default — verified: `isFusionPluginRoot` has
zero non-test callers and `isFusionPluginCwd` no longer exists. `session-start.ts` replaces the
"other fifteen" count with a statement of why no count is written. `hooks-wiring.test.ts` replaces
the protected-path justification for wiring Bash with the configuration-diagnostic one, which is
what `guard.ts:180-186` states at the site.

## Findings by theme

### Theme 1 — a sweep opened the file and read one line of it (3 findings)

**A. The curator and its skill still say a project's guard configuration can deny a write.**
Medium. `agents/curator.md:212` and `skills/curate/SKILL.md:110` both carry the sentence "a write
denied by the project's guard configuration is a `failed` entry". Neither half survives: nothing in
`hooks/guard.ts` denies (`:19-21`, "There is no second verdict"), and `guard` is one of the three
retired top-level keys (`hooks/lib/config.ts:343-351`). The sentence was live at v8.2.0 — the
decision-governed deny covered exactly the paths a curator writes — so this is a subject that was
deleted, not a claim that was always wrong. Neither sweep opened either file: the curator is not a
hooks, configuration or migration surface, and "guard" occurs in those two files only inside this
clause, which names no removed identifier and no removed path, so `reference-resolution-lint`
cannot see it. **This is the Directive's own class of defect, in the agent-facing layer, as a
pair.** Filed as `260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md`.

**C. The Turn-budget helper's authoritative header still scopes its stderr to dropped keys.**
Medium. `bin/fusion-turn-budget:14-16` says "Anything the configuration loader had to drop goes to
stderr … naming the key and why". That is the exact scoping `01932d6` fixed in the orchestrator
prompt, surviving in the surface `CLAUDE.md` designates authoritative for this helper. The stderr
line measured in point 6 above names no dropped key at all — the file was never read.
`hooks/turn-budget.ts:52-57` carries the same framing ("from the layer the dropped key would have
overridden") and `:31-38` names the per-call channel without mentioning that this program prints it
too. The loop at `:92-94` writes every entry and is correct; three surfaces describe its contract
and two describe the old one. Note this is a *different clause* of the same header than
`260816-2124_*_bin-fusion-turn-budgets-header-documents-the-configuration-file-7a-renames-and-no-step-owns-it.md`, whose fix landed at step 11 and did not reach these lines. Filed as `260817-1507_*_the-turn-budget-helpers-authoritative-header-still-scopes-its-stderr-to-dropped-keys.md`.

**D. The archive skill's event-log description names three retired types and omits both live ones.**
Low. `skills/archive/SKILL.md:130` calls `events.jsonl` "every block, halt, cleared halt, advisory
override and fail-open the hooks have emitted". The vocabulary is `guard_allow`, `guard_advisory`,
`guard_error` (`hooks/lib/events.ts:53-56`). Three of the five names are retired types, "advisory
override" was never a type, and `guard_allow` — the write trace that every other surface calls one
of the guard's two products — is absent. `1fb3f32` edited `:94` of this same file and stopped 36
lines short. The no-ceiling argument at `:132` and `:274` is unaffected and still sound;
`rules/fusion-workbench-conventions.md:79` received exactly the clause this line needs. Filed as
`260817-1508_*_the-archive-skills-event-log-description-names-three-retired-event-types-and-omits-both-live-ones.md`.

### Theme 2 — the fix moved the reach and the surfaces describing the reach did not (1 finding)

**B. Three surfaces and one decision record say the retired-file diagnostic has one channel.**
Medium, and the only finding coupled to an unshipped commit. `docs/upgrading-to-v10.md:12` reads
"that budget stops being applied the moment you upgrade, **and no session says so out loud**" — the
sentence that motivates the whole page. As of `01932d6` a session does say so out loud, at Setup,
measured in point 6. Two more become incomplete rather than false: `docs/upgrading-to-v10.md:74-77`
and `README-hooks.md:315` each argue that the per-call channel was chosen *over* a one-off Setup
message, and both now exist. `hooks/lib/config.ts:105-114` states the same in capitals and cites
decision `260816-1916_*_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md`, whose chosen option 1 carries the recorded Con *"the advisory reaches it
through the monitor's warnings panel and the event log rather than as a sentence in the terminal"* —
which `01932d6` removes without amending the record.

This is **not** a re-opening of that decision. Options 2 and 3 were about `/fusion:setup` writing a
project's configuration on its behalf; `01932d6` writes nothing and reads no old file, so it stays
inside option 1. What changed is reach, and reach is what the four surfaces describe. Filed as
`260817-1506_*_three-surfaces-say-the-retired-file-diagnostic-has-one-channel-and-the-orchestrator-fix-gave-it-two.md`.

### Theme 3 — the corrected mandate is held by prose alone (1 finding)

**E. No test pins the repeat-to-the-user mandate that already shipped narrow once.** Low,
preventive. `hooks/lib/__tests__/turn-budget-lint.test.ts` exists for this prompt block and pins
eight properties of it — no literal, the `[ -x ]` call, the decided unresolved branch, the setup
skill citing rather than copying, the single definition of the default — and none of them is the
obligation to speak. `grep -n 'diagnostic\|stderr\|repeat'` over that file returns nothing.
The failure mode is structural rather than clerical: a mandate written to a named subset silently
excludes every member the loader gains later, which is `01932d6`'s own argument for making the rule
the antecedent. Two assertions would hold it. Also recorded there, because it is the same shape one
level down: the commit message's "four diagnostic producers" is five once the two `readLayer`
refusals are folded, the fifth being the container-shape drop at `hooks/lib/config.ts:409`
(reproduced with `{"orchestrator": 5}`), and its citations `:322` / `:341` are the retirement
tables' declaration lines rather than the `push` sites at `:469` / `:393`. The mandate is universal,
so behaviour is right and the missing example costs nothing today. Filed as `260817-1509_*_no-test-pins-the-repeat-to-the-user-mandate-that-already-shipped-narrow-once.md`.

## Cross-cutting observations

**The lint gates cannot see any of the three text findings, and each fails differently.**
`reference-resolution-lint` resolves paths, anchors and record citations; findings A, C and D are
all prose that names a *mechanism* rather than a path, so all three are outside its class by
construction. That is the third distinct instance of the same limit in this Circle — `260816-2321_*_step-11s-line-scoped-changes-text-misses-two-stale-lines-in-files-it-already-opens.md`
recorded it for two comment lines, `260817-1105` for a bare filename in `README.md`, and this pass
adds three more in three more shapes. The limit is now well enough evidenced to be worth deciding
about rather than re-discovering; it is not a defect in the lint.

**Three commits are unpushed, including the fix.** `origin/main` is at `9ae7974`; `dbbad70`,
`bee46e7` and `01932d6` are local. `install.sh`'s default ref is `heads/main`, so the recommended
install path currently serves the pre-fix orchestrator prompt. That is the ordinary state between a
release and a patch and is not a defect — it is stated so the sequencing below is unambiguous.

**The Circle's own instruments performed.** `e489133` refused two baselines the plan told it to
move, and filed the gap (`260817-1032_*_two-of-the-three-bounded-surfaces-grew-through-this-circle-so-only-the-hook-tests-baseline-moves.md`). `c65e1cf` refused to add a `Retired:` line the plan
ordered, having read the four sites at HEAD, and recorded why the plan's grep-based safeguard
returns exactly the wrong record. `dbbad70` corrected a Grounding snapshot. In each case the
executor overrode the plan on measurement and wrote down the override. That is the behaviour the
two earlier reviews asked for, arriving without a further prompt.

## Recommended sequencing

**Ships with `01932d6` in the v10.0.1 patch — not after it:**

1. `260817-1506_*_three-surfaces-say-the-retired-file-diagnostic-has-one-channel-and-the-orchestrator-fix-gave-it-two.md` — the four channel-reach corrections. The patch carries a fix that makes
   `docs/upgrading-to-v10.md:12` false; the doc edit and the fix are one change.

**Belongs in the same patch, on cost rather than coupling:**

2. `260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md` — the curator pair. Two clause deletions, and it is the Directive's own defect
   class in shipped agent text.
3. `260817-1507_*_the-turn-budget-helpers-authoritative-header-still-scopes-its-stderr-to-dropped-keys.md` — the helper header and the module docstring. Three surfaces, one contract.

**Cleanup, any later Turn:**

4. `260817-1508_*_the-archive-skills-event-log-description-names-three-retired-event-types-and-omits-both-live-ones.md` — the archive skill's event-log sentence.
5. `260817-1509_*_no-test-pins-the-repeat-to-the-user-mandate-that-already-shipped-narrow-once.md` — the two assertions in `turn-budget-lint.test.ts`. Note the hook-test surface has
   *less* head-room after the 2026-08-17 re-baseline than before it (floor 17 875, 2 500 lines), so
   size the addition accordingly.

**Nothing here holds the release.** v10.0.0 as tagged at `e331332` is internally consistent: every
sentence finding B corrects is true at the tag, and findings A, C, D and E are pre-existing or
preventive. What the pass does not answer, and deliberately does not pre-empt, is
`260817-1417_*_the-release-went-out-over-a-turn-whose-six-shipped-file-commits-no-review-opened.md` —
this review covers that range now, after the fact, which is a different thing from the precondition
the plan named.

## On the two files not opened

`hooks/lib/__tests__/fixtures/rules-emission.golden` and `fixtures/surface-growth.golden` are
generated output regenerated by their own tests. Both tests pass at HEAD, and `e489133` and
`01932d6` each state the fixture change is regenerated rather than hand-edited. They are declared
here rather than silently skipped, because a recorded absence can be compared and a missing line
can only be guessed at.

---

## Reconciliation annotation — 2026-08-17, second Phase-3 pass

Findings not rewritten. Their disposition at HEAD `d0f13fa`, each re-measured against the tree
rather than taken from this review or from the commit that answered it.

**One of the five is closed; four are open by explicit user decision, against a shipped release.**

| Finding | Record | State | Re-measured at HEAD |
|---|---|---|---|
| Theme 2 | `260817-1506_*_three-surfaces-say-the-retired-file-diagnostic-has-one-channel-and-the-orchestrator-fix-gave-it-two.md` | `_c_` | Closed in `dcb0784`, shipped in v10.0.1. `docs/upgrading-to-v10.md:11-13` and `:74-77` and `README-hooks.md:315` now say the diagnostic has two channels; `hooks/lib/config.ts:103-114` keeps its claim with the compression narrowed. |
| Theme 1 (a) | `260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md` | `_o_` | Both sentences stand verbatim at `agents/curator.md:212` and `skills/curate/SKILL.md:110`. |
| Theme 1 (b) | `260817-1507_*_the-turn-budget-helpers-authoritative-header-still-scopes-its-stderr-to-dropped-keys.md` | `_o_` | `bin/fusion-turn-budget:14` still scopes its stderr to what the loader "had to drop". |
| Theme 1 (c) | `260817-1508_*_the-archive-skills-event-log-description-names-three-retired-event-types-and-omits-both-live-ones.md` | `_o_` | `skills/archive/SKILL.md:130` and `:132` unchanged; neither live event type appears in the file. |
| Theme 3 | `260817-1509_*_no-test-pins-the-repeat-to-the-user-mandate-that-already-shipped-narrow-once.md` | `_o_` | Suite still 35 files and 653 tests, the same count as before `01932d6`, so no test was added with the fix. |

**This review's own release judgement held.** It said "Nothing blocks the v10.0.1 patch" and that
one finding had to ride inside it; `260817-1506_*_three-surfaces-say-the-retired-file-diagnostic-has-one-channel-and-the-orchestrator-fix-gave-it-two.md` did, as `dcb0784`, and the tag `v10.0.1` at
`d0f13fa` is on `origin/main` with the marketplace entry at `f3ad823`. `npm test` is green whole at
HEAD.

**The dominant pattern this review named is now the pattern of what is left standing.** All three
Theme-1 findings — a sweep opening a file, editing the line it was sent for, and not reading the
rest — are among the four the user chose to leave open. One of them, `260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md`, is the single
item that sits inside this Circle's own Directive: `agents/curator.md` is an agent prompt and
`skills/curate/SKILL.md` is a skill body, both named by the Directive's last clause.

**Coverage of this review's own range.** `bin/fusion-review-coverage --since 3d41d4a` at HEAD
reports `commits=27 reviews=3 unusable=0 uncovered=3`. This review's declared
`**Reviewed-range:** 1d1d3a3..01932d6` tiles cleanly against the Turn-1 and Turn-2 ranges with no
overlap and no hole; the three uncovered commits are `70f17da` (this file), `dcb0784` and
`d0f13fa`, all of them after it. The two files declared `not-opened` are carried forward by the
helper as `carried=hooks/lib/__tests__/fixtures/rules-emission.golden,
hooks/lib/__tests__/fixtures/surface-growth.golden`.
