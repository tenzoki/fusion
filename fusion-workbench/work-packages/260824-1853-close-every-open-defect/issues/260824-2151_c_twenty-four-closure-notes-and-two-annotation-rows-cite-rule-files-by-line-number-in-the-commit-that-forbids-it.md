Twenty-four closure notes and two annotation rows cite rule files by line number in the commit that forbids it
---
Commit `01964e4` adds to `rules/fusion-workbench-conventions.md` `## Filename Patterns` the clause "Cite a rule file by heading anchor (`file.md` `## Section`), never by line number: an edit above the line moves it silently, and no gate resolves `path:N`." The same commit closes 24 records whose `Resolved:` lines all end in `rules/<file>.md:<N>`, and leaves the two decision-annotation rows in the same file mandating the line form.
---
**Filed by:** coderev
**Attribution backfilled 260825 (not written by the filing agent):** `coderev` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Severity:** Medium
**Affects:** `rules/fusion-workbench-conventions.md` (`## Filename Patterns`, the `_a_` and `_i_` rows of the decision-marker table, `## Inline State Tracking` `### Decision files`), and the 24 issue records commit `01964e4` renamed to `_c_`.

**Evidence.**

- The new clause: `rules/fusion-workbench-conventions.md` `## Filename Patterns`, last sentence of the wildcard-citation paragraph (added in `01964e4`, closing `260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md` and `260818-1637_*_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`).
- Every one of the 24 `Resolved:` lines the commit wrote cites a rule file as `path:N` (`grep -l 'Resolved:.*rules/[a-z-]*\.md:[0-9]'` over the 24 renamed files returns 24). Examples: `…260814-1332_*_…:78` ends `rules/fusion-workbench-conventions.md:253`; `…260819-0836_*_…:83` ends `rules/fusion-workbench-conventions.md:539`; `…260821-0300_*_…:50` cites three line numbers in two rule files. The record that *motivated* the clause, `260808-0030`, closes with `rules/fusion-workbench-conventions.md:291`.
- Line 253 already does not hold: at HEAD the fallback paragraph is at a different line, because Turn 2 edited the file above it. The clause predicted this.
- The same file still mandates the line form for decisions: the `_a_` row ("MUST cite the answer's location with `Answered: <path>:<line>`"), the `_i_` row ("`Implemented: <commit hash> or <path>:<line>`"), and the two template blocks under `### Decision files`. When the answer or the implementation is a rule file, which for this project is the common case, the two instructions contradict each other and neither says which wins.

**Why it matters.** The closure notes are the evidence a reconciler or a later reviewer verifies a closure against. Cited by line into files this Circle edits in every step, they were stale within the same session. The clause was written to stop exactly this, and the commit that introduced it produced 24 new instances.

**Proposed fix.** Two halves. (1) State the precedence in the `_a_`/`_i_` rows and the `### Decision files` template: for a rule file the location is `file.md` `## Section`; `path:line` stays for code and data, where a line is what the reader opens. One clause in each place, pointing at `## Filename Patterns` rather than restating it. (2) The 24 `Resolved:` lines are records (ontocoder's): rewrite each `rules/<file>.md:N` as the heading anchor of the section it landed in. This is a mechanical pass over the 24 files the commit's stat names.

**Cross-reference.** `260818-1637_*_…` chose not to build the lint extension (its `Resolved:` says so), so nothing will catch the next instance either; that choice is not reopened here.

---
Resolved: fixed — the `## Filename Patterns` clause now scopes the heading-anchor form to living text and names a `Resolved:`/`Answered:`/`Implemented:` line as a point-in-time citation whose form is `path:line`, so the 24 notes and the two annotation rows stand; rules/fusion-workbench-conventions.md:291
