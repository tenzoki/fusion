# Code review: Turn 1, rule-provenance-header

**Date:** 2026-08-02
**Agent:** coderev
**Circle:** `260801-1244-rule-provenance-header`
**Scope:** `e8988d9..HEAD` excluding `fusion-workbench/`. 12 paths, 385 insertions, 0 deletions. Commits `929dbf5`, `c2c2a04`, `de9d5aa`, `482e9c3`, `cac3726`.
**Governing documents read:** `260802-1103_*_spec-rule-provenance-header.md`, `260802-1131_*_plan-rule-provenance-header.md`.

## Summary

The work does what it says. All ten citations are true, not merely well-formed: the six
admission hashes reproduce exactly under `git log --diff-filter=A`, and all four Circle
citations name a Circle that demonstrably produced the file. The gate's window arithmetic
is correct at every boundary and its no-exemption-list claim holds against both siblings
that carry one. Seven findings, none critical. The heaviest is that `gatedFiles()` does
not recurse, which matters because the next dependent Circle shards this exact corpus.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 4 |

`npm test` from `hooks/`: 17 files, 777 tests, green.

## Verified correct

Stated because the review's value depends on knowing what was checked rather than assumed.

**All six admission citations.** `git log --diff-filter=A` per file at HEAD:

| File | Header hash | Introducing commit |
|---|---|---|
| `critical-stance.md` | `dac82b8` | `dac82b8` 2026-06-18 |
| `decision-record-examples.md` | `b05b423` | `b05b423` 2026-05-04 |
| `design-diagrams.md` | `bd5f6e6` | `bd5f6e6` 2026-06-29 |
| `fusion-workbench-conventions.md` | `b05b423` | `b05b423` 2026-05-04 |
| `git-branch-discipline.md` | `4950ffa` | `4950ffa` 2026-06-24 |
| `user-facing-output.md` | `c18a946` | `c18a946` 2026-05-12 |

**All four Circle citations**, each checked for causation and not only for existence:

- `agent-setup.md` → `260718-1924-v5x-overhaul`. The Circle's own plan states it:
  `260718-2150_*_plan-circle-d-agent-prompt-revision.md:65`, "Decision: create
  `rules/agent-setup.md`, a new always-on plugin rule". Introducing commit `046453e`
  2026-07-18 22:29, after the Circle's 19:24 stamp.
- `context-manifest.md`, `context-lean-claude-md.md` → same Circle. Introducing commit
  `4620837` 19:49, message "(v5.x Circle B)"; the Circle carries
  `260718-1741-coder-circle-b-context-mechanism.md`.
- `protected-path-discipline.md` → `260801-1244-guard-bash-inspection`.
  Introducing commit `3806a49` 2026-08-01 18:38; the Circle carries
  `260801-1836_coder_documentation-and-agent-rule.md`, two minutes earlier.

Both cited Circle directories exist and carry `_c_circle.md`.

**The no-exemption-list claim** (`provenance-header-lint.test.ts:20-26`). Checked against
all three siblings. `path-literal-lint.test.ts:62` and `marker-format-lint.test.ts` both
declare `EXEMPT_SKILLS = new Set(["setup", "migrate"])`, and both header comments give the
retired-form reason the new comment attributes to them. `glob-nomatch-lint.test.ts:20-22`
carries no exemption and says so. The claim is accurate as written.

**The window arithmetic.** `fileWithHeaderAt(n)` (`:110-118`) emits `n-1` filler lines then
the header, so the header is at 1-based line `n`. Correct for `n = 1` (loop does not run),
`n = 3`, `n = 10`, `n = 11`. `:159` independently asserts the line-11 fixture really has
its header at index 10 before asserting rejection, so the negative case cannot pass for the
wrong reason.

**The conventions self-demonstration test** (`:300-329`) is the strongest test in the file
and is genuinely non-vacuous. Its decoy at `rules/fusion-workbench-conventions.md:569` is
`**Provenance:** <citation>`, which really does match `HEADER` and is excluded by position
alone, and `:318-323` asserts the decoy still exists before relying on it.

**`headerLine` and `gatedFiles` do what their names say**, with one qualification on
`gatedFiles` recorded as finding 1.

**The failure message is actionable.** `report()` names the file, states the defect, gives
two citation forms and the verbatim admission wording, and points at the conventions
section by heading. Criterion 3 is met on content; see finding 5 for how it is asserted.

## Findings by theme

### Theme 1: gate coverage

**1. `gatedFiles()` does not recurse, and the next Circle shards this corpus. Medium.**
`provenance-header-lint.test.ts:77-82`. `readdirSync` without `{ recursive: true }` reads
one level, so a file at `rules/<subdir>/<name>.md` is absent from the set, carries no
header, and leaves the corpus test green. `260801-1244-curator:54`
names this gate as the check the conventions-file shards must pass and calls the partition
"the first real exercise of that gate". The shard shape is not settled anywhere. Also
latent: no `withFileTypes` filter, so a directory named `*.md` reaches `readFileSync` and
throws `EISDIR` instead of failing with the gate's message.
Filed: `260802-1250_*_provenance-gate-does-not-recurse-so-rules-shards-would-escape-it.md`

### Theme 2: the conventions section against its host

**2. The host document's scope statement excludes the section just added to it. Medium.**
`rules/fusion-workbench-conventions.md:5` scopes the file to "agents operating on
`fusion-workbench/`" and enumerates eight subjects. The new section (`:561-592`) governs
the plugin's `rules/` and, per `:586`, a consuming project's `./rules/` and
`.claude/rules/`. Neither the scope nor the enumeration covers it. `CLAUDE.md`'s layout-table
row carries the same stale list. Relocation is not the fix: spec criteria 1 and 8 require
the section here. The lede is what is stale.
Filed: `260802-1251_*_conventions-lede-scope-excludes-the-new-provenance-section.md`

**3. `Binding decision:` is now formally defined, and both pre-existing instances cite dead
paths. Medium.** `:588` promotes the form from habit to named mechanism. `:328` cites
`260716-1910_*_...` (a pre-v4 root type-folder path; the record lives at
`circles/260716-1847-workbench-umbau/decisions/...`). `:688` cites
`260519-1100_*_circle-stash-pop-design.md`, which exists nowhere under the
workbench. The new note at `:592` uses the correct `shared/decisions/` prefix, so the file
now shows one mechanism in two inconsistent shapes, two of them dead. The spec's
"dead citations go uncaught" limitation covers the header and the gate, not two known-dead
notes in the file that defines the form.
Filed: `260802-1252_*_binding-decision-formalised-while-both-existing-instances-are-dead.md`

**4. The "runs to line 8" rationale is false in the commit that states it. Low.**
`rules/fusion-workbench-conventions.md:573` and `provenance-header-lint.test.ts:47-49` both
say, in the present tense, that the corpus's longest opening blockquote runs to line 8 in
`context-manifest.md`. Step 1 of this same plan inserted two lines above it; `grep -n '^>'`
now ends at line 10. The reasoning is sound, the arithmetic as printed is unverifiable.
Filed: `260802-1253_*_the-line-8-blockquote-rationale-is-false-in-the-commit-that-states-it.md`

### Theme 3: test-assertion quality

**5. The `user-facing-output.md` prose test asserts a fact about the corpus, not the gate.
Low.** `:206-221`. Two parts. The comment at `:207-210` claims the fixture asserts case and
the missing colon; it does not, because the fixture line begins `> The next orchestrator
session...` and dies at the anchor before either is reached (capitalise the word and add a
colon mid-line and it still returns `null`). Case and colon are covered at `:186-187`;
anchor rejection at `:189`. Second, `expect(at + 1).toBeGreaterThan(HEADER_WINDOW)` at
`:219` asserts that a style rule's quoted example sits below line 10 of a real file. Move
the example up and the test fails while the gate stays correct. The position rule is
already proven properly at `:300-329`.
Filed: `260802-1254_*_the-corpus-prose-test-asserts-a-fact-about-the-corpus-not-about-the-gate.md`

**6. Five message assertions interpolate `HEADER_WINDOW` on both sides. Low.** `:161`,
`:239`, `:253`, `:274`, `:295` compare a template literal against its own substring, so
they hold for any window value. Set the constant to 3 and all five still pass while the
message advertises a wrong rule. The window's *behaviour* is safely pinned at `:150-162`,
so this is weak coverage rather than a hole. Divergence from the shape the plan required:
all three siblings use plain literals in every `toContain`
(`path-literal-lint.test.ts:241-243`, `marker-format-lint.test.ts:182-184`,
`glob-nomatch-lint.test.ts:136`). `:161` is also misplaced, asserting on `report()` inside
the describe block about the window fixture.
Filed: `260802-1255_*_five-message-assertions-interpolate-header-window-on-both-sides.md`

### Theme 4: the template

**7. The provenance placeholder opts out of the template's own fill-in convention. Low.**
`templates/investigator-capture-layout.md:3` is the one placeholder in a file whose lede
instructs "fill in every `<bracketed placeholder>`" that carries no angle brackets. The
second added sentence at `:8` states the resulting hazard ("it is easy to read past")
rather than removing it. One-line fix: write it bracketed, delete the patch sentence.
Filed: `260802-1256_*_template-placeholder-opts-out-of-the-templates-own-fill-in-convention.md`

## Cross-cutting observations

**Findings 4 and 5 are the same failure mode.** A claim about the corpus, written into a
document or a test, that was true when written and is invalidated by the corpus moving.
Finding 4 is the claim invalidated by this Circle's own edit; finding 5 is the same
coupling installed deliberately, with a drift-detection message attached. Neither is
serious. Together they are the argument for the spec's own choice to keep the gate a pure
text scan: every coupling to real content buys a maintenance obligation, and the two
couplings this Turn added are the two weakest assertions in the file.

**Findings 2 and 3 both land on `fusion-workbench-conventions.md` and both belong to
`260801-1244-curator`.** That Circle's remit is reconciling normative surfaces
against what actually happened, and its C9 rewrites this file wholesale. Applying the lede
fix and the citation fixes here means doing them twice. Sequencing note below.

**Accepted limitations were checked, not re-derived.** Presence-only matching, no path
resolution, and the gate not reaching consuming projects are all argued in the spec's
`## Accepted limitations` and are not findings. The three findings that touch the same
territory (1, 3, 7) are each about something the spec did not accept: an unstated coverage
gap, two known-dead notes in the file defining the form, and a template that predisposes
toward the hollow header rather than merely tolerating one.

**Acceptance criteria.** All eight verified independently of the Turn's own sweep. Criterion
2's ten citations are correct (table above). Criterion 5's three negative fixtures exist at
`:225-275` and none is vacuous. Criterion 7 holds: `git status --porcelain bin/fusion-rules`
is empty and the helper opens no rule file. Criterion 3 is met on content; finding 6 is
about how it is asserted, not whether it is met.

## Recommended sequencing

Nothing here blocks the Circle from closing. No finding is a release blocker.

1. **Before C9 starts** — finding 1. The curator Circle names this gate as the check its
   shards must pass. Fixing the gate after the shards land means the shards were never
   checked. Cheapest correct move is option 2 in the issue (assert `rules/` is flat), which
   turns a silent under-check into a loud decision at the moment C9 nests.
2. **Fold into C9** — findings 2 and 3. Both rewrite `fusion-workbench-conventions.md`
   prose that C9 rewrites anyway. Cross-reference them from the curator Circle rather than
   patching twice. If C9 slips, apply finding 3 standalone; a defined mechanism with two
   dead examples is the worst state of the three.
3. **Cleanup, any time** — findings 4, 5, 6, 7. Four small edits across two files, no
   dependencies between them.

---

**Reconciliation annotation, 260802-1413-reconciliation.md (reconciler). Findings' disposition verified against the tree at `b568ad9`; no finding text altered.**

Seven issues came out of this review. Four are closed on verified evidence, three remain `_o_` by explicit user decision rather than oversight.

| Issue | State | Verified |
|---|---|---|
| `260802-1250_*_provenance-gate-does-not-recurse-so-rules-shards-would-escape-it.md` gate does not recurse | `_c_` | Confirmed fixed in `cc004fc`. `gatedFilesUnder` at `provenance-header-lint.test.ts:105-118` now uses `readdirSync(dir, { recursive: true, withFileTypes: true })`, filters `isFile()`, and builds `rel` via `relative()`. |
| `260802-1251_*_conventions-lede-scope-excludes-the-new-provenance-section.md` conventions lede scope | `_c_` | Confirmed fixed in `7703330`. `rules/fusion-workbench-conventions.md:5` reads "and for the rule files those agents load" and lists provenance headers as a ninth subject. |
| `260802-1253_*_the-line-8-blockquote-rationale-is-false-in-the-commit-that-states-it.md` line-8 rationale false | `_c_` | Confirmed fixed at both sites. Test comment `:59-69` and conventions prose both now state the measured bound (lede runs 5 to 10, after-lede header would land at 12, margin zero). |
| `260802-1254_*_the-corpus-prose-test-asserts-a-fact-about-the-corpus-not-about-the-gate.md` corpus-prose test | `_c_` | Confirmed. The corpus-reading assertion is gone; `:318` carries a comment recording what stood there and why it was removed. |
| `260802-1252_*_binding-decision-formalised-while-both-existing-instances-are-dead.md` dead `Binding decision:` links | `_o_` | Still live, re-verified. `:328` uses a pre-v4 root path; `find fusion-workbench -name '*260519-1100*'` returns nothing for `:688`. Cross-referenced to `260801-1244-curator`. |
| `260802-1255_*_five-message-assertions-interpolate-header-window-on-both-sides.md` interpolated assertions | `_o_` | Still live. All five sites still interpolate `HEADER_WINDOW` on both sides: `:267`, `:348`, `:362`, `:383`, `:404`. |
| `260802-1256_*_template-placeholder-opts-out-of-the-templates-own-fill-in-convention.md` template placeholder | `_o_` | Still live. `templates/investigator-capture-layout.md:3` carries the unbracketed placeholder and `:7` the "easy to read past" sentence. |

The review's own accuracy holds up. Every finding it made was reproducible from its stated evidence, and the four closures each required a change the review had specified rather than a reinterpretation of it.
