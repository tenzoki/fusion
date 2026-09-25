# ontocoder — C05 and C04 pointers respelled bare, heading anchors dropped

**Status:** Complete
**Stamp:** 260822-0105
**Circle:** 260821-1042-reply-bounded-whole-question-answered
**Domain:** data
**Task source:** issue `260821-2204` (now `_c_`)
**HEAD at start:** `084c626` (clean tree for the four profile files)

## What was asked

Fix the defect the record names: C05's instruction depends on two citations no gate resolves,
a file path and a heading anchor, and the path spelling is plugin-relative so it resolves to
nothing in a consuming project. Route 2 (extending `surface()` in the hook tests) was ruled out
by the dispatch, on this Circle's decision `260821-1108_*_which-surfaces-may-this-circle-change`
and on the hook suite's remaining growth head-room.

## What was done

Route 3, extended by one file and one token class.

- **Route 3 over route 1.** Route 1 restates enough of C05 that a broken pointer costs nothing.
  It closes the ungated-pointer half and leaves the plugin-relative half standing, and it spends
  bytes against a budget the record itself says the original cut was made to protect. Route 3
  closes both halves at negative cost. The dispatcher's reading checked out.
- **Three tokens per profile, not two.** The header comment on line 3 of each profile carried the
  same `rules/` prefix. Fixing two and leaving the third three lines above them would have closed
  the record while the defect stood in the same file.
- **Both heading anchors removed, not respelled.** C05's `## Sketch structure instead of
  narrating it` and C04's older `## Length`. `rules/user-facing-output.md` is always-on and
  emitted to every agent ahead of the profile, so the only reader of this file already holds that
  rule whole; an anchor into a document already in context points at nothing anyone has to find.
  It is also the one token form no gate here checks and a title-only rename silently breaks.
  C05's was a verbatim copy of C05's own `name:` field.

## Files changed

- `stilwerk/chat-voice-en.yaml` 6844 -> 6751 (-93)
- `stilwerk/chat-voice-de.yaml` 7405 -> 7316 (-89)
- `fusion-workbench/stilwerk/chat-voice-en.yaml` 6844 -> 6751 (-93)
- `fusion-workbench/stilwerk/chat-voice-de.yaml` 7405 -> 7316 (-89)
- the issue record: `Resolved` note appended, marker `_o_` -> `_c_`

Total -364 across the four. Both budgets paid from their own side: no text moved between the
always-on rule corpus and the voice profiles, and nothing outside the four files and the record
was touched. `hooks/`, `rules/`, `agents/` and `skills/` are untouched.

## Verification

- `cd hooks && npm test` exit 0, 40 files / 718 tests, run twice: once after the profile edits and
  once with the renamed record in the tree, because `workbench-citation-lint` recomputes its
  corpus from the tree.
- `ruby -ryaml` load of all four profiles: OK, C04 and C05 instruction strings read back intact.
- `diff -q` on both plugin/workbench pairs: identical.
- `grep` for `rules/` and `"##` in either profile: no match.
- `bin/fusion-prose-metric` on the record: 6 em-dashes over 1082 words, all six the original
  author's; the appended note carries none.

## Left open

Route 2 stays the right long-term answer for the profiles **as a surface**, and it is now moot for
these particular tokens: a bare filename is not a path and the gate would have nothing to resolve.
What it would still buy is that a *future* pointer added to a profile cannot go ungated. Recorded
in the closing note on the issue; it belongs in a later Circle as its own record.

Nothing staged, nothing committed.
