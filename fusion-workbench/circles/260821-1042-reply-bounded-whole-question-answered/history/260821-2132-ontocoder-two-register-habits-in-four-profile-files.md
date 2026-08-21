# Two register habits named in the chat profiles, paid for inside the profiles

**Agent:** ontocoder
**Date:** 2026-08-21
**Status:** Complete
**Task:** Step 4 of `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_o_plan-reply-bounded-whole-question-answered.md`

## What changed

Four files, two pairs, each pair byte-identical:

- `stilwerk/chat-voice-en.yaml` and `fusion-workbench/stilwerk/chat-voice-en.yaml`
- `stilwerk/chat-voice-de.yaml` and `fusion-workbench/stilwerk/chat-voice-de.yaml`

Three edits per file, the third paying for the first two.

**AI04** ("Mechanical triads" / "Mechanische Dreiergruppen") reached a three-part list
inside a sentence and now reaches the shape of a whole reply as well: an enumeration is
not the default shape of a reply, and one thing to say is one sentence. The entry gained
an `examples:` block carrying the shorter form beside the habit.

**C06** ("One name per thing" / "Eine Benennung pro Sache") governed one name per entity
and now governs one formulation per claim: a claim said twice does not become truer. The
entry's existing `examples:` block gained the before and after.

**C05** ("Sketch structure instead of narrating it" / "Skizze statt Prosa bei Struktur")
was the cut. Its instruction restated `rules/user-facing-output.md`
`## Sketch structure instead of narrating it` in full, including a sentence the rule file
no longer holds: the old profile text said a sketch replacing a paragraph does not count
against the line cap, while step 2 of this plan rewrote that section so a sketch counts
like every other line. The instruction is now the entry's own one-line rule plus a pointer
at the section, and the ASCII sketch example is kept.

The pointer runs profile to rule and never the other way. Every agent reads the rule file;
the profile can be absent from a workbench entirely, so a rule file pointing at a profile
would point at nothing. That direction is forced by the plan, not chosen here.

## Byte deltas, measured against HEAD

Command: `for f in <path>; do b=$(git show HEAD:$f | wc -c); a=$(wc -c < $f); echo $((a-b)); done`

| File | Before | After | Delta |
|---|---|---|---|
| `stilwerk/chat-voice-en.yaml` | 6876 | 6864 | -12 |
| `stilwerk/chat-voice-de.yaml` | 7480 | 7438 | -42 |
| `fusion-workbench/stilwerk/chat-voice-en.yaml` | 6876 | 6864 | -12 |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 7480 | 7438 | -42 |

Each file is net negative, so the profiles' own budget is met without borrowing from the
rule file's. `rules/user-facing-output.md` was not opened for writing in this step.

The English file was `+2` on the first pass. It was brought under by shortening the new
C06 example in both languages rather than by taking bytes from anywhere else, which also
kept the two languages saying the same thing.

## Verification

- `diff -q` on both pairs: identical, reported per pair.
- `ruby -ryaml -e 'YAML.load_file(...)'` on both files: parses, 15 entries each, entry
  shape (`id`, `name`, `instruction`, optional `examples`) unchanged.
- `grep -n '^## Sketch structure instead of narrating it$' rules/user-facing-output.md`:
  line 46, so the cited heading resolves. Neither citation gate scans `.yaml`, so this was
  checked by hand rather than by the suite.
- `cd hooks && npm test`: exit 0, 40 files, 718 tests.

Nothing under `hooks/` was written. The three modified files there are step 2's and step
3's uncommitted work and were left alone, as were `rules/user-facing-output.md` and the
plan.

## What this step does not establish

The two clauses land unenforced. No gate reads a chat profile's contents:
`rules-voice-profile.test.ts` asserts which profile paths resolve and nothing about what is
in them. Whether an agent's reply changes because AI04 now names the shape of a reply is
not observed by this step and not observable from anything the workbench stores.
