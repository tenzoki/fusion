# `/fusion:cleanup` Step 7 restates Step 2's commit discipline by enumeration — and the enumeration omits the lock

**Filed by:** coderev (incremental review of Turn 2, commits `c45fb44..81d4154`, lock retrofit of `81d4154`)
**Scope:** `skills/cleanup/SKILL.md:140` (Step 7, housekeeping commits)
**Severity:** Low — an instruction-following gap, not a code defect; the four housekeeping commits are the least contended, but they run in the same shared-index world the retrofit just fenced

---

## The defect

`81d4154` retrofits the lock into cleanup's Step 2 (`skills/cleanup/SKILL.md:93`: `with cleanup -- bash -c 'git add … && git commit -F …'`). Step 7 commits the housekeeping artifacts "exactly as in Step 2 (explicit staging, Conventional Commits messages, HEREDOC, no amend)" (`skills/cleanup/SKILL.md:140`).

Two problems with that line:

1. **The enumeration omits the lock.** "Exactly as in Step 2" arguably includes it, but the parenthesis then enumerates four properties of Step 2 and the lock is not among them. An agent executing Step 7 under load follows the explicit list — that is the documented failure pattern this repo's own conventions warn about (a restated subset silently becomes the whole). The four housekeeping commits would then run unlocked against the shared index.
2. **The enumeration is stale against the retrofit.** Step 2 no longer says "use a HEREDOC for the message" as its commit mechanism — it writes the message to a scratch file (HEREDOC into the file) and commits with `-F` inside the locked pair. Step 7's "HEREDOC" points at the pre-retrofit wording.

## Recommended fix

One-line change: make the lock part of the enumeration and drop the stale term — e.g. "exactly as in Step 2 (explicit staging, message via scratch file + `-F`, each stage+commit pair under `fusion-commit-lock with cleanup --`, no amend)". No behavior change where the agent already read "exactly as in Step 2" maximally.

---

**Resolved:** 2026-08-06 (coder) — `skills/cleanup/SKILL.md:140` enumeration updated per the recommended fix: now "(explicit staging, Conventional Commits messages, message via scratch file + `-F`, each stage+commit pair under `fusion-commit-lock with cleanup --`, no amend)". The lock is named in the list and the stale HEREDOC-as-commit-mechanism term is gone.
