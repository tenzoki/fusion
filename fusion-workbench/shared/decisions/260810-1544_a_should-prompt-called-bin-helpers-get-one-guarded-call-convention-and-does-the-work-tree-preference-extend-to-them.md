# Should prompt-called `bin/` helpers get one guarded-call convention, and does the work-tree preference extend to helper resolution?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (session `260810-1402`)
**Cross-references:** `shared/decisions/260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` (this record carries its parts b and c); `archive/260817-1907-safe-cleanup-scoped/shared/issues/260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have.md` (the instance that produced part a1, now closed by `26ea3c3`)

---

## Question

Decision `260810-0921` bundled three questions. Its part (a1) — tolerate and report a missing helper — was answered and is now realised in `26ea3c3`. Parts (b) and (c) were never answered and are carried here so they have a lifecycle of their own.

The record they came from could not carry them any longer. A decision record has one marker, and `_i_` is terminal: leaving two unanswered questions inside a record about to be marked implemented would have made the marker a lie in one direction or blocked the realised part in the other. That is the immediate reason this record exists, and the general form of it is worth stating: **a decision record that bundles separable questions cannot be tracked**, because its state is not a single value. Splitting is the repair; the alternative is a marker vocabulary with per-part states, which nothing in fusion has.

**(b) A uniform guarded-call convention.** `26ea3c3` guards exactly one call site — Setup Step 5's `bin/fusion-count-sources` — with `[ -x ]`. Two other call sites in the same block already existed and were not guarded, and `25c5454` added a third (`bin/fusion-churn-rank`, which reuses the same guard by hand). Every future helper repeats the choice. Does a prompt calling a `bin/` helper get one stated convention, and if so, what enforces it?

**(c) Does the work-tree preference extend to helper resolution?** `bin/fusion-rules` and `bin/fusion-paths` prefer this checkout's copies when cwd is the plugin's own repository (`bin/fusion-plugin-cwd`). `$FUSION_PLUGIN_ROOT` does not: it pins to the install for the whole session, which is exactly what produced the part-(a1) instance. `CLAUDE.md` states that the hooks deliberately do **not** get the work-tree treatment. Helpers called from prompts are a third case, neither hooks nor rule-loading, and no rule names them.

## Options

1. **State the convention, enforce it with a gate.** A prompt calling a `bin/` helper guards the call, and a lint over `agents/*.md` and `skills/*/SKILL.md` fails on an unguarded `$FUSION_PLUGIN_ROOT/bin/` invocation. Pros: the class stops recurring, and the gate is the same shape as the queue-ground and cascade lints already in `hooks/lib/__tests__/`. Cons: three such lints are themselves open defect records in this queue for matching on text rather than behaviour, so this adds a fourth of a shape currently under repair.
2. **A helper that performs the guarded call.** One `bin/` entry point resolves and runs another helper, reporting absence in a fixed vocabulary. Pros: one implementation, callable from prompts and skills alike. Cons: it is itself a helper the install may not have, so the bootstrap problem moves rather than dissolving.
3. **State the convention in prose, enforce nothing.** Pros: cheap, honest about what a prompt can carry. Cons: `rules/critical-stance.md` §2's own worked case is a "MUST" in a prompt losing to task pressure; and `260801-2038` measured a prompt-only fix having zero effect on the session that installed it.
4. **Extend the work-tree preference to helper resolution** (part c specifically). Pros: closes the instance class at its source for this repository. Cons: it changes what `$FUSION_PLUGIN_ROOT` means mid-session for some callers and not others, which is the kind of split that produced the two-halves-disagreeing defect the churn work just fixed.

## Constraints

- Whatever is decided must not make a consuming project's session depend on a helper that install cannot have. That is the original defect.
- Any gate added must assert on behaviour rather than on the presence of a token in prose, or it inherits the weakness three open records in this queue already describe.
- `CLAUDE.md`'s statement that hooks do not get the work-tree treatment stays unless part (c) explicitly overturns it.

## Recommendation

None yet. Part (b) is the more consequential of the two and is the one that will keep costing a session per new helper; part (c) is narrower and only affects this repository's own development. They could be answered separately, and if they are, this record splits again rather than being marked half-implemented — which is the failure this record was created out of.

---
Answered: user, session 260811-0752 (chat) — **Option 3 for part (b): state the convention in
prose, enforce nothing.** A prompt calling a `bin/` helper guards the call and reports the absence
in the fixed vocabulary; no lint is added. The record names the honest cost and it is accepted
rather than argued away: a convention in prompt text can lose to task pressure, and it does not
reach the session that installs it. It was preferred over the lint because three gates of exactly
that shape (matching on text rather than behaviour) are themselves open defect records right now,
so a fourth would be built on a mechanism currently under repair. Reconsider if the class recurs
after the convention is written down.

Part (c), whether the work-tree preference extends to helper resolution, is **not** answered here.
Per this record's own closing paragraph the record splits rather than being marked half
implemented: file part (c) as its own decision when it is taken up.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`, and this is the one record in the `_a_` set whose transition is blocked by a
missing file rather than by missing work.**

*Part (b) is realised.* The answer chose option 3 — state the convention in prose, enforce nothing —
and the prose exists on every surface a prompt-called helper is invoked from:
`agents/orchestrator.md:134`, `:166`, `:602`, `:1107`; `skills/setup/SKILL.md:32`;
`skills/next/SKILL.md:33`; `skills/cleanup/SKILL.md:29`; `skills/help/SKILL.md:31`; and
`CLAUDE.md:37`, which states "Every call site guards with `[ -x ]`, per that record's part (b)" and
cites this record for it. Each site gives the same reason in the same terms — `$FUSION_PLUGIN_ROOT`
is the installed copy, pinned for the session, so a helper added between releases is absent and a
bare call is exit 127 — and each reports the absence rather than failing. Nine days on, no unguarded
`$FUSION_PLUGIN_ROOT/bin/` call has appeared, which is as much as an unenforced convention can be
asked to demonstrate.

*Part (c) is unanswered and, per this record's own closing instruction, has never been filed.* The
instruction is explicit: "file part (c) as its own decision when it is taken up." It has been taken
up three times since — `skills/setup/SKILL.md:34`, `skills/next/SKILL.md:35` and
`skills/cleanup/SKILL.md:33` each tell their reader that whether the work-tree preference reaches
helper resolution "is part (c) of decision `260810-1544` and is **unanswered**; do not assume it",
and `CLAUDE.md:37` says the same. Four shipped surfaces now point at an open question that has no
record of its own, and this record cannot move to `_i_` while it is the only home for it, because
`_i_` is terminal and would close a question nobody has decided.

**One user action clears this.** File part (c) as its own decision record — the four citations above
are its evidence, and the question is already stated in this record's `## Question` — and this record
then moves to `_i_` on part (b) alone, which is exactly the split its own paragraph at `:15`
prescribes for a record whose state is not a single value.
