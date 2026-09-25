Step 3 mandates one collected pointer table and the criterion's first application leaves eighteen pointers scattered

---

`rules/context-lean-claude-md.md` `### Step 3` tells a project to collect its pointer lines into one table and names a scatter as the failure. `CLAUDE.md`, the file the rule's own worked examples are drawn from, carries 27 pointer lines of which 9 are in a table and 18 are not.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** `rules/context-lean-claude-md.md:244-247`:

> Collect the pointer lines into the one table described under *What stays always-on* above, rather than leaving each one stranded where its section used to be. The table is what a reader scans; a scatter of orphan lines is the old file with the text removed.

At `7ea6e40b`, `CLAUDE.md`'s 27 pointer lines sit in four places, counted off the `**Pointer left behind**` blocks of `260916-1612-curator-run.md`:

| Where | Pointers | Entries |
|---|---|---|
| `## Layout` table | 9 | `L05`–`L10` |
| `## Conventions` bullets | 12 | `L11`–`L20` |
| `## What this is` bullets | 3 | `L02`–`L04` |
| bare sentences (preamble, `## Release process`, `## Where to look when something breaks`) | 3 | `L01`, `L21`, `L22` |

The curator saw this and named it `C02` in `260916-1612-curator-run.md` `## 8` — reported rather than offered, because the collected table's Before text did not exist until the 22 relocations had landed. Step 8 of the plan did not pick it up and no record was filed, so the work was lost in exactly the way `C02` said it should not be.

**Why this matters beyond fusion's own file.** The rule is shipped and a consuming project is told to apply it. The one worked application it can look at does the opposite of what Step 3's last paragraph says.

**The fork is real and belongs to the user.** Either `CLAUDE.md` collects its pointers into `## Layout` — which changes what `## What this is`, `## Conventions`, `## Release process` and `## Where to look when something breaks` are left holding — or Step 3's mandate is softened to permit a pointer staying where its passage stood. Both are defensible; what is not defensible is the rule and its own example disagreeing.

**Acceptance test.** Either every pointer line in `CLAUDE.md` sits in one table, or `rules/context-lean-claude-md.md` `### Step 3` stops mandating that they do. Whichever lands, the rule and `CLAUDE.md` agree in the same commit.

**Cross-references:** 260916-1612-curator-run.md, 260916-1126_*_implementation-human-facing-docs-leave-claude-md.md, 260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md

---
Resolved: carried into `260922-0922_*_does-claude-md-collect-its-pointers-into-one-table-or-does-step-3-stop-mandating-it.md` by the commit that carries this line. The record turns on the fork it names as the user's: either `CLAUDE.md` collects its pointers into one table, which decides what four of its sections are left holding, or `rules/context-lean-claude-md.md` `### Step 3` stops mandating it. The fix, the rule and its worked example agreeing in one commit, lands when that decision is implemented.
