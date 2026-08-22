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

---
**Reconciliation 260821-2349** (reconciler, HEAD `9a68760`). **Confirmed open, unchanged, and all
three routes still available.** In the tree: C05's instruction at
`stilwerk/chat-voice-en.yaml:49-50` still cites `rules/user-facing-output.md` and the heading
`## Sketch structure instead of narrating it` in the plugin-relative spelling, in all four copies.
Both anchors still resolve. `surface()` in `hooks/lib/__tests__/reference-resolution-lint.test.ts`
still walks no `.yaml`, so neither pointer is gated. Nothing this Circle did after the review
touched either half.

---
**Resolved 260822-0100** (ontocoder). **Route 3, plus the heading anchors dropped rather than
respelled.** Both halves of the record are closed in all four copies, and the change is net
negative on every file.

**What changed.** Three tokens per profile, not two. C05 and C04 lost the `rules/` prefix as
route 3 prescribes, and so did the header comment on line 3, which carried the identical
plugin-relative spelling in the identical file and would otherwise have stood three lines above
a fix for the same defect. Every surviving pointer now reads `user-facing-output.md`, which is
the name `bin/fusion-rules` hands every agent by absolute path, so it resolves in a consuming
project exactly as it does here.

**The heading anchors are gone, both of them.** C05's `## Sketch structure instead of narrating
it` and C04's older `## Length` were removed, not respelled. Three reasons, in order of weight.
First, the anchor buys no navigation: `rules/user-facing-output.md` is one of the five always-on
rules, emitted by `bin/fusion-rules` to every agent ahead of the profile, so the only reader of
this file already holds that file whole. An anchor into a document already in context points at
nothing the reader has to find. Second, an anchor is the one token form no gate here can check
and a title-only rename silently breaks, which is exactly the near-miss this record names in step
2. Third, C05's anchor was a verbatim copy of C05's own `name:` field, so it carried no
information at all. What remains says where the rule lives and stops there.

**Arithmetic**, `wc -c` against HEAD `084c626`, per file and per hunk:

```
stilwerk/chat-voice-en.yaml            6844 -> 6751   -93
fusion-workbench/stilwerk/…-en.yaml    6844 -> 6751   -93
stilwerk/chat-voice-de.yaml            7405 -> 7316   -89
fusion-workbench/stilwerk/…-de.yaml    7405 -> 7316   -89
                                                     ----
                                                     -364

en:  header -6,  C04 -34 (28 chars + one line of reflow),  C05 -53
de:  header -6,  C04 -30 (30 chars, still five lines),     C05 -53
```

Both budgets are paid from their own side: nothing was moved between the always-on rule corpus
and the voice profiles, and no file outside the four was touched.

**Verified.** All four parse (`ruby -ryaml`), both pairs are byte-identical (`diff -q`), no
`rules/` or `"##` token survives in either profile, and `npm test` is green at 40 files / 718
tests, exit 0. The `reference-resolution-lint` baseline `{ paths: 1258, anchors: 163, records:
116 }` is unmoved, which is the expected result of removing tokens from a surface it never walked.

**Route 2 is not taken and is now partly moot.** This Circle's decision
`circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_a_which-surfaces-may-this-circle-change.md`
puts `hooks/` out of scope, and the hook test suite has 15 lines of head-room against its growth
bound. Extending `surface()` to walk `stilwerk/*.yaml` remains the right long-term answer for the
**profiles as a surface**, but no longer for these tokens: a bare filename is not a path and the
gate would have nothing to resolve. What route 2 would still buy is the guarantee that a *future*
pointer added to a profile cannot go ungated. That belongs in a later Circle as its own record.

---
Revised by: `circles/260821-1042-reply-bounded-whole-question-answered/issues/260822-0117_c_the-anchor-removal-argument-holds-for-c05-and-not-for-c04.md` — the argument above covered both anchors and reaches only C05's; C04's `## Length` is restored, so the "no `"##` token survives" half of the verification above no longer describes the tree. C05's removal, the bare-filename respelling and every other property verified above stand unchanged.
