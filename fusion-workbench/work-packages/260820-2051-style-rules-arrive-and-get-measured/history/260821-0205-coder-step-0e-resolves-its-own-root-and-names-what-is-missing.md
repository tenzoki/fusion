# Step 0e resolves its own root, and names what is missing

**Agent:** coder
**Date:** 2026-08-21 02:05
**Status:** Complete
**Dispatched by:** user, to fix the two High findings of the Turn 1 review
**Records closed:** `260821-0140_*_setup-step-0e-reads-fusion-src…`, `260821-0141_*_setup-step-0e-has-a-sixth-outcome-absent…`

## The two defects, and what each became

**The variable that was gone.** Step 0e's three shell blocks dereferenced `$FUSION_SRC`,
which is assigned once at the top of `skills/setup/SKILL.md` and does not survive into the
fresh shell each Bash call gets. Each block now resolves the root itself:

```bash
SRC="${FUSION_PLUGIN_ROOT:-}"; [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-source-root" ] && SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }
```

The record filed the classification loop. The replace loop and the stamp loop carried the
identical dereference and were fixed with it — the stamp loop is the one that would
otherwise have hashed `/stilwerk/…`, found nothing, and written an empty checksum into
`.asset-provenance`.

**The fallback is pre-assigned rather than chained.** The `&& … || …` form the record
suggested falls back on a helper that is present but *failing*, which in this repository
means comparing against the install copy — precisely the copy the work-tree exception
exists to avoid. Pre-assigning the fallback and letting the helper overwrite it keeps the
absent-helper case (an older install, the `[ -x ]` convention's whole reason) and turns the
failing-helper case into a loud skip.

**The sixth outcome.** `absent` is gone. Its two triggers are two cases:

```bash
  [ -f "$d" ] || { echo "$rel case5-missing-local"; continue; }
  [ -f "$g" ] || { echo "$rel case6-missing-shipped"; continue; }
```

Both are in the numbered list, which now says seven, and both are in the Done-report line.
Case 5 carries its consequence (no path emitted by `bin/fusion-rules`, so the session runs
with no voice profile); case 6 is named as a broken install or an unexpected root rather
than as anything about the project.

**Two questions the record left open, answered.** The step does not act on either case —
presence is Step 0d's job, and a second copier is a second place to keep right; the block's
own heading is "Read-only classification". And cases 5 and 6 can both hold at once, so
their precedence is now stated where case 1 and case 4's already was: branch order, local
first, because that is the copy the session needs. Neither case joins the offer set, so the
one-question rule is untouched.

## What was observed, not reasoned

Each block was extracted verbatim from the file as it stands and run.

1. **`FUSION_SRC` unset, project root.** Four `case1-equal`. The pre-change block under the
   same conditions printed four `absent` — run for contrast from a copy of the old file.
2. **Both `absent` causes, constructed.** A scratch project with `chat-voice-de.yaml` deleted
   from the workbench and `default-voice-de.yaml` deleted from the root, classified beside a
   live case: `case5-missing-local`, `case6-missing-shipped`, `case1-equal`, `case2-stale`.
3. **The other three root branches.** Helper absent → falls back to the install copy and
   classifies. Helper present but exiting 2 → `source-root-unresolved`, skip. `FUSION_PLUGIN_ROOT`
   unset → `source-root-unresolved`, skip.
4. **Idempotence.** Two consecutive runs of classification plus stamp, nothing changed
   between them: identical output, and no file in the workbench moved by mtime, size or name.
5. **`cd hooks && npm test` — exit 0**, 40 files, 718 tests.

## Two gates fired, and what each cost

**`reference-resolution-lint` caught a shortening.** The resolver line was first written with
a local alias, `PR="${FUSION_PLUGIN_ROOT:-}"`, to save 78 bytes of a nearly-full surface. The
gate refused it: `$PR` is not a declared root variable, so the plugin path behind it would
have gone unchecked. Its own message offers `ROOT_VARS` as the fix, and that was declined —
`ROOT_VARS` holds project-wide root spellings (`FUSION_PLUGIN_ROOT`, `CLAUDE_PLUGIN_ROOT`,
`FUSION_SRC`), and admitting a two-letter alias invented in one code block would have made it
silently acceptable everywhere. The root is spelled out instead, and the 78 bytes were paid.

**The path pin moved by exactly seven, and the seven are accounted for.** `paths 1247 -> 1254`:
six are `$FUSION_PLUGIN_ROOT/bin/fusion-source-root`, appearing twice in each of the three
blocks, and the seventh is `bin/fusion-rules` in the new case-5 entry. Attributed by restoring
`skills/setup/SKILL.md` alone to its pre-change state and re-running the gate, which was green
at 1247. Re-approved in four comment lines rather than the fourteen the two standing
re-approvals above it use, because the hook-test surface is the tightest budget in the project.

## The budget

`skills/` cost **1 565 bytes** of the 1 595 that were free. Head-room left: **30 bytes**.

No baseline was edited. `hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated
with `UPDATE_SURFACE_GOLDEN=1`, which records growth and absolves none of it.

**Thirty bytes is not head-room, and the next author should know it.** The next word added
anywhere under `skills/*/SKILL.md` turns `npm test` red. A cut is available inside this same
step and was not taken, because it edits prose this dispatch was not sent to touch: the
sentence "It settles that comparison and nothing else; part (c) stays where the header above
left it." at the end of Step 0e's intro is fully redundant with the head-of-file paragraph,
which already states both halves — that part (c) is unanswered and that the exception was
decided for this comparison alone. It is worth about 90 bytes.
