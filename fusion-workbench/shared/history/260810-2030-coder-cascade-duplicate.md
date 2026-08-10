# coder — the second domain cascade, and the claim that denied it

**Session:** `260810-1646` Turn 2, task `R:260810-1918-cascade-duplicate`
**Agent:** coder
**Domain:** code
**Status:** Complete

---

## What the task was

Three review findings from the Turn-1 code review
(`shared/reviews/260810-1918-coderev-turn-1-range-5ef92eb-940d522.md`): the release-blocking
second copy of the domain cascade in `/fusion:cleanup`, the citation rooting that reached two
of three skills, and a live test that asserted a git checkout rather than a property.

## The shape chosen, and why

Route 1 of the two offered: delete the paraphrase and have `/fusion:cleanup` obtain the domain
the way every other consumer does — **plus** a gate over the whole consumer set, because the
task requires the gate to be demonstrated failing on the copy, and because without one the
corrected claim would still be an argument rather than a measurement.

The route was not invented. Three skills already obtain the domain the same way — `/fusion:next`
Step 2, `/fusion:direct` Step 3, `/fusion:seed-from-plane` Step 4 all read `session.domain` out
of `fusion-workbench/agentstate.yaml`, the value the orchestrator's Setup Step 5 produced, and
fall back to `code` when there is no session. `/fusion:cleanup` now takes that same one-liner,
verbatim. It therefore states no cascade at all, and the cascade has exactly one authoring home.

One ordering constraint was specific to this skill: Step 1.4 **deletes** `agentstate.yaml`, and
the reconcile dispatch is Step 3. The capture is therefore written into Step 1 item 1, where the
file is already being read, with the reason stated at the site.

## Files changed

- `skills/cleanup/SKILL.md`
  - line 11: the `$FUSION_PLUGIN_ROOT` rooting rule generalised from skill bodies to every file
    the plugin ships (agent prompts included), and the rule-file case stated. Kept **in place**
    at line 11, because `/fusion:setup` and `/fusion:next` both cite `skills/cleanup/SKILL.md:11`.
  - Step 1 item 1: `$DOMAIN` / `$DOMAIN_SOURCE` capture, before the file is deleted.
  - Step 3: the prose cascade replaced by "obtain, never decide", with the fallback reported
    rather than silently applied.
  - Step 8: the report line names the domain and where it came from.
- `hooks/lib/domain-cascade.ts` — header claim corrected; `cascadeBlocks()` split out of
  `extractCascadeBlock()`; `findCascadeStatements()` added.
- `hooks/lib/__tests__/domain-cascade.test.ts` — header claim corrected; the live end-to-end test
  now branches on the helper's two documented outcomes; the reach gate added with must-fire and
  must-not-fire fixtures.
- `README-hooks.md` — the `lib/domain-cascade.ts` row's claim corrected.
- `hooks/dist/lib/domain-cascade.{js,d.ts}` — rebuilt output.

## The claim, corrected

Old: *"Drift is not guarded against, it is unrepresentable — there is one definition."* False
when written, and older than the copy that falsified it. What is true and now written in all
three places: running the prompt's own block keeps **that file** from being a second copy and
says nothing about any other consumer; the single-definition property is a measurement over
`agents/*.md` and `skills/*/SKILL.md`, with its holes named (a paraphrase spread across a
table's rows; anything outside those two directories; a paraphrase naming no input).

## How the detector was cut, and what it measures

A statement of the cascade is a line naming **≥2 of the four domains** as literals and **≥2 of
the cascade's own inputs** (by `COUNT_NAMES` variable name or prose spelling, the two spellings
of one count collapsing to one input). Two outcomes plus two of the counts they are decided from
is a decision procedure; fewer is a consumer talking about a domain it was handed.

The threshold was measured, not assumed. Over every `agents/*.md` and `skills/*/SKILL.md` it
selects exactly two things: the three prose lines of Setup Step 5 itself, and the cleanup
sentence. The per-domain priority tables in `reconciler`, `taskplanner` and `playmaker` name four
domains each and are left alone, because they name no inputs. Two rejected alternatives, both
measured: a bare "≥3 domain literals" count fires on six legitimate lines; scoping to a paragraph
instead of a line fires on five legitimate tables.

## Verification

`npm test` from `hooks/` — exit 0, 41 files, 1113 tests.

An intermediate run of the same suite failed once, in
`lib/__tests__/fusion-commit-lock.test.ts` ("a creator reaped between mkdir and its holder write"),
a timing-sensitive race test. `bin/fusion-commit-lock` and its test are untouched since 260806;
the file passes standalone (10/10) and the full suite passes clean before and after. Recorded as
observed load-sensitivity under four parallel executors, not as a finding about this change.

The gate was demonstrated failing, on a copy — the working tree was not mutated (decision
`260810-1820`). `rsync` of the tree into the scratchpad, the pre-fix paraphrase written back into
the copy's `skills/cleanup/SKILL.md`, then `npx vitest run lib/__tests__/domain-cascade.test.ts`
in the copy: the reach gate fails naming `skills/cleanup/SKILL.md:125`, its four domains, its
three inputs, and the route to take instead.

`hooks/dist/lib/domain-cascade.js` carries no `require(` and no `import` — self-contained, as the
HTTPS installer needs.

## Not done, and why

The second half of the citation-rooting record: `/fusion:setup` and `/fusion:next` each end their
rooting paragraph with a bare `skills/cleanup/SKILL.md:11`, which is the form the sentence before
it calls unresolvable. Both files were held by other executors this Turn, so the record stays
`_p_` with the remaining edit named in it, and the one-line proposal went back with the report.
