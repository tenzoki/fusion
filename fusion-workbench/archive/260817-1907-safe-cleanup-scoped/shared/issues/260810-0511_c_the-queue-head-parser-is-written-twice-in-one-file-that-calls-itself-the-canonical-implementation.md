# The queue-head parser is written twice in the one file that calls itself the canonical implementation

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
**Affects:** `agents/orchestrator.md` — Phase 4 step 4 (the retirement snippet) and `### The queue's ground` → `#### Reading a queue`
**Cross-references:** commit `ff70d3a`; `hooks/lib/__tests__/queue-ground-lint.test.ts:187-199`

---

## The defect

The same eight-stage pipeline for extracting the Circle name out of the queue's head line appears
twice in `agents/orchestrator.md`, about a hundred lines apart:

```bash
# Phase 4 step 4, retirement
G=$(grep -m1 '^\*\*Active Circle:\*\*' "$Q" 2>/dev/null | grep -oE 'circles/[A-Za-z0-9._-]+|`[A-Za-z0-9._-]+`' | head -1 | tr -d '`' | sed 's|^circles/||')

# #### Reading a queue
G=$(grep -m1 '^\*\*Active Circle:\*\*' "$Q" | grep -oE 'circles/[A-Za-z0-9._-]+|`[A-Za-z0-9._-]+`' | head -1 | tr -d '`' | sed 's|^circles/||')
```

They already differ: the retirement copy carries `2>/dev/null`, the reading copy does not.

## Why it matters more than an ordinary duplicate

The section containing the second copy declares itself canonical, and two skills were changed in the
same commit to defer to it rather than restate anything:

> `/fusion:setup` Step 3 and `/fusion:next` Step 5 run this, and this section is the canonical
> implementation both cite.

`hooks/lib/__tests__/queue-ground-lint.test.ts:187-199` enforces exactly that discipline — but only
against the two **skills**:

```ts
it("has one canonical implementation that the two skills cite rather than restate", () => {
  for (const [name, body] of [["setup", setupSkill()], ["next", nextSkill()]] as const) {
```

The orchestrator's own second copy is inside the file the lint treats as the source of truth, so it is
invisible to the check. The rule was applied outward and not inward.

The consequence is concrete: the retirement decides whether to **move** the work queue by comparing
`$G` against `basename "$DIR"`. If the two derivations drift, the reading section can report a queue
`current` while the retirement declines to retire it, or the reverse — a queue moved that a consumer
had just called a valid backlog. Both parsers read a line format that no producer mandates
(`260810-0431` records that `agents/taskplanner.md` does not require the `**Active Circle:**` head at
all), so the format is likelier than usual to be edited later, and an edit will land on one copy.

## Fix direction

State the derivation once, in `#### Reading a queue`, and have Phase 4 step 4 cite it — the same
treatment the two skills were given. The retirement then needs only the comparison, not the extraction.

If the check is factored out to a rule file instead (proposed in
`260810-0501_*_two-skills-cite-a-prompt-section-they-have-no-documented-route-to-read.md`), this
duplicate should go in the same change rather than be carried across.

Extend the lint's "one canonical implementation" assertion to count occurrences of the parser inside
`agents/orchestrator.md` itself, so the file that owns the rule is also held to it.

---

## Reconciliation 260811-2330 — the two copies have now actually diverged, and the divergence cost a false measurement

This record predicted the divergence. It happened, inside one session.

Commit `b4eb4db` (2026-08-11 10:36) replaced the derivation at the `#### Reading a queue` site —
`agents/orchestrator.md:871` at HEAD `31746d1` — with a `sed` form that reads the value after the
label and stops at the first word. The Phase 4 step 4 retirement copy at `agents/orchestrator.md:829`
still carries the two-alternative `grep -oE`. Run against this repository's own queue head, the
canonical copy returns `none` and the retirement copy returns `.active-circle`.

Nine hours later a review record was filed against "the check" on the strength of the wrong copy —
`260811-1915_*_the-queue-ground-check-reads-any-backticked-word-in-the-head-line-as-a-circle-name.md`,
whose first witness reports a `STALE` verdict the canonical snippet could not have produced. That
record is annotated with the measurement.

So the cost of the duplication is no longer hypothetical: it is one false verdict recorded as
measured fact, in the same file set the queue is built from. Queue entry 29 asks for the
derivation to be stated once and cited from Phase 4. Doing that closes `260811-1915_*_the-queue-ground-check-reads-any-backticked-word-in-the-head-line-as-a-circle-name.md` in the same
edit; patching the Phase 4 copy in place does not.

Reconciled by `reconciler`, `260811-2330-reconciliation.md`.

---
Resolved: Both copies are gone: agents/orchestrator.md no longer carries the Active Circle extraction at either site, removed with the persisted tasklist and the queue-ground lint in dd312eb.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147-orchestrator-session.md, after a re-verification pass against HEAD confirmed the condition no longer holds.
