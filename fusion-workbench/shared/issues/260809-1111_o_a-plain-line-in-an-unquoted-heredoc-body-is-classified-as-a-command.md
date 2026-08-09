# A plain line in an unquoted heredoc body is classified as a command

---

**Severity:** Medium — false denial (safe direction), on the recurring case of writing documentation about git
**Domain:** code
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/lib/shell-parse.ts` (`stripData` heredoc branch at `:234-309`, newline segmentation at `:410-414`)
**Cross-references:**
`fusion-workbench/shared/issues/260716-2005_c_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md` (closed; the quoted-delimiter half of the same family, and the resolution that deliberately left this half standing),
`fusion-workbench/shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2a-1

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

The same impact `260716-2005` recorded for its half, on a case that record's fix did not cover: an agent writing or updating documentation that quotes git commands is denied by the policy it is documenting. `rules/git-branch-discipline.md` contains the strings this denies. Any consuming project writing a runbook, a README section, or a migration note by heredoc meets it.

The direction is safe. The cost is precision, and it falls on a recurring authoring case rather than an exotic one.

## Suggested direction

Treat an unquoted heredoc body as data **with its substitutions lifted out**, rather than as code. Concretely: blank the body as the quoted form does, but first extract every `$(…)` and backtick region from it and append those as segments in their own right. `extractCommandSegments` already does exactly that lifting for code regions (`:359-399`); the change is to apply it to the body before blanking rather than to leave the body whole.

That is one mechanism reused, not a heredoc special case, and it keeps the fail-closed property where it was earned: a substitution in the body still classifies.

Explicitly not recommended, for the reasons `260716-2005` already gave: an allow-list for command-looking prose, or a rule about which lines "look like documentation".

## Acceptance criteria

- [ ] `cat <<EOF` with a body line `git switch main` allows.
- [ ] `cat <<EOF` with a body containing `$(git switch main)` still denies.
- [ ] `cat <<EOF` with a body containing a backticked `` `git switch main` `` still denies (bash substitutes there).
- [ ] The quoted-delimiter cases from `260716-2005` stay green.
- [ ] A real branch switch outside any heredoc still denies.
