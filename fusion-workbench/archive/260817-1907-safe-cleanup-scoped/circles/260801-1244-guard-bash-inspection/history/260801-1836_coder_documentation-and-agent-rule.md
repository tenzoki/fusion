# coder — documentation and the agent-facing rule (plan step 7)

**Date:** 2026-08-01 18:36
**Circle:** `260801-1244-guard-bash-inspection`
**Plan:** `260801-1253_*_plan-guard-bash-inspection.md` — step 7
**Status:** Complete

## What was written

Four surfaces, one new file. Documentation only — no file under `hooks/` was touched, and
neither was `.claude-plugin/plugin.json`. Step 8 owns the version bump and the `dist`
rebuild.

| File | Change |
|---|---|
| `rules/protected-path-discipline.md` | **New.** The agent-facing rule, sibling to `git-branch-discipline.md`. |
| `bin/fusion-rules` | One `emit_if_exists` line beside `git-branch-discipline.md`, plus the convention comment in the header. |
| `rules/git-branch-discipline.md` | Cross-reference to the sibling; three corrections (below). |
| `README-hooks.md` | Concept paragraph, architecture tree, `lib/` file table, the tuning table, the block-causes paragraph, and a new `### Shell writes to protected paths` section. |
| `CLAUDE.md` | Opening paragraph (the stand-down now covers both write surfaces), the `hooks/` layout row, one new Conventions bullet, and two rows in "Where to look when something breaks". |

## A sibling rule, not an extension — and why

The step named a new file and I kept it, for reasons that are about the reader rather
than about file count:

1. **They stand down differently.** The branch policy runs everywhere, including this
   repository; the protected-path policy is a write-guard concern and does not. Merging
   them would put an "except here" qualifier on half the sentences of a rule whose value
   is that it is short and unambiguous.
2. **They deny different things for different reasons.** One is about moving HEAD in git;
   the other is about any program that writes a file. Different verbs, different override
   vocabulary (`FUSION_ALLOW_BRANCH_SWITCH` / `FUSION_ALLOW_WORKTREE` versus none at all).
3. **The new material is not small.** Three verb families, redirection, wrappers,
   ancestors, the `cd` walk, the fail-closed rule and eight residuals. Appending that to a
   45-line rule would bury the branch rule inside it.

The two are cross-referenced in both directions, and `bin/fusion-rules` emits them
adjacently and in that order, so an agent reads them as a pair.

## How the emission was confirmed

`bin/fusion-rules` selects the always-on rules by an explicit `emit_if_exists` list, not
by a filename pattern — the pattern machinery (`emit_pattern_in_dir`) only serves the
per-agent domain rules. A new always-on rule therefore needs its own line or it silently
never loads. Line added after `git-branch-discipline.md` at what is now line 274.

Verified rather than assumed: a loop over all sixteen agent names greps each one's output
for the new path. All sixteen emit it, adjacent to `git-branch-discipline.md`. The
`fusion-rules` byte-identical baseline test (`context-manifest.test.ts`,
`HYG-NO-REGRESS`) compares the helper against itself rather than a stored snapshot, so a
new always-on rule does not break it — and did not.

`npm test` in `hooks/`: **656 passed / 16 files**, unchanged. `path-literal-lint` scans
only `agents/*.md` and `skills/*/SKILL.md`, so a `rules/` file is out of its scope;
`glob-nomatch-lint` looks for the `.[!.]*` dotglob inside fenced shell blocks and the new
file has none.

## Every claim was probed, not paraphrased

Two of the earlier history logs describe behaviour that later steps changed, so nothing
was taken from them on trust. `classifyBashMutation` and `classifyGitCommand` were run
directly under `tsx` over ~90 commands, and every example printed in the new rule and in
`README-hooks.md` is a verdict from that run. The scratch probes are not committed.

Confirmed denies: `mv`/`rm`/`sed -i`/`tee`/`>` and `>>` on `rules/x.md`; `sudo rm`,
`sudo env rm` and `xargs rm` on it; `rm -rf rules`, `rm -rf hooks`, `mv hooks /tmp`,
`cp /tmp/x hooks/`; `cd fusion-workbench && rm -rf .guard-state`; `cd rules && rm -rf .`;
`git mv` and `git rm`; `(rm rules/x.md)`; a backslash-continued `rm`; single- and
double-quoted operands; `rm -rf ~/.cache/fusion`; `sed -i "s/$A/$B/" notes.txt`;
`rm -rf "$(pwd)/build"`; `mv $A $B`; `cd $D && rm -rf out`;
`mv rules/old.md rules/retired/old.md`.

Confirmed allows: `find rules -name '*.md' | xargs rm -rf`; `cd .. && cd fusion && rm
rules/x.md`; `$(cd /tmp) $(rm rules/x.md)`; `rm x\)`; `rm -rf *`; `rm -rf {rules,agents}`;
`rm -rf node_modules` / `dist` / `hooks/dist`; `cp rules/x.md /tmp/y`; `cp -R rules
/tmp/backup`; `dd if=rules/x.md of=/tmp/y`; `git checkout HEAD -- rules/x.md`;
`curl -o rules/x.md …`; `eval '…'`; `bash -c '…'`; `python3 -c "…"`; `mkdir`, `chmod`,
`touch`, `tar`, `rsync` on protected paths; `echo hi 2>&1` and `>&2`;
`echo 'rm -rf rules/'`; `(cd rules && ls) && rm x.md`; `cd /tmp && rm -rf x`;
`cp x .` and `rm -rf .` at the project root; `curl -o $OUT …`, `make $TARGET`,
`npm run $SCRIPT`; and every command with `protectedPaths: []`.

## Four claims in the existing documentation found false

1. **`rules/git-branch-discipline.md`: "the guard hook is a complete choke-point."**
   It is a choke-point on the tool *call*, not a proof of impossibility. The classifier
   reads command text, so `eval 'git switch main'` and `bash -c 'git switch main'` are
   both allowed today (probed, both classifiers). Rewritten to say the hook sees every
   attempt an agent can make and that a command hiding the verb from its own text is not
   seen — followed by the statement that reaching for one of those is the behaviour the
   rule forbids regardless.

2. **Same file: "the guard segments on `;`, `&&`, `||`, `|`."** Incomplete. It also
   segments on `&` and newlines, splices backslash line continuations before segmenting,
   and strips `(…)` subshell parentheses. The last two are this Circle's own fixes and
   are load-bearing for the "do not rephrase" instruction.

3. **`README-hooks.md`: "Bash inspected for the git branch-switch policy"** (architecture
   tree) and **"Three things block a write, and only these"** (tuning section). Both
   predate the mutation check. Now two policies and four block causes. The `lib/` file
   table was also missing `git-branch-guard.ts` — a pre-existing gap, not one this Circle
   created — alongside the two new modules.

4. **`README-hooks.md`: `lib/self-detect.ts` "so the **write** guard stands down."**
   True but now ambiguous: the stand-down covers the shell protected-path check as well as
   the four write tools. Same ambiguity in `CLAUDE.md`'s opening paragraph, corrected
   there too.

A fifth was almost written into the new rule by me and caught before it shipped: a draft
sentence said a consuming project sets its own `protectedPaths`. It does not.
`loadConfig()` finds `config.json` by walking up from the hook module's own directory, so
every project on this plugin inherits the plugin's list. The rule now says that, and adds
the thing an agent actually needs from it: the patterns are project-relative, so
`rules/**` means the consuming project's `rules/`.

## One behaviour documented that no history log mentioned

An **unquoted** heredoc delimiter leaves its body as code, so
`cat <<EOF` … `rm rules/x.md` … `EOF` **denies**, while `cat <<'EOF'` with the same body
allows. This is deliberate (bash expands in an unquoted body) and already pinned by a test
in `bash-mutation-guard.test.ts`, but it is a false-positive shape an agent can meet while
writing an ordinary document, and no history log named it. Both the rule and the README now
say so, with the fix: quote the delimiter when the body contains shell-looking text.

Not filed as an issue — the behaviour is asserted on purpose and shares its rationale with
the closed `260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md`.

## What the rule tells an agent to do instead

The plan's risk table names the failure this file exists to prevent: an agent meets an
unexplained deny and routes around it. So the rule leads with the three-step response
(stop, do not re-route through `Edit`/`Write` because they share the list, Human Gate) and
then makes it concrete on the case the task named. Retiring a rule file with
`mv rules/old.md rules/retired/old.md` denies on both operands; the alternative is to
propose the retirement — name the file, why it should go, where it should land — and let
the user move it, since the hook only ever sees an agent's tool calls.

It also states the cost of not stopping: three consecutive denials halt the guard, which
blocks the four write tools until a human clears it. `Bash` itself has no halt check, and
the README now says that too.

## The residuals, unsoftened

The plan's step-7 acceptance is that the spec's residual statement appears in the guard's
own documentation rather than only in the plan. Both the rule and the README carry it in
the module docstring's own words — the check raises the cost of the bypass from zero to
deliberate, does not eliminate it, and no claim that `protectedPaths` is *enforced* should
be made without that qualification — followed by the eight named gaps (stdin operands,
unrecognised programs, verbs deliberately absent, walking out and back by name, sibling
substitutions sharing a directory, the backslash-escaped paren, literal glob and brace
matching, and the plugin-repo stand-down).

The rule closes on the line that matters more than the list: none of these is an
invitation, and an agent that reaches for one to get around a deny has done the thing the
rule forbids whatever the guard happened to allow.

## Verification

- `npm test` in `hooks/`: **656 passed / 16 files**, before and after.
- `bin/fusion-rules` emits the new rule for all 16 agents; exit 0 for each.
- `git status`: five files, none under `hooks/`, none the version.

Not committed — the orchestrator commits.
