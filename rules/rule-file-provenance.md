# Provenance Headers on Rule Files

**Provenance:** circles/260801-1244-guard-rules-write

**This document is the definition** of the provenance header: where it sits, which three
citation forms are legitimate, what the lint gate checks and what it does not, and who
carries the obligation. No other file may carry a competing or supplementary definition.

Read it when you are about to **create or edit a file under a `rules/` directory** — the
plugin's own, a consuming project's `./rules/`, or a project-wide `.claude/rules/`. That is
the whole trigger, and it is why `bin/fusion-rules` emits this file to no agent: no fusion
agent has writing normative rule text as its routine job, so loading it into all sixteen on
every dispatch would buy nothing for fifteen and a half of them. In the plugin's own
repository `hooks/lib/__tests__/provenance-header-lint.test.ts` catches a missing header;
everywhere else the pointer in `rules/fusion-workbench-conventions.md` is what brings a
writer here.

## Provenance headers on rule files

Every file in the plugin's `rules/` directory opens with a line naming what caused it to exist. A reader who opens a rule learns, within the first ten lines, which record, Circle, or commit put it there, and therefore has a way to ask whether the reason still holds.

**The header.** One line, anywhere in the first ten lines of the file. The canonical written form is:

```
**Provenance:** <citation>
```

Canonical placement is directly under the file's H1 title, on line 3. The ten-line window is tolerance rather than licence. Ten was sized against the pre-header corpus, where the longest opening blockquote ran to line 8 in `context-manifest.md`, so a header placed after that lede would have landed on line 10 and still counted. Every rule file now carries its header above the lede instead, at line 3, which pushed that same blockquote down to lines 5-10. The current bound is therefore tighter than the one the window was sized for: it ends exactly where the corpus's longest lede ends, and in that file a header below the lede would sit at line 12, outside it. The remaining margin is zero, and it costs nothing, because a header on line 3 needs no margin at all. That is also the answer for a future file whose opening blockquote runs long — move the header above the blockquote, not widen the window.

**Three citation forms.** Which one a file uses is decided by what its history supports, not by the author's preference.

1. **A decision record.** A workbench-relative path to a record under a decisions store, for example `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`. Prefer this form whenever a record exists. It is the only form that carries the header's real payoff: the record's marker changes to `_s_` when the decision is superseded, so the rule citing it becomes a retirement candidate any reader can spot.
2. **A Circle.** A Circle **directory** name, for example `circles/260718-1924-v5x-overhaul`. The directory name is used rather than the record filename, because the directory is stable across the Circle's whole lifecycle while the record filename carries a marker that changes. A reader follows the citation, reads whichever `*_circle.md` is present, and takes the state from its name.
3. **The admission plus the introducing commit.** For a file with no recoverable motivating record, written exactly like this:

```
**Provenance:** No motivating record recoverable; introduced in `git:<short-hash>`.
```

The commit is admission-scoped and nothing more. Git is not the provenance mechanism; it is what an honest header falls back to when the alternative is a citation the reader cannot follow anywhere. Do not reconstruct a plausible record for a file that has none. An invented rationale is exactly the fiction this header exists to prevent.

**What the gate checks, and what it does not.** `hooks/lib/__tests__/provenance-header-lint.test.ts` fails `npm test` when a file in the plugin's `rules/` directory carries no `Provenance:` line in its first ten lines, and it names the offending file. It reads the plugin's own `rules/` only. A consuming project's `./rules/` and `.claude/rules/` are in no test set fusion controls, so there the header is documented convention backed by the curator's discipline, and a project gains header-based evidence only for rules written or edited after it adopts the convention. The gate checks that a header is present. It does not read the value and it resolves no cited path, so a header citing something useless still passes, and a header citing a record that was later moved or archived also still passes. What stops a hollow header is review, not the gate.

**`Provenance:` is file-scoped; `Binding decision:` is section-scoped.** The two coexist and mean different things. A `Provenance:` line at the top of a file states why the *file* exists. A `Binding decision:` line inside a section states which record binds *that section*. Neither replaces the other, and a section note never satisfies the gate: the gate reads only the first ten lines, and only for `Provenance:`.

**Whoever writes a rule file writes its header.** An agent that creates a rule file gives it a header in the same edit, choosing the form its history supports. An agent that edits an existing rule file preserves the header, and updates it when the edit is substantial enough that a different record has become the file's reason for existing. This obligation falls first on the curator, whose work is writing and consolidating normative text; in the plugin's own repository the lint gate backs it, and everywhere else the discipline stands alone.

Binding decision: `shared/decisions/260801-1020_a_provenance-header-on-rule-files.md`.
