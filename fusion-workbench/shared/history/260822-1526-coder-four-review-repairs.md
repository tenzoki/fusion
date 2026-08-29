# coder — four repairs from the 260822-1506 review

**Status:** Complete
**Dispatched by:** orchestrator
**Circle:** none active (shared store)
**Source:** `260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`

## What was verified before anything was changed

Each of the four findings was checked against the tree.

- **The declined second-order cut.** `bin/fusion-source-root:48-57` carries the two branch
  sentences the record quotes, so the declining reason was false when written. The first `bash`
  block is byte-identical in `setup`, `next`, `cleanup` and `help` (md5 over the four ranges).
  `next` carries one `[ -x ]` call site, the same count as `cleanup` and `help`; `setup` carries
  four.
- **One silent action or two.** `docs/upgrading-to-v9.md:54-59` states the silent domain
  fallback in bold. `docs/upgrading-to-v10-2.md:62-71` is loud (an explicit halt). Two, not one.
- **The bare colon.** `skills/setup/SKILL.md:362` ended in a colon whose next non-blank line is
  the bold Turn-budget paragraph; `skills/next/SKILL.md:51` kept its Exit 1 bullet and is fine.
- **Three claims about `docs/`.** `git tag -l` gives nine tags from `v9.0.0`, `ls docs/` gives
  six notes; the filenames spell the version with a dash; `v10.0.x` and `v10.1.0` have no note of
  their own. All three fail.

## What changed

| File | Change |
|---|---|
| `skills/setup/SKILL.md` | `:30` pointer names three claims; `:32` replaced by the body-local claim the header cannot author; `:362` colon to period |
| `skills/next/SKILL.md` | `:31` pointer names three claims; the second paragraph removed |
| `skills/help/SKILL.md` | `:107` rewritten once, for both help findings |
| `hooks/lib/__tests__/fixtures/surface-growth.golden` | regenerated; diff is exactly the three skill bodies |
| four issue records | `Resolved:` note appended, `_o_` renamed to `_c_` |
| `260822-1421_*_…` | `Revised by:` appended, `Resolved:` note left unedited |
| `260822-1506_*_the-v9-upgrade-notes-preamble…` | one citation's marker rewritten to `_*_`, because this run's rename would have left it stale in a corpus the gate reads |

## Measurements

- `agents/*.md` 401 242 bytes, head-room **16 601**, clause 12 000. Unchanged.
- `skills/*/SKILL.md` 235 778 bytes, head-room **4 662**, clause 3 000. Was 4 016.
- Hook tests 20 073 lines, head-room **302**, clause 300. Unchanged: the reference-resolution
  pin did not move, so no attribution block was written and the two lines of margin were not
  spent.
- `BASELINE` in `reference-resolution-lint.test.ts` unmoved at `{ paths: 1269, anchors: 171,
  records: 115 }`. The first draft of the help repair wrote `ls $FUSION_SRC/docs/upgrading-to-*`
  and the gate rejected it as a dangling `docs/upgrading-to`: the trailing glob is stripped
  before the placeholder exemption applies. Rewritten to `ls $FUSION_SRC/docs/`, which is the
  same token the old line already carried.
- `AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE`, `RULE_BASELINE` each byte-identical
  to `370bfc5`.

Verification: `cd hooks && npm test` — exit 0 (41 files, 724 tests).

Not touched, per the dispatch: the two prose-metric findings, the v9 preamble finding (beyond the
one citation marker), and the stopping-clause finding that goes to the user at the closure gate.
