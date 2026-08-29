`tasklist.md` holds a fully closed queue from a Circle that closed two weeks ago, and three sessions have run past it

---

`fusion-workbench/tasklist.md` at HEAD is the v4.0.0 workbench-restructure queue, generated `260716-1920`. Every one of its nine entries is `[x]` or `[deferred]`. Its `**Source plan:**` line points at `260716-1910[p]-plan-workbench-umbau-circle-container.md` — a pre-v4 root-relative path in the bracket marker format, so it resolves to nothing in the current layout, twice over.

The Circle it belongs to (`260716-1847-workbench-umbau`) is closed. The session of 260801 ran three Turns and sixteen commits without the file being read, written, or noticed as stale until a coder mentioned it in passing.

---

## Why this is a defect and not just an untidy file

`$TASKLIST` is a root-anchored surface. It is what `/fusion:next` and the taskplanner treat as "the work queue", and it is one of the first things a resuming orchestrator or a new user looks at to answer "where was I". A file that answers that question with a completed queue from a different Circle is worse than an absent one: absence prompts a regeneration, staleness reads as an answer.

The specific failure mode: an orchestrator resuming into this workbench sees nine `[x]` rows and a `[deferred]` gate, and has no signal that this describes work finished on 260716 rather than work finished today.

## Who owns it

`tasklist.md` is written by `taskplanner` alone — no other agent may edit it (`rules/fusion-workbench-conventions.md`, Filename Patterns table). The reconciler that found this could not fix it for that reason. So the fix is one of:

1. **Regenerate.** Dispatch `taskplanner` when a Circle activates, so the queue is the active Circle's. This is the obvious answer and probably the right one, but it makes a taskplanner dispatch mandatory at `_a_ → _t_` where today it is optional, and the 260801 session ran a full Circle without one.
2. **Delete at closure.** Have the orchestrator remove `tasklist.md` at `_t_ → _c_/_b_` alongside deleting `.active-circle`, so a stale queue cannot outlive its Circle. Cheapest, and it converts a misleading answer into an absent one, which is the safer failure.
3. **Stamp and warn.** Leave the file, and have `/fusion:setup` and `/fusion:next` compare its `**Generated:**` stamp against the active Circle's directory stamp and warn on mismatch. Does not fix the drift, only announces it.

Option 2 composes with option 1 rather than competing: closure deletes, activation regenerates.

## Two smaller things visible in the same file

- The `**Source plan:**` path is pre-v4 and in bracket-marker form. Any consumer resolving it fails silently. The marker-format lint (`hooks/lib/__tests__/marker-format-lint.test.ts`) covers prompts and skills, not workbench artifacts, so nothing catches this.
- The header carries `**Circle:** 1 of 2` as free text rather than a Circle directory name, which predates the container layout and cannot be resolved by `bin/fusion-paths`.

## Provenance

Found by the reconciler during the closing pass of `260801-1244-guard-bash-inspection`, 260801-2038, after a coder flagged it during the session. Filed to the shared store rather than into that Circle per the Origin Rule: the Circle's Directive is the guard's Bash inspection, and this file was found next to that work rather than caused by it.

---
Resolved: `fusion-workbench/tasklist.md` rebuilt 2026-08-07 00:02 by `taskplanner` (domain `code`) against the active Circle `260804-1205-shell-reachability-model` and its approved plan `260806-2353_*_plan-shell-reachability-model.md`.

**What the rebuild did.** All eleven stale entries (P-1 … P-11) were removed together with the dead `**Source plan:**` and `**Circle:** 1 of 2` header lines this issue names. The new file carries a resolvable Circle-directory reference, a plan path in the current underscore-marker form, and a `**Generated:**` stamp taken from the clock. The queue itself is the active Circle's eleven plan steps in the plan's own dependency order, followed by three explicitly separated sections: adjacent backlog (nine defects in the files the plan will edit), unaffiliated backlog (twenty-four ranked defects), and eleven open items deliberately not queued with the blocking reason for each. The section boundary is stated in the file so the orchestrator's Turn loop cannot pull backlog into this Circle by accident — the failure this issue's own diagnosis is about, arrived at from the other direction.

**What this closes, and what it does not.** This performs option 1 ("regenerate") for the current instance. It does **not** implement the mechanism that would stop the drift recurring. Option 2 (the orchestrator deletes `tasklist.md` at `_t_ → _c_/_b_` alongside `.active-circle`, converting a misleading answer into an absent one) and option 3 (`/fusion:setup` and `/fusion:next` compare the `**Generated:**` stamp against the active Circle and warn on mismatch) both remain unbuilt, and the issue's own observation stands: regeneration is only reliable if a `taskplanner` dispatch becomes mandatory at `_a_ → _t_`, where today it is optional. The 260801 session ran a full Circle without one, and so could the next.

Closing on the defect as filed — the file no longer answers "where was I" with a completed queue from a different Circle. **The preventive half is not carried by this closure.** Whoever wants it should file it as its own item against the orchestrator's Phase 4 and the two skills; it is a change to three prompts, not to the queue.

The two smaller things this issue lists under "Two smaller things visible in the same file" are both gone: the pre-v4 bracket-form `**Source plan:**` path, and `**Circle:** 1 of 2` as free text. The gap that let them persist is not — `marker-format-lint.test.ts` still covers prompts and skills only, never workbench artifacts, so nothing would catch the same drift in a future generated file.
