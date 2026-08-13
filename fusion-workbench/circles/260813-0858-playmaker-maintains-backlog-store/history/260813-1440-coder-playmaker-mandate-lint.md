# Coder — step 7: the lint that keeps the two mandates stated on both surfaces

**Status:** Complete
**Circle:** `circles/260813-0858-playmaker-maintains-backlog-store`
**Plan:** `planning/260813-1306_p_the-playmaker-maintains-the-backlog-store.md`, step 7
**Executor:** `fusion:coder`

## What changed

One new file, `hooks/lib/__tests__/playmaker-backlog-mandate-lint.test.ts`. Nothing else in
the tree was touched: this step adds a gate, it does not change what the gate measures.

Five cases, matching the plan's five and its suite arithmetic (one file, five tests):

1. **`agents/playmaker.md` names `$OUT_BACKLOG`.** The mechanical precondition for
   `bin/fusion-paths playmaker` emitting the write key, since a consumer's key set is derived
   by one grep over its own prompt. Fails when the token leaves the prompt, which would
   silently dispatch the agent with no write target while every maintenance operation the
   prompt describes stays in the text.
2. **The frontmatter description and the mandate section state the two mandates in the same
   words.** Three assertions, from structural to verbatim: the description names the body's
   mandate heading (so renaming one forces the other); the number of mandate bullets equals
   the count the heading itself spells out ("Two mandates, …"); and each bullet's bolded lead
   appears verbatim in the description. Fails when either surface is reworded alone.
3. **No retired write prohibition, with the detector proven against the wording it had.** The
   three sentences the change removed — the write-narrow paragraph's blanket ban, Step 2b's
   "you write no entry", and the description's never-edits list including backlog entries.
   Fails on a half-revert that restores any of them.
4. **The conventions' `## Backlog entries` names the playmaker as the writer of `_p_`, and
   names no other.** Reads the marker table's `_p_` row: the writer cell must name the
   playmaker and must not name the user or the shaper. Fails when a later edit hands the
   recommended marker to a second writer.
5. **Non-vacuity.** Every parser locates its surface on the shipped text, and returns `null`
   on seven plausible reworkings it must not accept.

## The failure mode this file is built against

A lint of this shape passes vacuously when a phrase it greps for is reworded: the grep finds
nothing to contradict and the suite reports safety it never checked. Two properties prevent
that here.

**Nothing is compared against a sentence written into the test.** The canonical mandate
clauses are extracted from the prompt's own mandate section — the bolded lead of each bullet
in the section's prose, with `### ` subsections excluded so step 4's confirmation-relay
subsection can grow bullets without becoming a third mandate — and then required verbatim in
the description. Rewording both surfaces together is what a maintainer is supposed to do, and
it stays green. Rewording one is the drift, and it fails. The expected clause count is derived
the same way, from the word the heading spells ("Two"), so the number is not a literal either.

**Every extractor returns `null` rather than an empty result**, and a `must()` wrapper turns a
`null` into a failure that names this file and says to update the parser rather than delete
the case. A rewording that moves a section, drops the bullet form, renames the heading, or
reshapes the marker table therefore fails loudly instead of passing by absence. That trade — a
lint that must follow phrasing changes — is the same one `derivable-enumerations-lint.test.ts`
documents in its own header, and case 5 is where it is paid: it feeds each parser a text it
must reject, so no parser is merely shown passing on the current wording.

Case 3 carries its own mutation proof for the same reason. Its detector runs over a fixture of
the three pre-change sentences *before* it runs over the shipped prompt, and must report all
three. A stale pattern set cannot show itself green on the current text alone.

Case 4's exclusion is guarded the same way: the test also asserts that "user" and "shaper" are
still writer names the table uses somewhere, so "the `_p_` row does not name them" cannot hold
for the wrong reason.

## The gate proven against the pre-change prompt

The plan's acceptance asks that case 3 be verified to fail against the pre-change
`agents/playmaker.md`. Run in a scratch tree rather than by swapping the shipped file, because
step 6's agent was running the suite concurrently and a temporarily reverted prompt would have
failed its run for a reason that was not its own. The scratch tree holds `git show
HEAD:agents/playmaker.md`, the current conventions file, and a copy of the lint at the same
relative depth, so the test's own plugin-root resolution points at it.

Result: **4 of 5 cases fail**, each naming what is missing rather than passing quietly.

| Case | Against the pre-change prompt |
|---|---|
| 1 `$OUT_BACKLOG` | fails — the token is absent, which is why the resolver withheld the key |
| 2 two mandates | fails — no `## ` heading names a mandate, reported as a parser miss |
| 3 retired prohibition | fails — names all three retired sentences it found |
| 4 `_p_` writer | passes — it reads the conventions file, which step 1 already corrected |
| 5 non-vacuity | fails — no mandate heading to locate |

Case 4 passing is correct: it pins the rule file, not the prompt, and the rule file in that
tree is the post-step-1 one. The other four fail through the loud path, not by absence.

## Not in scope, deliberately

Step 4's dispatch-parameter contract between `skills/next/SKILL.md` and the prompt's
`**Confirmed operations:**` block is unlinted, and the test's header says so with the plan's
reasoning: a drifted parameter name is a loud failure (the second dispatch performs nothing
and the user sees the entries unchanged), while a drifted mandate is a silent one. The header
also records what the file does not touch — `skills/next/SKILL.md`'s relay step carries the
same statement, and pinning it was not part of step 7's five cases.

## Verification

`cd hooks && npx vitest run` — **exit 1**. 1 failed, 1018 passed (1019 tests across 49 files).

The single failure is `rules-emission-golden.test.ts`, red since steps 1 and 3 grew two rule
files. Step 8 regenerates that golden deliberately and reads the whole diff at once, so it was
left red here. No other failure; `fusion-paths.test.ts` is green at 86 tests with step 6
landed.

The new file on its own: `cd hooks && npx vitest run
lib/__tests__/playmaker-backlog-mandate-lint.test.ts` — exit 0, 5 passed.

The suite arithmetic in the plan's `## Testing Strategy` predicted 1019 tests across 49 files.
Measured: 1019 across 49. Baseline before this step was 1014 across 48.

## Not done here

No commit. The plan step is marked `[DONE]` in the planning file; the orchestrator commits.
