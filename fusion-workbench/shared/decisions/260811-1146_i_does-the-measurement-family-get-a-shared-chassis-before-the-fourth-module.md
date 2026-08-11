# Does the measurement family get a shared chassis before a fourth module is written?

---
**Domain:** code
**Status:** implemented
**Filed by:** coderev
**Cross-references:** `shared/issues/260811-1142_*_the-three-measurement-modules-hand-roll-a-guard-state-store-the-seam-built-for-it-already-owns.md`; `shared/issues/260811-1143_o_staging-drift-and-review-coverage-events-are-emitted-into-a-log-nothing-reads.md`; commits `8a49fd5`, `afd7c2e`, `cac41ef`; `hooks/lib/guard-state-file.ts`

---

## Question

Three measurement modules landed in one afternoon — `lib/state-drift.ts` (`8a49fd5`),
`lib/review-coverage.ts` (`afd7c2e`), `lib/staging-drift.ts` (`cac41ef`) — each with a CLI entry, a
`bin/` wrapper and a trigger point in `hooks/tracker.ts`. Each executor argued in its report that its
module was a **sibling** rather than an extension of the previous one.

**That argument is right, and it answers a different question than the one now open.** The three
measure genuinely different subjects against genuinely different records, on genuinely different
triggers, and folding them into one module would produce a module with three unrelated subjects.
Siblings is the correct domain relation.

What is missing is not a merge. It is a **chassis**: the part every sibling repeats. The question is
whether it is built now, or after the fourth module makes it a fourth copy.

## The measurement, not the impression

Counted across the three modules, their three CLI entries and their three `bin/` wrappers:

| Repeated thing | Copies | Where |
|---|---|---|
| Throttle store under `.guard-state/<name>.json` | 3 | `state-drift.ts:512-531`, `review-coverage.ts:560-579`, `staging-drift.ts:449-466` |
| `git(root, args)` `execFileSync` wrapper | 2 verbatim + 1 inline | `review-coverage.ts:315-326`, `staging-drift.ts:260-271`, inline at `state-drift.ts:280-288` |
| `WB` constant + `.guard-state` path building | 3 | each module's Layout block |
| `EMPTY(root, why)` empty-report factory | 2 | `review-coverage.ts:371-382`, `staging-drift.ts:359-365` |
| `signature` contract (stable identity, grows → speaks again) | 3 hand-rolled | one per module |
| `measure…ForModel` in the tracker: resolve root → measure → read throttle → compare signature → record → build detail → `emitEvent` → return sentence | 3 | `tracker.ts:838-860`, `:892-926`, `:969-1008` |
| CLI `main(argv)` + `USAGE` + `findWorkbenchRoot` → exit 2 + `anchor=workbench-root` + `process.exitCode = main(...)` | 3 | `hooks/state-drift.ts`, `hooks/review-coverage.ts`, `hooks/staging-drift.ts` |
| `bin/` wrapper: resolve `here`, check `dist/<name>.js`, exit 3, `exec node` | 3 (4 with `bin/fusion-churn-rank`) | the three new wrappers |

Two of these already have an owner in the codebase and were not used. `lib/guard-state-file.ts` is
the throttle store, and its own header names this exact class: *"Three state modules … each carried
their own copy of the same twelve lines … Copies drift, and this set drifted in the way that
matters."* Two modules use it; three more were written beside it.

`readStateFile` and `stateField` **were** deduplicated during the third task
(`review-coverage.ts:353-356` records why). That is the right instinct applied to one of eight
places.

## What the missing abstraction is, named

A `Measurement` record and one driver per surface:

```ts
interface Measurement<R> {
  name: string;                          // "state-drift" — the throttle file, the bin name, the event
  event: GuardEventType;
  fires(input: HookInput, root: string): boolean;   // every call | a review file lands | HEAD moved
  measure(root: string): R;
  signature(r: R): string;
  sentence(r: R): string;
  detail(r: R): string;
  render(r: R): string[];                // the KEY=value block + one line per row
}
```

Then: one throttle (`guard-state-file.ts` widened by an optional `root`), one `lib/git.ts`, one
`tracker.ts` loop over the registered measurements, one CLI driver, one `bin/` wrapper template. The
per-module code that survives is the part that is actually different — what is read, what
contradicts it, and what the sentence says.

## Options

1. **Build the chassis now, before a fourth module.** Extract the throttle onto the existing seam,
   the `git` wrapper into `lib/git.ts`, the tracker's three `measure…ForModel` bodies into one loop
   over a registry, and the three CLI mains into one driver.
   - Pros: the two already-diverged pieces converge (the three throttles differ in atomicity and in
     shape); the `bin/monitor` gap that made two of three events unreadable becomes structurally
     impossible, because the registry names the event and one place renders it; the fourth module
     costs a registry entry rather than 550 lines.
   - Cons: it touches three modules whose tests were written against their current surfaces; the
     three trigger predicates are genuinely different and a `fires()` signature has to carry both
     "every call" and "HEAD moved", which is state, not a pure predicate.
2. **Build only the two pieces that already have an owner** — the throttle onto
   `guard-state-file.ts`, and one `lib/git.ts` — and leave the tracker, the CLIs and the wrappers as
   three copies.
   - Pros: small, mechanical, no test surface changes; closes the two places where a *defect* fixed
     once would otherwise have to be fixed three times.
   - Cons: the sixth module still costs six copies of the boilerplate; the `bin/monitor` omission
     class stays open.
3. **Accept the family as it is and write the fourth module the same way.**
   - Pros: each module reads top to bottom with no indirection, which is what makes these headers
     usable; the trigger differences are real and a chassis that hides them would be worse than the
     copies.
   - Cons: three copies is the number at which `guard-state-file.ts` was written the first time. The
     evidence that copies drift is in this repository, with two issue numbers attached.

## Constraints

- The three triggers must stay visibly different in the source. The argument in
  `review-coverage.ts:92-100` and `staging-drift.ts:33-54` for why each is *not* on the every-call
  path is the most load-bearing reasoning in the family, and a registry that reduces it to a flag
  would lose it.
- `guard-state-file.ts` currently resolves the root itself. Any reuse widens its signature by one
  optional argument; it must not break `escalation.ts` or `churn.ts`.
- No chassis may make a measurement's failure cost another measurement's sentence. The current
  `bestEffort` isolation per measurement in `tracker.ts:1037-1058` is correct and must survive.

## Recommendation

Option 2 now, option 1 at the fourth module — and write the trigger down as the thing that decides.

Option 2 is unambiguous: both pieces have an existing owner, `rules/critical-stance.md` §2 asks for
reuse before building, and neither touches a trigger or a test surface. Option 1 is the right end
state but its cost is concentrated in exactly the place option 3 defends — the three triggers — and
that is the part worth being slow about.

The trip-wire should be explicit rather than remembered: **when a fourth measurement is proposed, the
chassis is built first.** Three copies is where this codebase drew the line the last time
(`guard-state-file.ts`), and drawing it in the same place twice is a decision, not a coincidence.

---
Answered: <set when status moves to _a_>
Implemented: `hooks/lib/git.ts`, `hooks/lib/guard-state-file.ts:103-161`, `hooks/tracker.ts:776-857` — see the block at the foot of this file

---
Answered: user, session 260811-0752 (chat) — **Option 2.** Build only the two pieces that already
have an owner: move the throttle store onto `hooks/lib/guard-state-file.ts`, and extract one
`lib/git.ts` for the `execFileSync` wrapper. The tracker's three `measure…ForModel` bodies, the
three CLI mains and the three `bin/` wrappers stay as they are. Option 1, the full chassis, is
taken at the fourth module, and the trigger is written down as the thing that decides whether a
new measurement is a sibling at all. This follows the record's own recommendation.

---
Implemented: coder, session 260811-0752, task 2 of the queue, realising record
`shared/issues/260811-1730_*_realise-the-measurement-chassis-first-two-pieces-throttle-onto-the-existing-seam-and-one-git-wrapper.md`.
Cited by path rather than by commit hash: the executor does not commit, the orchestrator does.

**Option 2, both pieces.**

- The throttle store moved onto `hooks/lib/guard-state-file.ts`, widened by one optional
  `root?: string` on `guardStatePath` / `loadGuardState` / `saveGuardState`. The walk still runs
  when no root is given, so `escalation.ts` and `churn.ts` are unchanged. The six hand-written
  functions in `lib/state-drift.ts`, `lib/review-coverage.ts` and `lib/staging-drift.ts` became
  six calls plus one total coercion each; `staging-drift.ts` keeps its two-field state as its own
  coercion, with the two fields coerced separately. The two divergences the record measured are
  closed: all three now write atomically through a `.tmp` and a `rename`, and none can read with
  an `as` cast.
- The git wrapper became `hooks/lib/git.ts`, `git(root, args, timeoutMs?)`. `execFileSync` now
  appears exactly once in the hooks source. The timeout was **not** verbatim across the three —
  5 s twice, 10 s in `staging-drift.ts` — so the module defaults to a ref read's 5 s and
  `staging-drift.ts` passes `GIT_STATUS_TIMEOUT_MS` at its one `git status` call, the only call in
  the family that walks a working tree.
- **The trigger criterion is written down**, in `hooks/tracker.ts` immediately above the three
  `measure…ForModel` bodies — the one file a fourth measurement must touch. It names the three
  existing triggers, gives three checkable questions that decide sibling-hood (a nameable moment
  where the answer turns from "not yet" to "wrong"; firing there reports **nothing** on the
  commonest path; the condition is read, never predicted from a command's text), says what each
  failure means, and carries the trip-wire verbatim — *when a fourth measurement is proposed, the
  chassis is built first* — together with the constraint that such a chassis must not flatten the
  three trigger arguments into a flag.

**What stayed as three copies, by this answer:** the tracker's three `measure…ForModel` bodies,
the three CLI mains under `hooks/`, the three `bin/` wrappers. The `tracker.ts` change is a doc
block above the section divider; no statement inside any of the three functions moved. The
`signature` contract named in the record's table is likewise untouched — moving the throttle
changed only the read's failure mode, not what a signature contains or how it is compared.

**Why this is `_i_` and not still `_a_`.** Everything the answer asked to be **built now** is
built. The remaining half — option 1 at the fourth module — is a standing condition rather than
outstanding work, and the only thing that could be done for it, writing the trip-wire and the
criterion where the next author will read them, is done. If the chassis is later built, it is a
new decision that supersedes this one, not a continuation of it.

**Verification:** `cd hooks && npm test` — exit 0, 49 files, 1284 passed. Plus a scratch project
root driven through `dist/tracker.js` over stdin: throttle round-trip, report-once-then-silent,
the review-coverage trigger firing on its own path alone, all three throttle files corrupted with
tracker exit 0 and each measurement re-reporting once, and the three `bin/` wrappers unchanged.
`hooks/dist/**` rebuilt and re-checked self-contained.

**History:** `shared/history/260811-1806-coder-task2-throttle-seam-and-git-wrapper.md`
