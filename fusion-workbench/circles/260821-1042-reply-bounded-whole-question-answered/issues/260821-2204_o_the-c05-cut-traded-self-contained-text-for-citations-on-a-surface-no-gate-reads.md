The C05 cut traded self-contained text for citations on a surface no gate reads, and one of them is a heading anchor

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing step 4 of plan `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**Affects:** `stilwerk/chat-voice-en.yaml:46-54`, `stilwerk/chat-voice-de.yaml:47-55`, and both `fusion-workbench/stilwerk/` copies
**Cross-references:** `shared/issues/260818-1637_o_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md` — a different hole in the same gate, about `:N` suffixes rather than about which files are read

---

## What is wrong

The cut was correct on its own terms. The old C05 instruction restated the rule at length
and, after step 2 rewrote that section, contradicted it outright: the profile said a
sketch replacing a paragraph does not count against the line cap while the rule now says
it counts like every other line. Removing the stale copy was right. What remains reads
well and stands alone.

The problem is what it now depends on. C05's instruction is now
(`stilwerk/chat-voice-en.yaml:49-50`):

> For a structure, prefer a small ASCII sketch to prose. The rule is in
> rules/user-facing-output.md, "## Sketch structure instead of narrating it".

**No citation gate reads this file.** Two gates exist and each excludes it for its own
reason:

- `hooks/lib/__tests__/reference-resolution-lint.test.ts:143-190` — `surface()` walks
  `rules/`, `agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, the READMEs,
  `CLAUDE.md`, the shell scripts in `bin/`, `install.sh`, `hooks/*.ts` and
  `hooks/lib/*.ts`. `stilwerk/` is not among them. Its `PLUGIN_PATH_BODY`
  (`:274`) *does* list `stilwerk` as a directory a token may point **into**, so the
  omission is of the surface, not of the vocabulary.
- `hooks/lib/__tests__/workbench-citation-lint.test.ts:111-115` — records that `stilwerk/`
  is deliberately outside its corpus, on the ground that "no path under it can match a
  predicate here". That reasons about paths *under* `stilwerk/`, not about citations
  *inside* the profiles, so it does not settle this case.

Verified: `npx vitest run lib/__tests__/reference-resolution-lint.test.ts` is green at
`BASELINE = { paths: 1258, anchors: 163, records: 116 }`, and that baseline was re-approved
in this range for steps 2 and 3 only. Step 4 added a path token and a heading anchor to
each profile and moved no counter, because the gate never saw them.

The **heading anchor** is the new exposure. C04 already cited `rules/user-facing-output.md`
`## Length` (`stilwerk/chat-voice-en.yaml:41`), so the file-path pointer is not new. A
heading is the fragile half: step 2 of this same plan rewrote the body under
`## Sketch structure instead of narrating it` while leaving its title alone, and a future
step that renames it leaves four files pointing at nothing with no gate to say so.

Both anchors currently resolve: `rules/user-facing-output.md:34` and `:97`.

## A second defect in the same token

The pointer is spelled `rules/user-facing-output.md`, which is plugin-relative. This file
is copied into a consuming project at `fusion-workbench/stilwerk/chat-voice-<lang>.yaml`,
where the project root has no `rules/user-facing-output.md`: `bin/fusion-rules` searches a
project's `./rules/`, but the rule itself ships from the plugin. A reader who follows the
pointer in a consuming project finds nothing.

## What to do

One of three, and they are mutually exclusive on the spelling:

1. **Restate enough of C05 that a broken pointer costs nothing.** Cheapest against the
   budget's intent and the reason the cut was made; it partly undoes the cut.
2. **Extend `surface()` to walk `stilwerk/*.yaml`** and re-approve the baseline with the
   new tokens attributed. The gate walks `pluginRoot` only, so the `fusion-workbench/`
   copies are not double-counted. This makes both profile families gated for the first
   time and is the only route that also protects C04's existing pointer.
3. **Respell both pointers bare**, as `user-facing-output.md` — the file `bin/fusion-rules`
   already hands every agent by absolute path — which is the project's own
   statement-rather-than-pointer remedy. Route 3 forecloses route 2 for these tokens: a
   bare filename is not a path and the gate has nothing left to resolve.

---
Also seen: 260821-2210 by coderev — reached the same finding independently from the shipped-rule side; `surface()` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` walks no `.yaml`, so the four C05 pointers and C04's older `## Length` pointer are the only citations this Circle added that no gate resolves. No second record filed.
