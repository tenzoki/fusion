# The source-root block cut from `skills/post/SKILL.md`, and the body lands under the ceiling

**Status:** Complete
**Filed by:** coder, Kai Stalmann <kai@qantr.com>

Plan step 8 of `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md`, continued. The user
answered the over-ceiling branch this Circle's previous log left open
(`260908-1657-coder-write-post-skill-body.md` `## The step-9 branch, unanswered`): remove the source-root
block. One file touched, `skills/post/SKILL.md`, and nothing else.

## What came out

Two edits, both inside Step 1 and Step 4 of the body:

- the `$FUSION_SRC` resolution block deleted whole — the sentence introducing it, the guarded
  `bin/fusion-source-root` branch, and the paragraph explaining why the branch, why it is a call and why the
  call is guarded. Measured at 823 bytes before the cut and removed exactly, with no other span touched.
- the one pointer that consumed the variable, in Step 4's standalone shape, rewritten from
  `$FUSION_SRC/skills/archive/SKILL.md` `## Process` step 6 to `skills/archive/SKILL.md` `## Process` step 6 —
  an identification of the body rather than a path to open, which is how an agent prompt cites a rule file.

Nothing else was trimmed. The block was the one span in the file that did not state this body's own
behaviour, and plan step 8's mandatory list never required it; it was in the file because the writing
dispatch named the shortened source-root form explicitly.

## Measurements

| Quantity | Before | After |
|---|---|---|
| `wc -c skills/post/SKILL.md` | 6 972 | **6 137** |
| Plan step 9 ceiling | 6 500 | 6 500 |
| Over by | 472 | under by 363 |
| `bin/fusion-prose-metric` prose words | 946 | 890 |
| `bin/fusion-prose-metric` em-dashes | 0, verdict `ok` | 0, verdict `ok` |

The figure matches the estimate the previous log carried, 6 137, to the byte.

`bin/fusion-paths post` still emits `WORKBENCH`, `CIRCLE` and `OUT_FORUM` at exit 0: the removed block named
no resolver key, so the derived key set is unchanged.

## The pinned reference count, re-measured and not repaired

`reference-resolution-lint`'s baseline is `{paths: 1692, anchors: 237}`. Before this cut the tree measured
`{paths: 1706, anchors: 242}`; after it, **`{paths: 1703, anchors: 242}`**. The cut removed three path
citations and no anchor — the `## Process` anchor survives the rewrite, since only the root variable left the
pointer, not the citation. Re-approving the baseline belongs with the roster edits in a later step and was
deliberately not done here.

## Verification

| Command | Exit |
|---|---|
| `cd hooks && npx vitest run lib/__tests__/path-literal-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` | 0 (35 tests) |
| `bin/fusion-prose-metric skills/post/SKILL.md` | 0 |
| `bin/fusion-paths post` | 0 |

Three assertions stay red by dispatch and none is this dispatch's to repair: `reference-resolution-lint` on
its pin, `derivable-enumerations-lint` until the roster edit (plan step 11), and the surface-growth golden,
rebuilt once at the end (plan step 16).

No git command was run. The committing dispatch carries the change.
