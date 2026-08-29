# `fusion-count-sources` reports a measured zero when `git ls-files` fails, which its own header forbids

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
**Affects:** `bin/fusion-count-sources` — the `listing=` assignment and the two `grep -c` lines that follow it
**Cross-references:** commit `2910cf6`; `agents/orchestrator.md` Setup Step 5; `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`

---

## The defect

The helper takes its own "absent count" doctrine seriously enough to spend a whole header section on
it:

> A project with no git repository is reported as `unavailable`, never as 0. The two are not the same
> fact and the heuristic's branches cannot tell them apart. […] A silent zero is therefore worse than
> no number at all.

The `rev-parse --is-inside-work-tree` guard implements that for one failure. Every **other** git
failure falls straight through it into a silent zero, because the listing is taken through a pipe:

```bash
listing="$(git -C "$root" ls-files --cached --others --exclude-standard \
             -- . ':(exclude)fusion-workbench' 2>/dev/null | sort -u)"
```

`set -eu` is in force, but a pipeline's status is its **last** command's, and `sort` succeeds on empty
input. `2>/dev/null` removes the only remaining trace. So `git ls-files` failing produces
`listing=""`, the two `grep -Eic` calls each return `0` under their `|| true`, and the helper prints a
confident measurement over a failure.

## Verification

Reproduced live against a scratch repository whose `.git/index` was overwritten with `GARBAGE`:

```
$ bin/fusion-count-sources /tmp/.../corrupt
code_files=0
data_files=0
counted_by=git-ls-files
exit=0
```

`counted_by=git-ls-files` is the helper asserting it counted. It did not.

## Why it matters

The caller's contract is `agents/orchestrator.md` Setup Step 5, and the cascade there was rebuilt by
`31d8bb3` around exactly this distinction. `counted_by == "none"` stands at the top precisely so an
absent count cannot be read as evidence. This path defeats that: it delivers the zero **with**
`counted_by=git-ls-files`, so the guard branch is skipped and the zero is consumed as a measurement.
`code_files == 0` then reads as "this project has no source" and the domain is decided from artifacts
against a number nobody obtained.

The reachable causes are ordinary rather than exotic: a corrupt or locked index, an unreadable object
store, a repository mid-`rebase` with a broken state, a `git` binary too old for `:(exclude)` pathspec
magic, or the process being killed.

## Fix direction

Separate the read from the sort so the exit status survives, and route a non-zero status into the
`unavailable` / `counted_by=none` branch that already exists — do not add a second failure shape.
Roughly:

```bash
if ! raw="$(git -C "$root" ls-files --cached --others --exclude-standard \
              -- . ':(exclude)fusion-workbench' 2>/dev/null)"; then
  printf 'code_files=unavailable\ndata_files=unavailable\ncounted_by=none\n'; exit 2
fi
listing="$(printf '%s\n' "$raw" | sort -u)"
```

Keeping stderr suppressed is fine; what must not be suppressed is the status.

---
Resolved: the listing is read in its own command substitution and `sort` runs as a separate
command, so `git ls-files`'s exit status survives and a non-zero one routes into the existing
`unavailable` / `counted_by=none` / exit 2 branch — no second failure shape was added. The same
masking one step later was closed with it: `grep`'s `|| true` flattened "no match" (a real zero)
together with "grep failed" (an empty value still labelled `git-ls-files`), so the two statuses
are now separated and only status 1 yields a zero. A failed count names the failing step on
stderr; an absent one (no work tree) stays silent, which is what separates the two causes now
sharing one stdout shape. `bin/fusion-count-sources`; tests in
`hooks/lib/__tests__/fusion-count-sources.test.ts` drive a corrupt index and a shimmed `grep`
and assert the helper does not claim to have counted.
