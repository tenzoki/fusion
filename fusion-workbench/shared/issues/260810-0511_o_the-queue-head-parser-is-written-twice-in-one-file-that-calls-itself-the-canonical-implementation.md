# The queue-head parser is written twice in the one file that calls itself the canonical implementation

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
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
`260810-0501_o_two-skills-cite-a-prompt-section-they-have-no-documented-route-to-read.md`), this
duplicate should go in the same change rather than be carried across.

Extend the lint's "one canonical implementation" assertion to count occurrences of the parser inside
`agents/orchestrator.md` itself, so the file that owns the rule is also held to it.
