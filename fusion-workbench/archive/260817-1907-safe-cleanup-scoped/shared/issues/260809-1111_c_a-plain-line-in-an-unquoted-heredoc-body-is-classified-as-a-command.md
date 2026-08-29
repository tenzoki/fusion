# A plain line in an unquoted heredoc body is classified as a command

---

**Severity:** Medium — false denial (safe direction), on the recurring case of writing documentation about git
**Domain:** code
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/lib/shell-parse.ts` (`stripData` heredoc branch at `:234-309`, newline segmentation at `:410-414`)
**Cross-references:**
`260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md` (closed; the quoted-delimiter half of the same family, and the resolution that deliberately left this half standing),
`260809-1103-guard-enforced-policies.md` §Findings 2a-1

---

## What is wrong

A heredoc with an unquoted delimiter has its body preserved as code, and the segmenter then splits on newlines, so every line of the body is classified as its own command.

```
hooks/lib/shell-parse.ts:410-414
  .replace(/[\r\n]+/g, SENTINEL)
  // A newline is a command terminator in shell too, so it separates
  // segments. This is what makes a fail-closed (retained-as-code) heredoc
  // body classify on its own line ...
```

The result:

```
DENY    cat <<EOF > runbook.md
        git switch main
        EOF

allow   cat <<'EOF' > runbook.md          (the quoted form, fixed by 260716-2005)
        git switch main
        EOF
```

Measured; the segment list for the first is `["cat <<", "git switch main", "EOF"]`.

## Why the fail-closed argument does not reach this case

The module argues the preservation as fail-closed: bash expands in an unquoted heredoc body, so a hidden command has to reach the classifier (`:110-118`). The argument is right about expansion and wrong about execution, and the two are not the same thing.

In an unquoted heredoc body bash performs parameter expansion and command substitution. So `$(git switch main)` inside the body **does** run, and preserving it is correct. A bare line reading `git switch main` **does not** run; it is written to the file, exactly as in the quoted form. The distinction is decidable from the text: it is the presence of a substitution, which `stripData` already locates elsewhere and `resolveWord` already tests for at `:517`.

Newline segmentation erases the distinction by turning every body line into a candidate command.

## Impact

The same impact `260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md` recorded for its half, on a case that record's fix did not cover: an agent writing or updating documentation that quotes git commands is denied by the policy it is documenting. `rules/git-branch-discipline.md` contains the strings this denies. Any consuming project writing a runbook, a README section, or a migration note by heredoc meets it.

The direction is safe. The cost is precision, and it falls on a recurring authoring case rather than an exotic one.

## Suggested direction

Treat an unquoted heredoc body as data **with its substitutions lifted out**, rather than as code. Concretely: blank the body as the quoted form does, but first extract every `$(…)` and backtick region from it and append those as segments in their own right. `extractCommandSegments` already does exactly that lifting for code regions (`:359-399`); the change is to apply it to the body before blanking rather than to leave the body whole.

That is one mechanism reused, not a heredoc special case, and it keeps the fail-closed property where it was earned: a substitution in the body still classifies.

Explicitly not recommended, for the reasons `260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md` already gave: an allow-list for command-looking prose, or a rule about which lines "look like documentation".

## Acceptance criteria

- [x] `cat <<EOF` with a body line `git switch main` allows.
- [x] `cat <<EOF` with a body containing `$(git switch main)` still denies.
- [x] `cat <<EOF` with a body containing a backticked `` `git switch main` `` still denies (bash substitutes there).
- [x] The quoted-delimiter cases from `260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md` stay green.
- [x] A real branch switch outside any heredoc still denies.

---

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Untouched by this session.**
`hooks/lib/shell-parse.ts` is not in the diff `451a07e..fb262d8`. The heredoc branch and the newline segmentation are unchanged, and all five acceptance criteria remain unmet.

---
Resolved: `stripData`'s unquoted-delimiter branch now blanks the body through a new `blankHeredocBody`, which keeps every `$(…)` and backtick region in place and verbatim and blanks everything around it. The regions it keeps are then lifted out by `extractCommandSegments` exactly as they are anywhere else in a command — the suggested direction, with the lifting done by leaving the regions where they stood rather than by passing a segment list out of a function that returns a string. `findSubstitutionClose` is shared by the blanker and the segmenter, so "where does this substitution end" has one answer. Fail-closed where it was earned: an unbalanced `$(` or an unpaired backtick keeps the rest of the body as code, and a heredoc whose terminator never appears is unchanged. No heuristic reads the body text.

Measured against the built classifier, all five criteria hold; the two fixture baselines (`git-corpus-451a07e.json`, `git-verdicts-head.json`) are unmoved. Changed: `hooks/lib/shell-parse.ts`, `hooks/lib/__tests__/shell-parse.test.ts`, `hooks/lib/__tests__/git-branch-guard.test.ts`. Left at `_p_` for the orchestrator to close after it validates and commits.

Known limitation, stated rather than fixed: a backslash escape in the body is not honoured, so bash's literal `\$(git switch main)` — written to the file, never run — still denies. That over-blocks, which is the safe direction; it is documented on `blankHeredocBody`.
