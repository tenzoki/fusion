# Closing review — the `CLAUDE.md` relocation, the gates that followed it, and the criterion that governed it

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `99fbaa8a..7ea6e40b`
**Not-opened:** none
**Review domain:** code

**On the not-opened field.** Every file the range changed was opened, including the four compiled
`hooks/dist/` artifacts and the workbench records. Two of them — `README-agents.md` at 83 407 bytes and
`README-hooks.md` at 152 544 — were read in full only mechanically (every relocated passage matched against
the whole file, every heading enumerated) and by eye only in the regions this range touched. That is stated
rather than hidden behind a bare `none`.

**The carried not-opened list from the previous review reads "(not recorded)".** The pre-tag pass over
`8ffe3b23..d3ff530c` wrote `**Not-opened:** none`, but it covers a range that ends before this one begins, so
it carries nothing forward into this scope. There is no inherited scope to add, and that is a recorded
absence rather than a "none" read out of silence.

## Summary

Nine commits. 22 passages left `CLAUDE.md` for two READMEs, 62 505 bytes over 130 lines down to 8 114 over
66, behind 27 pointer lines. **The relocation itself is correct** — verified independently, not taken from
either agent's report: 22 of 22 After texts occur exactly once at the section their ledger entry names, zero
times anywhere else, every Before text is absent from `CLAUDE.md`, and all 27 pointer lines are on disk. Not
one passage arrived twice and not one failed to arrive.

**The head-room raise is clean and re-derives to the line**, floor unmoved, no baseline touched, margin zero
after. **No gate asserts less than it did**, and three assert more.

Eight findings, none critical, one high. Seven are about **text**, not mechanism, and six of those are the
same shape: a sentence that was true where it was written and is false, circular or unresolvable where it now
sits. That is the class a relocation produces and the class no gate in this project can see.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 5 |
| Low | 2 |

Filed as `260916-2204` through `260916-2211`, eight records in this item's issue store.

## Findings by theme

### A moved passage keeps its old address, and six sentences now point at the wrong thing

Six of the eight findings are this. The work moved text byte for byte, which is what the spec asked for
("a passage that moves moves as it reads") — and byte-for-byte is exactly what leaves every *this file*,
*here*, *this row* and *above* pointing where the passage used to be.

**`260916-2205` (High) — the growth-bounds bullet now claims a bound over a file nothing bounds, two lines
below the sentence saying nothing bounds it.** `README-hooks.md:514`, inside `### Growth bounds on the
shipped text`:

> **One further bound works differently and reaches this file**: `hooks/lib/__tests__/fixtures/dispatch-path.baseline` charges `CLAUDE.md` to all eleven dispatch paths at **zero head-room**, so N bytes added here puts every path N over at once and must be paid for inside the same paths.

`README-hooks.md:512`, same section:

> Nothing bounds them, and nothing bounds `hooks/*.ts`, `hooks/lib/*.ts`, `bin/`, `docs/` or the READMEs either.

The warning is the one a `CLAUDE.md` edit meets first and is worth keeping — at an address where it is true.
The same passage also cites its own file and its own section as where the table lives.

**`260916-2206` (Medium) — the dispatch-parameters bullet points at the section it sits in.**
`README-agents.md:79` says the roster is authored once in `README-agents.md` `## Dispatch parameters`, says
"do not restate it here", and says "two facts belong in this file" — from inside `## Dispatch parameters`,
28 lines below the table. Nothing false; the sentence's whole work is gone.

**`260916-2207` (Medium) — a pointer that resolves nowhere.** `README-agents.md:199` sends the reader to
"the skill-bodies bullet under `## What this is`". `README-agents.md` has no `## What this is`, and the file
that does no longer carries the bullet — it moved into `README-agents.md:262` in the same commit, 20 lines
below a section intro at `:242` that already stated the same division.

**`260916-2204` (Medium) — `CLAUDE.md:66` asserts nineteen symptom rows against a table of seventeen.** This
one is not inherited: the table's row count was 17 before the move and is 17 after. The figure came from
`260916-1058_*`'s measurement of "9 648 across 19 table rows", a `grep` that counted the header and the
`|---|---|` separator, and it was written fresh into a new pointer line. `rules/critical-stance.md` §5, in
the one file the work item exists to make trustworthy.

**`260916-2211` (Low) — a live digit lost its gate in the move.** `The 11 agent prompts` now stands in two
files; `CLAIMS` gates the `CLAUDE.md` copy and nothing gates `README-agents.md:49`. One array entry.

**`260916-2209` (Low)** belongs here too and is stated under the next theme.

**Why none of this reddens the suite.** `reference-resolution-lint` resolves path tokens and their anchors,
and every token in all six resolves. Nothing in this project reads which file a sentence's *this file*
denotes, and a bare backticked heading with no path beside it is not a token of any pinned class. I swept all
22 relocated passages for both shapes: five cite their own destination file, two of those cite their own
destination section, and exactly one bare same-document heading fails to resolve at its new home. The other
three bare headings (`## Project language`, `## Origin Rule`, `## Where this work stops`) each name a file
the surrounding prose identifies and are sound.

### The criterion and its first application disagree

**`260916-2208` (Medium) — Step 3 mandates one collected pointer table; `CLAUDE.md` leaves 18 of 27 scattered.**
`rules/context-lean-claude-md.md:244-247`: *"Collect the pointer lines into the one table … a scatter of
orphan lines is the old file with the text removed."* On disk: 9 in the `## Layout` table, 12 in
`## Conventions` bullets, 3 in `## What this is` bullets, 3 as bare sentences. The curator saw it, named it
`C02` in its run file with a sound reason for not proposing it then (the Before text did not exist yet), and
said "it is named here so the work is not lost". Step 8 did not pick it up and no record was filed. The rule
is shipped and a consuming project is told to apply it; the one worked application it can look at does the
opposite.

**`260916-2209` (Low) — the rule says nothing restates the division, and `agents/curator.md` restates three
of its clauses.** `rules/context-lean-claude-md.md:181` asserts it as a fact about the tree.
`bin/fusion-claude-md-weight:81-86` holds to it explicitly. `agents/curator.md:309`, rewritten in this range,
carries the one-level-per-file rule, the not-necessarily-top qualification and the preamble-is-a-passage
rule. All three are true today, so nothing downstream is wrong — the rule's own sentence is. Same class as
`260916-1316`, which this range repaired, surviving in the third surface.

**`260916-2210` (Low) — Step 1's split is incomplete.** Two branches: shallowest level with ≥2 headings, else
shallowest level present. A `CLAUDE.md` with no heading falls through both, while
`bin/fusion-claude-md-weight` answers `heading-level=0` with the whole file as one passage. The section claims
completeness (*"the passages sum to the file with nothing left over"*), which `rules/critical-stance.md` §4
makes a defect class.

## What checked out, stated because it was checked

**The relocation, verified independently of both agents' reports.** Parsed all 22 ledger entries out of
`260916-1612-curator-run.md` and matched every block against the tree at `7ea6e40b`:

| Property | Result |
|---|---|
| After text present at its named destination | 22/22, exactly once each |
| After text present in any non-destination file | 0/22 |
| After text landed under the heading the entry names | 22/22 |
| Before text still in `CLAUDE.md` | 0/22 |
| Pointer lines on disk | 27/27 |
| Bytes moving, summed over the ledger | 59 308 — the run file's own figure |
| Destination growth vs bytes received | `README-agents.md` +37 343 against 37 118 received; `README-hooks.md` +22 749 against 21 981 plus the 640-byte reach block. The residues are the `rows2bullets` prefixes and blank lines |
| `62 505 − 54 391 = 8 114` | holds |

**The head-room raise is the named event, not a re-baselining wearing its clothes.** The diff to
`surface-growth-bound.test.ts` is two lines: the constant and its doc comment. Re-derived from the tree, not
from the log:

| Claim | Verified against |
|---|---|
| `TEST_LINE_HEAD_ROOM` 2 693 → 2 821, +128 | the diff |
| floor 19 228, unmoved | summed over `TEST_LINE_BASELINE`, 50 entries, at `7ea6e40b` |
| surface 21 921 → 22 049, +128 | `wc -l` summed over every `.ts` under `hooks/lib/__tests__/`, and the golden's two moved rows |
| the +128 decomposes 77 + 51 | `claude-md-weight.test.ts` 131→208, `derivable-enumerations-lint.test.ts` 425→476 |
| budget 22 049, margin **zero** after | 19 228 + 2 821 |
| 154 − 59 + 98 + 128 = 321, the standing raise | arithmetic, and the table's third column |
| "stripped … still 63 lines: 81 → 115 and 284 → 313" | stripped both files at `611658de` and at `7ea6e40b`; all four figures reproduce exactly |
| no other baseline moved | no `dispatch-path.baseline`, no `RULE_BASELINE`, no `AGENT_`/`SKILL_BASELINE` in the range's file list |

**No gate asserts less, and three assert more.** Gate by gate:

- *Skill roster.* The closed direction was already retired before this range (`da1c62ed`). It is **restored**,
  anchored to the sentence that claims it rather than to the file that carried it, with a loud failure on a
  reworded or absent claim. Net gain.
- *Selector roster.* New gate, `SEL` against the selector table as sets. Net gain; it is the fix `260916-1323`
  could not afford when the surface stood at zero.
- *Agent counts.* Five `CLAIMS` rows before and five after, same assertion body, and `hits.length > 0` still
  fails loudly on an absent claim. **The two rows kept rather than dropped were kept for the reason given,
  and I checked it against the file rather than taking it:** `README.md`'s `N specialized agents` gates a
  different file, and `README-agents.md`'s `of the N prompts` (line 182) is a different sentence from
  `all N inherit` (line 49). Dropping either would leave a live digit gated by nothing. One occurrence did
  slip through — `260916-2211`.
- *DEFINITION_SITES.* `read("CLAUDE.md")` → `read("README-hooks.md")`, same predicate, line-neutral, and the
  passage really did move whole to that file.
- *Reference-resolution pin.* 1568 → 1619 across seven re-approvals, each naming the swap-back method the
  `BASELINE` line mandates. Appended to the existing line rather than a new one, which is the deviation the
  plan declared in advance and for the reason it gave.
- *`REACH.excluded` in `domain-cascade.ts`.* Re-measured `fires` → `clean` with a note saying where the firing
  line went, and a `README-agents.md` entry added at `fires` so the cost stays asserted. Re-measured, not
  bumped, as the dispatch said.
- *`config.test.ts`.* `PROJECT_SET_KEYS` narrowed from two members to one, which makes the byte-identity
  comparison **stricter**: the `orchestrator` container is no longer cut out of either side. Net gain.

**The suite is green on the pinned tree, not on the working tree.** Another session has been committing to
this repository throughout; `HEAD` moved to `10978bff` mid-review. I exported `7ea6e40b` to a scratch tree and
ran the suite there: **56 files, 943 tests, 939 passing**, the four failures all in `committed-dist.test.ts`
and all because a `git archive` export is not a git work tree. Every gate above passes at the range's own tip.

**The new weight-helper cases pin the measurement, and their fixture arithmetic is derived rather than
transcribed.** `11 + 36 + 48 = 95` over `3 + 5 + 2 = 10` lines checks out byte for byte, the fenced `##` is
correctly not a heading, and `heading-level=2` is what the rule produces for one `#` and two `##`. The
`--threshold not-a-number` case is the one the old exit-code assertion could not carry, and the comment says
so.

**The division rule answers all three shapes it claims to, and I ran each rather than reading it.** A lone
`# ` title over two `## ` → `heading-level=2`, title in the preamble. One `## ` over three `### ` →
`heading-level=3`. No level with two → `heading-level=1`, one passage covering the file. The helper and the
rule agree on all three; they part only on the fourth shape the rule does not name (`260916-2210`).

**Both worked classifications classify units the rule itself produces, and both figures reproduce.** The
preamble is 7 lines and 414 bytes at `7ea6e40b` exactly as stated; `## Release process` was 10 372 and is 261,
both measured as heading-plus-everything-under-it, which is Step 1's own definition of a passage. The
declarations' "43 of those bytes" is 42 plus the second line's newline, consistent with how the 414 is taken.

**`CLAUDE.md` kept what the plan said it must.** Both language declarations, the identity paragraph, the
`## Layout` pointer table, `## Testing during development`, and the topic-free conventions: namespaced
dispatch, workbench-only writes, the bootstrap-is-setup-only rule with its whole `EXEMPT_SKILLS` sentence, the
`dir/*` `.gitignore` form, the manifest-version bump, critical-procedures-are-skills, and the one-line
growth-bound warning. Every section named in the 27 pointers exists in the file it names. Three pointers name
their destination descriptively rather than by heading ("the skills section", "the per-project configuration
section"); Step 3 makes the section optional, so this is worth knowing and is not a defect.

## Cross-cutting observations

**The relocation's one systematic failure mode is deixis, and it is invisible by construction.** Six of eight
findings are a sentence whose referent moved with it. The suite's text gates read tokens — paths, anchors,
`/fusion:` names, digits — and a pronoun is none of those. Nothing in the range weakened that; the range
simply performed, in one commit, 22 instances of the operation those gates cannot follow. If this repository
relocates prose again — and `260916-2208` is a proposal to relocate 18 more pointer lines — the cheapest
insurance is a pass over the moved text for *this file*, *here*, *this row*, *above* and *below*, done at the
destination, before the source is cut. It costs one grep per entry and would have caught all six.

**Two of the eight are a statement that was true when written and is checked by nothing** (`260916-2204`,
`260916-2209`). The previous review named that as the standing gap; it is still standing, and this range added
to it while also closing four of its instances.

**The surfaces are at zero and one.** `hook-tests` stands at 22 049 against 22 049 and `skills/` at 3 bytes of
margin. Of the eight findings, only `260916-2211` asks for a line on a bounded surface, and it is one array
entry. The other seven land in `CLAUDE.md`, the READMEs, `rules/` and `agents/curator.md` — the first three on
no bound at all, and `agents/` has 49 666 bytes of room. **Nothing here needs a raise**, which is worth saying
plainly given how much of this item's history was spent on one.

## Recommended sequencing

1. **`260916-2205`** — the only finding where a shipped surface states something false about a bound. One
   sentence, no surface cost.
2. **`260916-2204` and `260916-2207`** — a wrong count and a pointer that resolves nowhere, both in the two
   files this work exists to make readable. Cheap, and they are what a reader meets first.
3. **`260916-2208`** — the fork belongs to the user: collect the pointers, or soften Step 3. Do not let it sit
   as a candidate a second time.
4. **`260916-2206`, `260916-2209`, `260916-2211`** — one edit each, no dependencies.
5. **`260916-2210`** — one clause in Step 1, whenever the file is next open.
