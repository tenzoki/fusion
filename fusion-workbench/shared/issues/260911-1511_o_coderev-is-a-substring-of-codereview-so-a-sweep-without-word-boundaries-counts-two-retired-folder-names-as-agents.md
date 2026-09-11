coderev is a substring of codereview, so a sweep without word boundaries counts two retired folder names as agents

---

Any pass searching the shipped text for the five agents deleted at v11 must anchor its pattern with `\b`. `coderev` is a substring of `codereview` and `ontorev` of `ontoreview` — the two review folder names retired on 2026-08-15 and still named in migration and layout prose. Without word boundaries the search returns 20 extra hits, none of them an agent name, and the difference is large enough and plausible enough to be mistaken for a real undercount. It was, twice in one session, in opposite directions.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-1422_*_the-retired-agent-readings-population-is-161-where-the-corpus-it-declares-holds-181.md` (closed as not a defect; this is what it actually found); `260910-2146_*_five-deleted-agents-are-still-named-as-live-in-twelve-shipped-files.md` (closed, the sweep this hazard lies in wait for)

**The measurement**, at `fdac1cb0`, over the corpus the reading declares, run with `/usr/bin/grep` and varying exactly one thing:

```
\b(coderev|ontorev|bugfixer|taskplanner|playmaker)\b   161 occurrences, 103 lines, 36 files
  (coderev|ontorev|bugfixer|taskplanner|playmaker)     181 occurrences
  (codereview|ontoreview)                               20 occurrences
```

**Where the twenty sit.** Every one is a sentence about directories rather than about agents: the migration's `codereview:coderev` folder-merge pairs (`skills/migrate/SKILL.md`), the layout tree's `reviews/ # codereview + ontoreview, merged` (`rules/fusion-workbench-conventions.md`), the path-lint's retired-folder fixtures (`hooks/lib/__tests__/path-literal-lint.test.ts`), the store list in `skills/setup/SKILL.md`, and single lines in `README-agents.md`, `hooks/lib/citation-scan.ts` and `hooks/lib/staging-drift.ts`.

**Why it is worth a record rather than a habit.** The wrong figure is not obviously wrong. 181 minus 161 is 20, and 20 is also the combined count of two files a reader can plausibly believe were omitted — `docs/upgrading-to-v11.md` at 13 and `hooks/lib/__tests__/fixtures/dispatch-path.baseline` at 7. Those two are the **unique** two-file subset of the corpus summing to 20, and both are in fact already inside the 161 and already classified. So the boundary-less count arrives with a ready-made explanation of itself that survives a spot check and fails only a per-file reconciliation.

**What it already cost.** One correct reading was declared wrong, the declaration was accepted, the acceptance was reversed, and the reversal was reversed: four passes over one number, three of them dispatches. A defect record was filed against a correct report, and a specification was written on its premise and rewritten twice.

**A second trap in the same area, named because it compounds this one.** `grep` in these sessions is a shell function wrapping ugrep, whose `-c -o` counts occurrences where `/usr/bin/grep -c` counts lines. A measurement that names `grep` therefore does not say which program ran. Pin `/usr/bin/grep` where the count is the finding, or count with `-o | wc -l`, which means the same thing in both.

**Evidence:** the three commands above, each run against a clean `git archive fdac1cb0 | tar -x` export; a per-file reconciliation of the reading's kind tables against a boundary-correct count across all 36 files, returning zero mismatches; `which -a grep` naming a shell function, and `grep --version` naming ugrep 7.8.4.

**Acceptance test:** the convention is written where a future sweep will meet it, not only here — the reading at `260911-1316-five-retired-agents-and-the-container-contradiction-read-site-by-site.md` carries the hazard beside its own figures. Any later pass counting these five names states its pattern with `\b` and names the grep it ran.
