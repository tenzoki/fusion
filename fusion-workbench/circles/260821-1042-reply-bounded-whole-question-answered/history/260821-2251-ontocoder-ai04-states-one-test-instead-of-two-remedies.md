# AI04 states one test instead of two remedies, and the German says it in German

**Agent:** ontocoder
**Date:** 2026-08-21
**Status:** Complete
**Task:** Turn 2 repair of the AI04 extension, at a user gate, per
`circles/260821-1042-reply-bounded-whole-question-answered/reviews/260821-2210-ontorev-two-register-habits-in-the-four-chat-voice-profiles.md`
findings A1, C1 and the AI04 half of A3.

## What changed

Four files, two pairs, each pair byte-identical. One edit per file: the AI04 entry's `name:`
and `instruction:`. Nothing else in any of the four moved, and the `examples:` block is
untouched.

**English**, `stilwerk/chat-voice-en.yaml` and `fusion-workbench/stilwerk/chat-voice-en.yaml`:

    name: "Mechanical enumeration"
    instruction: |
      Use an enumeration only when the items are parallel and the reader needs
      to count them; otherwise write sentences, and never pick a list length
      for its rhythm. One thing to say is one sentence.

**German**, `stilwerk/chat-voice-de.yaml` and `fusion-workbench/stilwerk/chat-voice-de.yaml`:

    name: "Mechanische Aufzählungen"
    instruction: |
      Eine Aufzählung nur dann verwenden, wenn die Glieder parallel sind und
      der Leser sie zählen muss; sonst Sätze schreiben und die Zahl nie nach
      dem Rhythmus wählen. Eine Aussage, ein Satz.

## Why this shape

The finding was that the entry carried two remedies for two different faults and let an
agent satisfy either one. Sentence 2 said keep the list and change its length; sentence 3
said the list is not the shape. The repair is not a third sentence reconciling them but one
test that both faults are cases of: a list is licensed by its content, never by its rhythm.
Choosing three items because three sounds finished and opening a reply with a numbered list
are then the same error at two scales, and "never pick a list length for its rhythm" is what
survives of the old rule — as the length half of the new test rather than as a rival to it.

The extension the Circle landed is intact and is what the entry now leads with: the first
clause is about using an enumeration at all. The shorter form kept its place at the end,
"One thing to say is one sentence" / "Eine Aussage, ein Satz".

The word "default" is gone from both sentences, which is the review's second gap taken as
far as text takes it. The entry now names something a single draft can be held against — are
these items parallel, does the reader need to count them — rather than a disposition across
many replies. The residual, stated rather than left to be found: that test is a judgement,
where AI02 names a character and AI01 names phrases. The review's own candidate has the same
residual, and no wording of this entry removes it; only a measurement would, and none is
proposed.

The third gap closes with the same clause. "One thing to say is one sentence" was the whole
gloss and covered only the one-item case; the test in front of it now covers the case the
entry exists for, three findings that are genuinely three.

**German register.** The clause was rewritten as German rather than translated. Infinitive
imperative throughout ("verwenden", "schreiben", "wählen"), which is the form every other
German instruction in the file uses; the calqued `hat nicht die Aufzählung als Default-Form`
is gone with the sentence it sat in; `eine Sache` is `eine Aussage`, which keeps the "to
say" the English gloss carries; and both `Default-` compounds are gone, where the review
asked only for the second. `Glieder` and `die Zahl` are the terms the entry already used for
those two things, kept rather than varied, which is C06 applied to the file itself.

**The rename.** "Mechanical triads" no longer described an entry whose subject is
enumeration and whose one example is a list of one. `name:` is the lookup surface an agent
scans, so it moved with the instruction. The record's byte estimate was off in both
languages and both are absorbed: English +5, not −1 (17 characters to 22); German 0, not −1
(`ä` is two bytes in UTF-8).

**C06's name was deliberately left.** The clause it undersells is the one whose residency in
the profile is the open question in
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`,
which the review recommends taking to the user rather than fixing, and both routes there
move or copy the clause out of the profile. Renaming for a half that may leave spends +7
bytes English and +9 German on text that would then be renamed back. That record's own
issue file stays `_o_` for the C06 half, with the reasoning appended to it.

## Budget

Each file net negative, so nothing was borrowed from any other surface, and
`rules/user-facing-output.md` was not opened for writing.

| File | Before | After | Delta |
|---|---|---|---|
| `stilwerk/chat-voice-en.yaml` | 6864 | 6854 | −10 |
| `fusion-workbench/stilwerk/chat-voice-en.yaml` | 6864 | 6854 | −10 |
| `stilwerk/chat-voice-de.yaml` | 7438 | 7407 | −31 |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 7438 | 7407 | −31 |

Measured with `wc -c` against `git show HEAD:<path> | wc -c`.

## Verification

- `cd hooks && npm test` — exit 0, 40 files, 718 tests. Run twice: once after the profile
  edits, once after the record writes, because `workbench-citation-lint` recomputes its
  corpus from the tree and the second run is the one that covers these records' own
  citations.
- Both pairs byte-identical: `md5` gives `f07d98e69d8c2a830370d9f2dc11eed2` for both English
  copies and `42f85dc9f3e1c3066ffecdfedee54a8e` for both German; `diff -q` silent on both
  pairs.
- All four parse: `ruby -ryaml` `safe_load` (the sandbox has no PyYAML). Top keys `name,
  description, scope, whitelist, blacklist, examples, settings` in all four; whitelist `C01
  C02 C03 C04 C05 C06` and blacklist `AI02 AI01 AI05 AI06 AI04 AI07 AI08 L04 AI11` in all
  four; no entry carries a key outside `{id, name, instruction, examples}` and none is
  missing `id`, `name` or `instruction`.
- `bin/fusion-prose-metric` — 0 em-dashes in each profile, verdict `ok`, exit 0.
- `git status --porcelain` — the four profiles and these records only. The other task's
  edits to `rules/user-facing-output.md`, the golden, the plan and two issue records are
  untouched, and no whole-tree git command was run.

## Records

- Closed `_o_` → `_c_`, one at a time by name, each with a `Resolved:` note:
  `260821-2203_*_ai04s-remedy-change-the-item-count-does-not-answer-its-new-fault-using-a-list-at-all.md`
  and `260821-2205_*_the-german-ai04-clause-reads-as-a-calque-of-the-english-one.md`.
- Left `_o_` with a progress note:
  `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`,
  for the C06 half only.
- Filed: `260821-2251_*_the-rules-blacklist-gloss-names-three-part-lists-while-ai04-now-governs-enumeration.md`.
  The rename makes `rules/user-facing-output.md:18` name the narrower rule, and that line is
  the only statement of AI04 reaching a project with no `stilwerk/`. Filed rather than
  appended to its neighbour in `shared/`, which is about the same line's missing entries,
  because another task held that file at the time and a same-line append would have been the
  live-tree mutation `shared/issues/260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`
  is about.

## Not done, and not silently

The two long-form profiles keep their own AI04 (`stilwerk/default-voice-en.yaml:165`,
`default-voice-de.yaml:168`), still named for triads and still about triads only. That is
correct for those files — the extension was scoped to the chat register — but the id now
carries two different subjects across the two families. No record is filed: the divergence
is by design and this note is the statement of it.
