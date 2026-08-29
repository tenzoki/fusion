# Branch guard false-positives on markdown backticks: prose mentioning `git switch` is denied

---
**Status:** open
**Filed by:** analyst (discovered live while writing an analysis document)
**Severity:** Medium — false denial (fail-closed, so safe direction), but blocks a real and common authoring case
**Component:** `hooks/lib/git-branch-guard.ts`
---

## Symptom

Writing a markdown document via a Bash heredoc is **denied** by the branch guard when the document's prose contains a backticked git command in inline-code form:

```
cat > /tmp/probe3.txt <<'EOF'
a hook that denies `git switch` in backticks
EOF
```

→ `fusion policy: agents never switch git branches autonomously...`

No branch switch is attempted. The command writes a text file. The string is documentation.

## Reproduction (3 probes, isolated)

| Probe | Command | Result |
|---|---|---|
| 1 | `echo 'prose mentioning git switch' > /tmp/probe1.txt` | allowed |
| 2 | quoted heredoc containing `git switch` (no backticks) | **allowed** |
| 3 | quoted heredoc containing `` `git switch` `` (backticks) | **DENIED** |

Probe 2 vs probe 3 isolates the cause to the backticks, not the heredoc and not the string.

## Root cause (verified)

`hooks/lib/git-branch-guard.ts:67-133` segments the command and **recurses into `$(...)` and backticks** as command substitution. That is correct for real shell input. It is wrong here for two compounding reasons:

1. **Markdown inline-code uses the same character as shell command substitution.** Any prose written by an agent that refers to `` `git switch` `` or `` `git worktree add` `` is parsed as an attempt to execute them.
2. **The classifier does not model heredoc quoting.** Inside a `<<'EOF'` (single-quoted delimiter) heredoc, bash performs **no** expansion or substitution at all — backticks are literal bytes. The guard has no notion of the heredoc body being an inert data region.

## Impact

This blocks a legitimate and recurring case: any agent authoring or editing documentation about git discipline. Concretely, `rules/git-branch-discipline.md` itself contains the strings `` `git switch` `` and `` `git worktree add …` `` in backticks — **an agent asked to update fusion's own branch-discipline rule via a heredoc would be denied by the rule it is documenting.**

Discovered when the analyst was blocked from writing `260716-1938-fusion-standortbestimmung-vs-top-orgs.md`, a document that discusses the branch guard.

Fail-closed is the right default and the guard behaved safely. This is a precision defect, not a safety defect.

## Why no test caught it

`hooks/lib/__tests__/git-branch-guard.test.ts` has 48 tests covering the classifier against *command* inputs. None covers a *data-region* input: heredoc bodies, quoted strings passed to `echo`/`cat`, or markdown content. The classifier's contract is implicitly "the input is a command to be executed", and the Bash tool's input violates that contract whenever the command writes prose.

## Suggested direction (not a prescription)

The clean fix is for the classifier to understand shell data regions rather than to special-case markdown:

- Model heredocs: everything between `<<'DELIM'` / `<<"DELIM"` / `<<DELIM` and the closing delimiter is a data region. For quoted delimiters, suppress substitution recursion entirely (bash does).
- Do not recurse into backticks that fall inside a single-quoted region — bash does not.

Both are properties of shell grammar the classifier already half-implements, so this is tightening existing logic rather than adding a new mechanism (cf. `HYG-FIX-DESIGN`, `critical-stance.md` §2 — one integral fix, not a markdown special case).

**Explicitly not recommended:** an allow-list for "commands that look like documentation", or stripping backticks before classification. Both widen the deny surface's blind spot and are the special-case sprawl the rules warn against.

## Acceptance criteria

- [ ] Probe 3 above is allowed.
- [ ] `git switch main` as a real command is still denied (no regression — the 48 existing tests stay green).
- [ ] `` echo "run `git switch main`" `` — a backtick inside a **double**-quoted string, where bash *does* substitute — remains denied.
- [ ] A test pins each of the three probes plus the double-quote case.

## References

- `hooks/lib/git-branch-guard.ts:67-133` (segmentation + substitution recursion)
- `hooks/lib/__tests__/git-branch-guard.test.ts` (48 tests, none on data regions)
- `rules/git-branch-discipline.md` (the document that cannot be written by heredoc)
- `260716-1938-fusion-standortbestimmung-vs-top-orgs.md` §6.1 (the guard is fusion's strongest control; this refines it, it does not diminish it)

---
## Resolution (2026-07-18)

Fixed in commit `3fdb7c1`. A `stripDataRegions()` pass runs before segmentation and
blanks the regions where bash performs no expansion — single-quoted strings and
quoted-delimiter heredoc bodies (`<<'EOF'`, `<<"EOF"`, `\EOF`, `<<-`) — so a git
command mentioned in backticks inside inert data can no longer be read as command
substitution. Double-quoted strings and unquoted-delimiter heredoc bodies stay code
(bash expands there); unterminated quotes / missing heredoc terminators fail closed.
No markdown special-casing, no backtick stripping, no allow-list — per this issue's
explicit direction.

All four acceptance criteria verified through the compiled hook: quoted heredoc with a
backticked git command → allowed; bare git command in a quoted heredoc → allowed; a
real branch switch → still denied; a backtick inside a double-quoted string → still
denied. git-branch-guard suite grew 63 → 84 tests; npm test 232 green.

This was facet 3 of the three-facet branch-guard defect set; see `260717-1938_*_branch-switch-guard-not-invoked-live-harness-pretooluse-bash.md` for the
umbrella. Closed.
