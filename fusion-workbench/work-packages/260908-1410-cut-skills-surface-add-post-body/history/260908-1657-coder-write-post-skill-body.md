# `skills/post/SKILL.md` written, and it measures over the step's ceiling

**Status:** Complete
**Filed by:** coder, Kai Stalmann <kai@qantr.com>

Plan step 8 of `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md`. One file written,
`skills/post/SKILL.md`, and nothing else touched. Row 10 (plan step 10) and the roster obligations (plan
step 11) were out of scope by dispatch and were not started.

## What the body carries

Every element plan step 8 enumerates, and no other:

- frontmatter with `description` (what it is, reachable alone as `/fusion:cleanup --only forum`, kept as its
  own body rather than a command) and `allowed-tools: [Bash, Read, Write, AskUserQuestion]`;
- the one-line chat-language declaration in the form `skills/news/SKILL.md` uses;
- the shortened source-root resolution the cut phase established, then `bin/fusion-workbench-root` and
  `"$FUSION_PLUGIN_ROOT/bin/fusion-paths" post` with the exit-3 and exit-4 handling;
- `$WORKBENCH` and `$OUT_FORUM` spelled literally, so the resolver derives the key set from this prompt, and
  no store literal anywhere;
- the composition contract, relocated from `skills/cleanup/SKILL.md`'s message half without change of
  substance: twenty lines in the file, the 1/blank/8/blank/9 split, the two language halves, the pointer
  block's four contents, `wc -l` before the draft is put with cut-and-recount over the cap, the
  context-freedom obligation authored here rather than cited, the write to
  `$WORKBENCH/$OUT_FORUM/<stamp>-<checkout>-<slug>.md`, and no `**Filed by:**` field;
- both invocation shapes on `skills/archive/SKILL.md`'s branch pattern: inline the draft is printed and asked
  as a second question inside the caller's one `AskUserQuestion` call, standalone the body asks its own
  one-question confirmation, writes on yes, touches git not at all and says to carry the file in the next
  commit;
- a boundaries section on `skills/curate/SKILL.md`'s pattern.

One behaviour is this body's own rather than relocated: an unresolved checkout half from `bin/fusion-identity`
stops the write instead of substituting a placeholder into the filename's third field, because that field is
what a reader resolves to a name.

## Measurements

| Quantity | Value |
|---|---|
| `wc -c skills/post/SKILL.md` | **6 972** |
| Plan step 9 ceiling | 6 500 |
| Over by | 472 |
| `bin/fusion-prose-metric` | 0 em-dashes, 946 prose words, verdict `ok` |
| `bin/fusion-paths post` | exit 0, emits `WORKBENCH`, `CIRCLE`, `OUT_FORUM` |

## Verification

`cd hooks && npx vitest run lib/__tests__/path-literal-lint.test.ts lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts`
exits non-zero on one assertion: `reference-resolution-lint`'s pinned reference count moved
`{paths: 1692, anchors: 237}` → `{paths: 1706, anchors: 242}`. Measured to be entirely this file's, by moving
it out of the tree and re-running: the gate is green without it, 38 tests passed. The gate's own failure text
says re-approving the baseline is the expected response and belongs in the same commit as the edit; the
dispatch scoped this to one file, so the number was left for the committing dispatch. `path-literal-lint` and
`workbench-citation-lint` pass.

Two further red assertions were expected and were not investigated: `derivable-enumerations-lint` (plan step
11) and the surface-growth golden (plan step 16).

## The step-9 branch, unanswered

The body is 472 bytes over the ceiling and the plan makes that a stop, not a defect to absorb. Nothing was
trimmed and no further row was cut. The one span that is not a statement of this body's own behaviour is the
source-root resolution and its explaining paragraph, 823 bytes, whose only consumer is the single
`$FUSION_SRC/skills/archive/SKILL.md` pointer in Step 4; removing it and citing that body without the root
variable would measure about 6 137. Whether that is the right cut is the user's answer, not this dispatch's.
