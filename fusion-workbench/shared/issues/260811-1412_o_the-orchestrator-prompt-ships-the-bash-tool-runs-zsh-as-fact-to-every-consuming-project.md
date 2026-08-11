# The orchestrator prompt ships "the Bash tool runs zsh" as fact to every consuming project

---
**Severity:** Low — the code the sentence justifies is shell-agnostic and correct either way; only the justification is machine-specific
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 range `270c566..1d5eed6` (commit `7749845`, task 28)
**Affects:** `agents/orchestrator.md:615`
**Cross-references:** `rules/critical-stance.md` §3 (calibrated certainty); `shared/history/260811-1247-three-orchestrator-prompt-corrections.md`

---

## The defect

The new record-counts section justifies its store-list handling with:

> The Bash tool runs zsh, and zsh does not split an unquoted parameter on spaces: that loop would
> hand `find` one path made of two, which fails into `2>/dev/null` and reports the Circle's
> records as absent.

The zsh half is right — `SH_WORD_SPLIT` is off by default, and this was verified on the author's
machine. The generalisation is not. Claude Code's Bash tool runs the *user's* shell; on this
machine that is zsh, on a great many consuming machines it is bash, where `for d in $SCAN_ISSUES`
**would** word-split and the loop the sentence rejects would work.

The chosen implementation (`printf | tr ' ' '\n' | while read`) is correct in both shells and is
the right choice regardless. It is only the stated reason that is false for a large share of the
readers this prompt ships to — and `agents/*.md` is an exempt surface precisely because it ships
to consuming projects of every configuration.

## Why it matters at all

An agent that reads "the Bash tool runs zsh" as a property of fusion will carry it into the next
shell block it writes and reason from it where it *does* change behaviour — `setopt`, glob
qualifiers, `${var//x}`, unmatched-glob handling. The prompt already has a section (`## Marker
globs` in the conventions rule) built around zsh's unmatched-glob abort, so the difference is not
hypothetical in this codebase.

## Fix direction

State the property rather than the platform:

> A `SCAN_*` value may name two stores, and `for d in $SCAN_ISSUES` splits on spaces under bash but
> not under zsh, so an unquoted loop is one shell's correct code and the other's silent
> single-path `find`. The store list is turned into lines instead, which is the same in both.

Same length, no machine-specific claim, and it names the property an agent would actually reuse.
