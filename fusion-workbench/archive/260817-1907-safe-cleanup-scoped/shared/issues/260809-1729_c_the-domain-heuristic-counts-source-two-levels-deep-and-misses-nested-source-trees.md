The domain heuristic counts source files two directory levels deep and misclassifies projects whose source sits deeper

---

`agents/orchestrator.md:123` defines `code_files` as "count of project files matching
`*.go`, `*.ts`, `*.tsx`, `*.py`, `*.js`, `*.rs`, `*.java` (top-level + 1 subdir deep, capped
at 1000)". A project that keeps its source under a nesting directory — `codebase/go/`,
`codebase/viewer/`, `src/main/java/`, `packages/<name>/src/` — has none of it at depth two,
so `code_files` comes back near zero while the tree holds thousands of source files. The
`data_files` term has the same shape from the other side: it is scoped to four fixed
directory names (`ontology/`, `manifests/`, `schemas/`, `data/`) with no depth bound, so a
handful of configuration files can outweigh an entire nested source tree.

The two branches that consume the term then fire on a count that does not describe the
project:

```
elif analyses_count > 0 and code_files == 0:   domain = "knowledge"
elif data_files > code_files * 2:              domain = "data"
```

Both are reachable with a full source tree present. The detected domain is passed as the
default `domain` parameter to `taskplanner`, `reconciler` and `playmaker`, so a
misclassification changes how the whole session routes work and what the reconciler expects
to find.

---

**Reported by a consuming project.** The heuristic returned `data` on a literal reading. That
project keeps its Go and TypeScript source at `codebase/go/` and `codebase/viewer/`, three
levels down; the heuristic saw 13 files where the tree holds roughly 17 500. The orchestrator
overrode the verdict to `code` by hand and recorded the correction in its session log, which
is the right handling of a bad number and not a substitute for fixing it.

**Reproduced in fusion's own repository**, this session (`260809-1725`, workbench domain
detection): a `find` bounded at `-maxdepth 2` returned `code_files = 4`. The TypeScript hook
sources under `hooks/lib/` and their tests under `hooks/lib/__tests__/` are at depths three
and four and were not counted. Here the misreading did not change the outcome — no branch
fired and the fallback `code` is correct anyway — so the defect is silent in the plugin's own
repo and visible only where the counts are load-bearing.

Two things worth separating for whoever picks this up:

1. **The depth bound is wrong for the question being asked.** The bound exists to keep the
   scan cheap, and the cap at 1000 already does that job. A depth-bounded count answers "is
   there source near the root", which is not the question the branches ask.
2. **A count of files is a weak proxy for "what kind of project is this".** Before deepening
   the walk, it is worth asking whether the branches want a file count at all, or whether the
   question is decidable from something the mechanism can obtain more directly — a declared
   domain in `CLAUDE.md`, or the language mix git already reports for tracked files. A
   deeper `find` fixes the reported symptom; it does not make the proxy sound. Either way the
   answer should also cover the `data_files` asymmetry, since fixing one term alone moves the
   ratio rather than correcting it.

**Affected text:** `agents/orchestrator.md:118-133` (Setup Step 5, the detection block).
`skills/setup/SKILL.md:227` delegates to it and needs no separate change.

**Breadth, added after the first filing.** The depth bound is only half of it. The extension
list `*.go`, `*.ts`, `*.tsx`, `*.py`, `*.js`, `*.rs`, `*.java` omits whole languages, so a
Kotlin, Swift, C, C++, C#, Ruby, PHP, Scala or Elixir project counts zero source files at any
depth, and the single-file component formats (`.vue`, `.svelte`) are missed alongside them.
Depth and breadth are independent defects with one shared consequence, and a fix that
addresses either alone still misreports.

**The counting mechanism is a decision, not an implementation detail:**
`shared/decisions/260809-1731_o_how-should-the-domain-heuristic-count-a-projects-source-files.md`.
Settle it before writing the fix.

---
Resolved: duplicate. The depth defect was already filed on 260807 as
`shared/issues/260807-1951_o_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md`,
with better evidence (a measured Cargo workspace, 0 counted against 90 present) and the same
affected line. This record was filed without checking the store first, which is the failure
`circles/260801-1244-guard-rules-write/issues/260805-1548_o_beim-filen-prueft-niemand-ob-der-store-denselben-defekt-schon-traegt.md`
describes. The two points that were genuinely new here, the breadth gap in the extension list
and the mirror-image defect in `data_files`, were carried across to that record under
`## Nachtrag 260809`, together with the `git ls-files` measurement. Nothing is lost by closing
this one.
