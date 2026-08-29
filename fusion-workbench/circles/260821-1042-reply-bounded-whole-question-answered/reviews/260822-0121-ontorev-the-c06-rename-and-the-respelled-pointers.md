# ontorev: the C06 rename and the respelled pointers

**Sender:** ontorev
**Reviewed-range:** `084c626..dbf259a`
**Not-opened:** `260821-1042-reply-bounded-whole-question-answered`, `260822-0035-three-before-figures-and-the-after-measurement-defined.md`, `260822-0019-orchestrator-session.md`, `260822-0027-coder-the-bounds-own-figure-replaces-the-wrong-one.md`, `260822-0028-ontocoder-c06-renamed-and-paid-for-by-its-own-restatement.md`, `260822-0035-analyst-three-before-figures-and-the-after-measurement.md`, `260822-0105-ontocoder-c05-and-c04-pointers-respelled-bare-and-anchors-dropped.md`, `260822-0035_*_the-briefings-contamination-grep-marks-49-of-72-transcripts-primed-because-the-setup-skill-body-names-the-files-it-greps-for.md`, `260822-0026_*_forty-eight-commits-stand-behind-the-manifest-version-so-two-bin-helpers-are-unreleased-and-one-is-absent-from-every-install.md`, `260822-0035_*_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md`

**Partially opened, and named here because the field above cannot express it:**
`.../260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md` was read at lines 105-115
only, to verify the resolution note on `260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md`. The rest of that log was not opened.

Three of the not-opened files were excluded by the dispatch, which reserved the analyst's
measurement report and its two `260822-0035_o_*` records for a coderev running in parallel. The
four history logs, the Circle record and the closed release record were not opened for budget;
each of the logs is an executor's own account of a commit whose diff this pass read directly.

---

## Summary

The two commits do what they say and their arithmetic is exact to the byte. Both pairs are still
byte-identical, all four files parse, and every figure the two resolution notes state reproduces.
Six findings, all filed: three about entries neither commit touched, two about C04, one about a
worked figure elsewhere in the tree that these files moved out from under.

The one substantive objection to the range itself is that `dbf259a` gives a single argument for
two anchor removals and the argument only reaches one of them.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 3 |

## What was verified and holds

**Both pairs byte-identical, all four parse.** `diff -q` reports no difference on either pair,
and `ruby -ryaml` loads all four to a `Hash`. The drift class in
`260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`
did not recur.

**The byte arithmetic is exact, per file and per hunk.** Measured with `git show <rev>:<path> | wc -c`:

```
                              084c626   dce8894   dbf259a
stilwerk/chat-voice-en.yaml      6854      6844      6751     -10  -93
stilwerk/chat-voice-de.yaml      7407      7405      7316      -2  -89
fusion-workbench/…-en.yaml       6854      6844      6751     -10  -93
fusion-workbench/…-de.yaml       7407      7405      7316      -2  -89
```

Every claimed figure lands. The per-hunk split in `260821-2204`'s resolution note also reproduces:
English header -6, C04 -34, C05 -53; German header -6, C04 -30, C05 -53. Nothing moved between the
always-on rule corpus and the profiles: `rules/user-facing-output.md` is untouched in this range.

**The three closed records describe what the commits did.** `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`, `260821-2204` and
`260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md` were checked claim by claim. `260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md`'s corrected clause is in place and both
its counts re-measure (18 310 over `lib/__tests__/*.test.ts`, 20 360 over the recursive set, which
matches the last line of `fixtures/surface-growth.golden` and the label at
`hooks/lib/__tests__/surface-growth-bound.test.ts:388`), and the residual it declares standing
does still stand. `260821-2204`'s verification claims all reproduce: no `rules/` or `"##` token
survives in any of the four profiles, and `npm test` is green at 40 files and 718 tests, exit 0.
None of the three overstates.

**C06 no longer duplicates the rule improperly.** The instruction now restates
`rules/user-facing-output.md:80` and `:82` almost word for word, but that is the shape
`260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md` decided at a user gate: the rule is the authoring home and the profile entry the
language-specific echo. Not a defect. Two residuals worth a glance and not worth a record: the
echo says "often the filename or the canonical term" where the authoring home says "usually", and
`260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`'s resolution note cites the pair of bullets as `:80-81` where they sit at `:80` and
`:82`.

**Every entry's examples still match its instruction.** C06's three exhibits now split cleanly
across the renamed entry's two halves, which is what the rename was for.

## Findings

### The name-covers-instruction class has a third member

`260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md`.
Medium.

`260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` was filed as two instances and closed on both. Read as a class it has a third: C04's
"Details go to the end or to a file, not the opening lines" is placement, not brevity, and the
entry is named for brevity. Both languages. `rules/user-facing-output.md:59` states the same clause
as point 4 of `## Information architecture`, whose point 1 the profile's C01 already mirrors by
name, so the rule's list is echoed across two profile entries and only one of them says so. A prior
review saw this and left it unfiled
(`260821-2215-coderev-the-bounded-reply-circle.md:85`).

### The anchor removal is one argument for two different cases

`260822-0117_*_the-anchor-removal-argument-holds-for-c05-and-not-for-c04.md`.
Low.

The executor's argument was tested rather than accepted, and it splits.

For **C05** the conclusion holds and does not need the argument: the removed anchor was
`## Sketch structure instead of narrating it`, character for character C05's own `name:` field one
line above. It carried nothing whether the reader held the rule or not.

For **C04** it does not hold. The removed anchor was `## Length`, which is not recoverable from
"Terse without sentence-length targets". Holding a 20 142-byte document in context answers whether
the reader can reach it, not which of its nine sections carries the line caps. The commit's second
reason, that an anchor is the token form no gate checks and a rename breaks in silence, is true and
is equally true of the bare filename the same commit kept: `surface()` in
`hooks/lib/__tests__/reference-resolution-lint.test.ts` walks no `.yaml` and
`hooks/lib/__tests__/workbench-citation-lint.test.ts:111-115` puts `stilwerk/` outside its corpus,
so nothing in the tree resolves either form. The reason does not distinguish what was removed from
what was kept.

The respelling itself is right and this review does not dispute it. `rules/user-facing-output.md`
resolves nowhere in a consuming project, and the bare name is what `bin/fusion-rules` hands every
agent.

### The German is German in most places and tracked from the English in three

Two records, both filed to `shared/` because none of the text involved was written by this Circle.

`260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md`.
Medium. C02's `name:` says `Referenten`, its instruction says `Bezug`, and AI05 says `Bezugswort`.
English says "referent" in all three, so C02's name and AI05's closing sentence are the same four
words and the German link is gone. This is the fault C06 states, in the file that states it.

`260822-0120_*_the-german-blacklist-forbids-an-ordinary-connective-where-the-english-forbids-a-discourse-marker.md`.
Low. AI01's fourth German example is `Das heißt,` where the English is `That said,`. Those are not
the same phrase: `Das heißt` is `that is to say`, an ordinary joint of German expository prose, and
the entry tells every agent to remove it. It also overlaps AI05's own example `Das bedeutet, dass...`
two entries down. The same record carries a lighter register point on C06's `signifikantesten`.

What the German gets right is worth stating, because the check was for calques and most of the file
passes it: AI05's `Hierbei` for "It", AI08's `Der Punkt ist folgender:` for "Here's the thing:",
AI04's `Eine Aussage, ein Satz.`, and C05 after `dbf259a`, which removed an English heading string
from German prose and is the half of that commit this review has no objection to.

### The id namespace is not stable across the two profiles an agent loads together

`260822-0118_*_ai04-denotes-two-different-rules-in-the-two-profiles-a-prose-agent-loads-together.md`.
Medium.

`bin/fusion-rules analyst` emits `chat-voice-de.yaml` and `default-voice-en.yaml`, so a prose agent
holds one of each family. `AI04` names "Mechanische Aufzählungen" in the first and "Mechanical
tricolons" in the second. Those are different rules, not two names for one, and nothing in either
file says an id is local to it. Five of the eight shared English ids also carry two names for one
rule; German diverges only at `AI04`.

Proximate cause is `1daf063`, one commit before this range, which renamed the chat entry correctly
and thereby separated a German pair that had been identical. Filed as a standing property of the
four files rather than as a defect in that commit.

### A worked figure elsewhere was measured against a file that has since moved

`260822-0119_*_the-prose-metrics-worked-exhibit-reports-six-em-dashes-in-a-file-that-carries-four.md`.
Low, and owned by `coder` rather than `ontocoder`.

`bin/fusion-prose-metric:66-67` says `chat-voice-de.yaml` "carries 6 em-dashes of which 4 are the
anti-example strings it exists to forbid". It carries 4, all four inside `examples:` subtrees, so
the file it uses to demonstrate the YAML exclusion rule has nothing left on the prose side. The
word figure at `:112-120` reads 617 against 595 today. The em-dash half went stale at `02ea2bd`,
inside the Circle that wrote the program; this range moved the word count 606 to 595 and caused
neither. The four profiles are correct as they stand and must not be edited to make the header true.

## Not filed, and why

**English line numbering shifted by one from line 41 down.** `dbf259a` took a line out of C04, so
25 of the 40 live `chat-voice-en.yaml:N` citations in the workbench now point one line high,
including two inside `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`'s own reconciliation note. The class is open twice already
(`260818-1637_*_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`,
`260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md`),
so this is a cross-reference and not a new record. Two observations belong with it. `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`'s
resolution note made a point of stating that line numbering was unchanged and that every existing
citation still resolved, which was true when written and was consumed 35 minutes later by the next
commit in the same Turn. `260821-2204`'s note verifies four properties and does not mention line
numbering at all, so the verification standard moved within one Turn without anything saying so.

**The German AI02 entry forbids `–` while every measurement counts `—`.** Already open as
`260821-2206_*_the-german-voice-profiles-name-en-dash-as-the-character-to-avoid-while-every-other-surface-counts-em-dash.md`,
and `bin/fusion-prose-metric:78-83` states the divergence deliberately. Confirmed still present at
`stilwerk/chat-voice-de.yaml:82`, with the entry's two examples using different dashes, and left to
that record.

**The rule's inventory of the profile names 8 of 9 blacklist and 4 of 6 whitelist entries.** Open as
`260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md`.
The C06 rename does not change it.

**The German C04 instruction rewrapped raggedly**, leaving `stilwerk/chat-voice-de.yaml:44` short
and `:45` carrying two words. Cosmetic, zero bytes either way, and not worth a record.

## Recommended sequencing

1. `260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md` (C04's fourth sentence) and `260822-0117_*_the-anchor-removal-argument-holds-for-c05-and-not-for-c04.md` (C04's missing section pointer) touch
   the same six lines in four files. Take them together or the second edit reflows the first.
2. `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md` (the German referent) is independent and the largest single quality gain.
3. `260822-0118_*_ai04-denotes-two-different-rules-in-the-two-profiles-a-prose-agent-loads-together.md` (the id namespace) needs a decision before an edit, and route 1 in it breaks
   citations this Circle wrote. Put it to the user rather than fixing it.
4. `260822-0119_*_the-prose-metrics-worked-exhibit-reports-six-em-dashes-in-a-file-that-carries-four.md` is a `coder` task in a bash header and blocks nothing.
5. `260822-0120_*_the-german-blacklist-forbids-an-ordinary-connective-where-the-english-forbids-a-discourse-marker.md` is the smallest and can ride with `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md`, same file.
