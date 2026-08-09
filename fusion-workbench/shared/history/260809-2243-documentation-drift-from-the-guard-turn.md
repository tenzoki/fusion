# Documentation drift left by the guard Turn, `6b94e17..HEAD`

**Agent:** coder
**Status:** Complete
**Date:** 2026-08-09
**Source:** review `shared/reviews/260809-2050-coderev-guard-and-hooks-turn-6b94e17-to-head.md`
(findings M3, L1) plus the two branch-rule sentences `6fae676` deferred to a
documentation task

---

## What was changed

Five documents, no code. `hooks/dist/` is untouched: `npm test` rebuilt it and the
result is byte-identical, so it does not appear in `git status`.

### Obligation 1 — ping-back described as live (`260809-2047`)

`c353196` removed the cross-file ping-back tracker; three documents still promised it.

- `docs/philosophy.md:17` — the pillar was rewritten rather than trimmed. The removed
  clause was one of three claims in the sentence, and a second was wrong before the
  removal: churn never halted. It now names what does block (a write tool aimed at a
  protected path), what is measured and put back (a change reaching one any other
  way), what raises the halt (that measurement, or three consecutive blocks), and
  churn as warning-only.
- `docs/working-model.md:81` — reduced to churn, "observation only" kept. The old
  bullet's closing clause generalised over the whole after-the-write pass, which is no
  longer true of that hook (it also restores protected paths), so the new text claims
  it of the count alone.
- `skills/help/SKILL.md:84` — "ping-back detection" replaced by "protected paths",
  which both destinations the bullet points at do document.

Acceptance criteria of the record: `grep -ri "ping-back\|pingback" docs/ skills/
agents/ README*.md` now returns one line, `README-hooks.md:25`, which names decision
`260809-2004` retrospectively. `docs/philosophy.md` no longer attributes a halt to
churn.

### Obligation 2 — the seam's callers, two commits stale (`260809-2048`)

- `README-hooks.md:176` — `escalation.ts` now uses the seam (`loadGuardState` at
  `lib/escalation.ts:202` and `:284`, `saveGuardState` at `:296`) and wraps it with the
  concurrent-halt merge; `churn.ts` uses it too (`:152`, `:157`);
  `protected-snapshot.ts` is the only module outside it, with the three deliberate
  differences the seam's own header enumerates.
- `README-hooks.md:180` — the `lib/shell-parse.ts` row named "quotes, heredoc bodies"
  without the carve-out `69a2d00` introduced or the six spans `6fae676` added. Both are
  in it now, and "quotes" is corrected to single-quoted bodies: a double-quoted span is
  kept as code.

### Obligation 3 — the two branch-rule sentences

`rules/git-branch-discipline.md`, lines 18 and 20 as they stood.

- The blanking sentence no longer says the guard blanks what bash does not execute. It
  names the two regions that are blanked, and a second paragraph states the case that
  falsifies the old wording in the harmless direction: a `#` comment is not blanked, is
  emitted where it stood, and reaches the classifier, which reads its `#` as the
  command word.
- A third paragraph names the second axis: the six spans where bash suspends its
  tokenizer, each emitted verbatim, and the bound that follows from emitting rather
  than removing.
- The segmentation sentence keeps its claim and now states what it rests on: the text
  that reaches the split is everything outside those two regions.

`hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated with its own
documented command (`cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run
lib/__tests__/rules-emission-golden.test.ts`, then a run without the flag). The diff is
this file's size (12211 → 13925) and the sixteen agent totals. `RULE_BASELINE` was not
re-cut; that happens after a cleanup, not after a change.

## What was measured rather than inferred

Every behavioural claim written into the branch rule was run through the built
classifier (`hooks/dist/lib/git-branch-guard.js`), not read off a commit message:

| Command | Verdict |
|---|---|
| `# git switch main` | allow |
| `# note` + newline + `git switch main` | deny |
| `echo 'git switch main'` | allow |
| `cat > cfg <<EOF` … body line `git switch main` … `EOF` | allow |
| the same body holding `$(git switch main)` | deny |
| the same substitution under `<<'EOF'` | allow |
| `# write config with <<EOF` above a real `git switch main` | deny |
| `echo $((1<<2))`, `$[1<<2]`, `${a[i<<1]}`, `((x=1<<2))`, `a[1<<2]=5`, each above a real switch | deny |

`resolveInvocation(["#","git","switch","main"])` answers `{"name":"#"}`, which is why
a comment naming the verb allows. The draft sentence claimed it denied; the probe is
what caught it.

## Also found, left to a record

`docs/philosophy.md` ends with a stray `</content>` tag (line 52), introduced by
`43ee3b5` and shipped in every release since. Filed as
`shared/issues/260809-2243_o_docs-philosophy-md-ends-with-a-stray-content-tag-…` rather
than fixed inside this commit, so an unrelated edit does not hide in it.

The `.claude/rules/**` addition (`b2e3d12`) is documented correctly in
`README-hooks.md` at lines 206 and 234, and the enumeration that omits it lives in
`rules/protected-path-discipline.md`, which already has its own open record
(`260809-1942`). Not touched here.

The verdict-ordering change (`f9c4214`) had left one stale statement in scope:
`README-hooks.md:175` described `lib/fail-open.ts` as the error tail of each entry
point, which the module's own header now denies ("Why this module is no longer only
the error tail"). The row was rewritten with the two new exports and the fourteen
sites.

## Verification

`cd hooks && npm test` — 34 files, **1154 tests, all passing**, the same count the
Turn's last commit reported. The golden was the only fixture to move.

The two issue records `260809-2047` and `260809-2048` were left in progress and were
not renamed, as instructed.
