# Step 9 must also document that a hard-linked rule file is not exempt, and why

---

**Severity:** Low
**Domain:** code (documentation of a security control)
**Filed by:** coder, Turn 3 task T3-7, deferring a piece it could not write coherently
**Affects:** `README-hooks.md`, `rules/protected-path-discipline.md`
**Cross-references:**
`issues/260802-2332_c_the-nlink-heuristic-locks-out-legitimately-hard-linked-rule-files-with-no-diagnosable-reason.md`
(direction 3, the deferred piece),
`history/260803-1314-turn3-t3-2-exemption-prose-and-refusal-diagnostics.md`
"Considered and deliberately not done" (where the deferral is recorded),
`issues/260802-2331` "Also missing, and probably Step 9's" (the two sentences Step 9
already names),
`planning/260802-1856_o_plan-guard-rules-write.md` Step 9,
`hooks/lib/rules-write-exemption.ts:146-156` (the reason, in the module docstring),
`hooks/lib/rules-write-exemption.ts:458-462` (`REFUSAL_NOTES["hard-link"]`, the wording
the deny already uses)

---

## What is missing

`FUSION_ALLOW_RULES_WRITE` refuses the grant for an existing regular file that has more
than one name on the filesystem. `realpath` can prove where a symlink goes; it can prove
nothing about a second name pointing at the same inode, so the exemption cannot show that
writing this name writes only a rule file. The asymmetry is defensible and is currently
written down only in a module docstring.

It matters because nobody has to choose that state: `rsync --link-dest`, `cp -al` and
`git clone --local` all produce hard-linked trees. A user who curates rules inside such a
tree meets a deny with the flag set and no shipped document explains it.

`245b8b7` made the refusal *say* so at the point of denial (`REFUSAL_NOTES["hard-link"]`).
T3-2 deferred the document half to T3-7 as direction 3 of `260802-2332`.

## Why T3-7 did not write it

The note cannot be stated without naming `FUSION_ALLOW_RULES_WRITE`, and that flag appears
in no shipped document at HEAD. Worse, both documents currently assert the opposite of its
existence:

- `rules/protected-path-discipline.md`: "**There is no override for a protected-path shell
  write.** That is deliberate."
- `README-hooks.md`: "There is no env override for a protected-path shell write; the
  answer is a human decision."

Adding a hard-link exception to an exemption the same file says does not exist ships a
self-contradiction. Correcting those two sentences and adding the flag's table row is
Step 9's stated scope, so T3-7 left the whole piece rather than writing half of Step 9
under another task's name.

## What Step 9 should add

Three things, together, in one pass:

1. The `FUSION_ALLOW_RULES_WRITE` row in the `README-hooks.md` tuning table, alongside
   `FUSION_ALLOW_BRANCH_SWITCH`.
2. The correction of the two "no override" sentences above — the policy now has exactly
   one override, it covers rule files only, and it lifts neither the halt nor any other
   protected path.
3. **This item:** a hard-linked rule file is not exempt, because the exemption resolves a
   path through the filesystem and a second name to the same inode is invisible to that
   resolution. Rewriting the command does not help; it is a question for the user. Worth
   naming `rsync --link-dest`, `cp -al` and `git clone --local` so a user who did not
   choose the state can recognise it.

## Origin

`circles/260801-1244-guard-rules-write`, Turn 3 task T3-7, while correcting the halt and
residual claims in the same two documents.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Every premise re-checked at HEAD `fa81589`; all hold.**

The two sentences this issue says must be corrected are still live, at these lines:

- `rules/protected-path-discipline.md:171` — "**There is no override for a protected-path shell write.** That is deliberate."
- `README-hooks.md:187` — "There is no env override for a protected-path shell write; the answer is a human decision."

And the flag they deny is still absent from every shipped document: `grep -rn FUSION_ALLOW_RULES_WRITE README-hooks.md rules/ CLAUDE.md` returns nothing. So the self-contradiction T3-7 refused to ship is still exactly the one it described.

The wording the deny already uses is where the issue cites it: `hooks/lib/rules-write-exemption.ts:458-462`, `REFUSAL_NOTES["hard-link"]`, ending "Rewriting the command will not help — ask the user."

**Recorded on the plan.** `planning/260802-1856_o_plan-guard-rules-write.md` Step 9 now carries a `[SCOPE CHANGED]` note naming this issue as work added to that step, alongside the halt and residual passages `ce7a125` already wrote. Step 9 remains unstarted; what it must write is no longer what its own body says.

**One sequencing constraint arrived after this issue was filed.** `reviews/260803-1431-coderev-turn3-guard-boundary.md` `## Verdict` asks that `issues/260803-1431_o_` land before Step 9 writes the flag into shipped documents, so the user-facing text is not authored against a boundary that is about to move again.

---

**Reconciliation 260804-1021 (reconciler, domain `code`) — stays `_o_`. The hard-link item is untouched; the rest of this issue's own factual basis has moved under it, in the damaging direction.**

**The item this issue is named for is genuinely still open.** `grep -rn "hard link\|hard-link\|nlink"` over `README-hooks.md` and `rules/` at HEAD `cc012fc` finds only the *symlink and hard-link alias residual* (`README-hooks.md:201`, `rules/protected-path-discipline.md:521-522`) — that is the bypass, not the exemption's `nlink` refusal. The deny wording this issue cites is still at `hooks/lib/rules-write-exemption.ts:458-462`, `REFUSAL_NOTES["hard-link"]`. Nothing has documented why a hard-linked rule file is refused under a set flag.

**The paragraph above this note is now false.** It reads: *"the flag they deny is still absent from every shipped document: `grep -rn FUSION_ALLOW_RULES_WRITE README-hooks.md rules/ CLAUDE.md` returns nothing."* That exact grep now returns **two hits**: `rules/protected-path-discipline.md:49` and `README-hooks.md:145`. Both arrived with the case-folding work (`86a437a`), not with a Step 9 task, and both mention the flag only to say the exemption does not fold, using `Edit` examples.

**So the self-contradiction T3-7 refused to ship has shipped anyway, by a side door.** T3-7's stated reason for writing none of these items was that naming the flag in a document that denies the flag exists ships a self-contradiction. `86a437a` named the flag without touching the denial. At HEAD:

- `rules/protected-path-discipline.md:49` names `FUSION_ALLOW_RULES_WRITE`.
- `rules/protected-path-discipline.md:421` says "**There is no override for a protected-path shell write.** That is deliberate."
- The flag reaches the Bash surface at `hooks/guard.ts:410-412` (`exempt: rulesWriteExemptionActive(process.env) ? isExemptRulePath : undefined`) and `guard.ts:399-403` states the intent in so many words.

Measured with the predicate supplied, `rm rules/x.md`, `mv rules/x.md rules/retired/x.md`, `sed -i '' 's/a/b/' rules/x.md`, `echo x > rules/x.md` and `rm -rf rules/retired` all flip deny to allow, while `rm agents/coder.md`, `rm hooks/config.json`, `rm -rf rules` and `ln -s /tmp/a rules/x.md` stay denied. So `:421` is false, and because `:49` is 372 lines above it, a reader now meets both.

**Line numbers this issue and the plan's Step 9 note both cite have drifted.** The two "no override" sentences were cited at `rules/protected-path-discipline.md:171` and `README-hooks.md:187`. Both files grew this session (to 628 and 281 lines). The sentences are now at **`rules/protected-path-discipline.md:421`** and **`README-hooks.md:199`**.

**A third file carries the same false sentence and is named by the plan but not by this issue.** `CLAUDE.md:113` — "There is **no** env override for this policy: it is a human decision." Add it to this issue's `**Affects:**` when Step 9 is picked up; three files must change together or the correction ships incomplete.

**Two more items belong to Step 9 than this issue lists**, both found in the same audit and filed separately rather than folded in here, because each is a distinct defect with its own fix: `260804-1025_o_` (the decision procedure at `rules/protected-path-discipline.md:172` tells an agent the model stays exact for the two commands that delete a rule file) and the residual-list omissions named on `260804-1024_o_` and `260804-1026_o_`.

**The sequencing constraint recorded at the foot of this issue is now satisfied.** `issues/260803-1431` closed in `a79ff1a`. The Turn 3 review asked that it land before Step 9 writes the flag into shipped documents; it has. Step 9 is no longer blocked by it.

---

**Step 3 disposition (coder, 2026-08-05) — branch A, text corrected. CLOSING.**

All three items this issue asks for have landed, in the two files it names.

1. **The flag's row.** `README-hooks.md` `### Tuning or disabling the guard` now carries a
   `FUSION_ALLOW_RULES_WRITE` row alongside `FUSION_ALLOW_BRANCH_SWITCH`, stating the
   boundary: the project's rule directories and the `retired/` destination inside them and
   nothing else, the guard is not turned off, an active halt is not cleared, and each
   exempted write emits a `guard_advisory` event.
2. **The two "no override" sentences**, corrected rather than deleted. The false ones were
   `rules/protected-path-discipline.md` — "**There is no override for a protected-path
   shell write.** That is deliberate." — and `README-hooks.md` — "There is no env override
   for a protected-path shell write; the answer is a human decision." Both now name the one
   override, scope it, and keep the no-override clause for every path the flag does not
   name. The self-contradiction T3-7 refused to ship is gone in both directions: the file
   that names the flag no longer denies it exists.
3. **The hard-link item**, in both files. In the rule file under
   `### The overrides waive only what they name`, as the second of two ways the grant is
   narrower than it looks — the first being the case fold, which was already there and is
   now stated beside it rather than 370 lines away. In `README-hooks.md` beside the
   case-fold paragraph, naming `rsync --link-dest`, `cp -al` and `git clone --local` so a
   user who did not choose the state can recognise it, and pointing at
   `REFUSAL_NOTES["hard-link"]` as the wording the deny already uses.

**The third file the 260804-1021 reconciliation added is NOT fixed, and is not this step's
to fix.** `CLAUDE.md` carries the same false sentence ("There is **no** env override for
this policy: it is a human decision"). Step 3's scope is the two rule layers, the forensics
analysis, `README-hooks.md` and the issue files. Reported to the orchestrator rather than
left silent — the correction is now incomplete in exactly one file, and that is a fact
about the scope, not an oversight.
