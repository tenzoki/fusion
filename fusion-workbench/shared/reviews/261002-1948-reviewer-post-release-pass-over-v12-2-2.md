# Post-release review: v12.2.2 (claim-scan speed-up, archive keeps live records, release)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `56119139..3823d60e`
**Not-opened:** none
**Review domain:** code
**Carried in:** `hooks/dist/order.js`, from the Not-opened list of 261002-0926-reviewer-closing-pass-over-the-markdown-and-json-formats.md

The range is v12.2.1..v12.2.2, already tagged and released, so every finding is a follow-up issue. All 17 files the range touches were opened (diffs for the five test files trimmed for the line budget, full text for `bin/fusion-claimed-package` and the archive skill's process section).

## Summary

The release is coherent and the archive fix does what its issue asked under bash and under zsh as tested. Two defects sit next to the changed code, not in what it was meant to do. Under zsh, the work-package walk returns nothing once a legacy `circles/` store exists: the bug predates the range, and the new zsh test misses it. The bundled `grep -l` in the claim scan turns an argument-limit failure into "no claim". One Low wording mismatch in the archive filter text.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 2 |

## Findings by theme

### Shell portability of the store walks

**M1. `for s in $SCAN_PACKAGES` is empty under zsh in a transition-window workbench.** Medium. Pre-existing since `2c05cd6b`; the range extends the block and adds a zsh test with a single-valued `SCAN_PACKAGES` only.

- `skills/archive/SKILL.md` `## Process` step 3: the selection block and the head-field block.
- `skills/archive/SKILL.md` Step 1, the `**A SCAN_* value may name several directories**` paragraph, which prescribes the same bare form for every tier glob.
- `agents/orchestrator.md` Setup, the `**Read the work packages, and find the one this checkout has claimed.**` block.

Measured: with `SCAN_PACKAGES="work-packages circles"` the archive block prints 3 lines under bash and 0 under zsh. The orchestrator line also prints 3 lines under bash and 0 under zsh. Single-valued, both shells agree. The construct that fixed the sibling skills in 260806-0709_*_unquoted-scan-iteration-in-drei-schwester-skills-zsh.md (`$(printf '%s\n' "$SCAN_…")`) is no longer used anywhere in `skills/` or `agents/`.

Filed: 261002-1948_*_scan-packages-loop-drops-the-legacy-store-under-zsh-so-the-work-package-walk-returns-nothing.md

### The claim scan (`8b92ff3e`)

What I verified, each against a scratch git repo under `/bin/bash` 3.2.57 (the only bash on this machine, so the helper runs under 3.2 everywhere here):

- Empty store: exit 0, no output. The `[ "${#records[@]}" -gt 0 ] || continue` guard keeps an empty `"${records[@]}"` from reaching `set -u`. The second array is rebuilt from a non-empty `$claimed` and so is never empty.
- One claim; a container name with a space; three claims across `work-packages/` and `circles/`: output correct, sorted order kept (`grep -l` lists in argument order), exit 3 lists all three.
- Unreadable claimed record (`chmod 000`): skipped silently, as in v12.2.1 (`grep -q … || continue` did the same). `grep -l` still prints its matches when another file errors, so a readable claim beside an unreadable one is found.
- Newline in a container name: breaks the line-based `find | sort` read in both versions; not a regression, not filed.
- `printf -v`, `+=` on arrays, `${dir##*/}`: all bash 3.1+.

**L1. Argument-limit failure is read as "no claim".** Low. `bin/fusion-claimed-package`, the scan loop: `grep -lE … "${records[@]}" 2>/dev/null || true`. With 2 201 containers (1 259 146 bytes of paths, `ARG_MAX` 1 048 576) v12.2.2 exits 0 with no output, v12.2.1 prints the claim. The direct call shows `Argument list too long`, rc 126. At this repository's mean path length the limit sits near 7 000 containers, so it is far off, but the outcome is the one the helper's own header forbids any caller to produce.

Filed: 261002-1948_*_claimed-package-reads-a-grep-that-could-not-run-as-no-claim.md

Test reach: `hooks/lib/__tests__/fusion-claimed-package.test.ts` pins one/two claims per store and the identity exits; the commit's byte-identity claims for spaces and the prefix-only checkout match are not pinned by a test. Noted, not filed.

### The archive fix (`4561f9e1`)

Verified:

- The marker set. `(o|p|a|d)` is applied to every kind alike. Matches that cannot occur (`_a_` on an issue, `_p_` on a decision) are harmless. A `_d_` decision excludes its container, which is stricter than the decision vocabulary's "terminal". It is consistent with the shared tiers, which never select a `_d_` decision either.
- Depth. `-maxdepth 1` under each store. A record at `issues/sub/…_o_….md` is not seen (measured), but the layout in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` defines no subdirectories there. Not a defect.
- zsh. Absent store directories, `case … in (o|p|a|d)` and `${r#"$d"/}` behave the same in both shells (measured; same lines). The test's shell filter skips zsh silently where it is not installed, which is by design.
- The step-5 proposal text and the `[ACTIVE]` text agree with the block. The help paragraph is accurate.
- The five test files trimmed for the line budget: the removed lines are one unused import (`join` in `glob-nomatch-lint.test.ts`; the remaining `.join` calls are `Array.prototype.join`), `countTurns`, `HF`, `S` and `T` in `fusion-events.test.ts` (no remaining use), and blank lines. `tsc --noEmit` is clean. The nine affected test files pass (136 tests). In `archive-filter-key.test.ts`, `keyFor` no longer asserts bash's exit code and the "body carries the derivation" assertion moved into the next case. An empty key would still fail the negative-match assertions. Nothing used was lost.

**L2. Filter 2's wording names a narrower set than the block.** Low. Filter 2 says "holding any record above", which does not include `_o_`/`_d_` decisions or `_o_` discussions. The block and the step-3 paragraph exclude on them. The help topic cites filter 2 as the authority.

Filed: 261002-1948_*_archive-filter-2-names-a-narrower-live-marker-set-than-the-block-that-applies-it.md

### The workbench record (`b93ab07f`)

`261002-1723_*_archive-moves-a-done-work-package-whole-and-takes-an-open-issue-inside-it-out-of-every-scan.md`: both `foreign:krk:` tokens are well-formed (`foreign:<project>:<citation>`, the markerless form for the work package, the wildcard form for the issue) and both resolve in `/Users/k1/Projects/productive/krk/fusion-workbench` (the container now under `archive/261002-1720-safe-cleanup-tier-3/`, the issue back in `shared/issues/` as `_o_`). `bin/fusion-citation-check` reports nothing for the record. The record's sentence "The same gap applies to the claimed item's stores … those are … safe" contradicts itself. The record is terminal and is not reconciled in place, so this is noted only.

### Release (`3823d60e`)

- Version surfaces: `.claude-plugin/plugin.json` 12.2.2, `install.sh` header pin `tags/v12.2.2`, `README.md` pin `tags/v12.2.2`, marketplace entry 12.2.2 (`claude-plugins` commit `8fa9cf5`), and the two descriptions match byte for byte. Tag `v12.2.2` is annotated and points at `3823d60e`.
- `skills/help/SKILL.md` `### 4. Update` carries exactly three releases (12.2.2, 12.2.1, 12.2.0), labelled by the install a reader comes from. The 12.0.1 paragraph is gone. The new paragraph's anchor `## Safety filters (apply to ALL modes)` exists.
- `fusion-workbench/.fusion-setup` reads `12.2.1` at the tag. That is the runtime setup marker, not a release surface.

### Carried: `hooks/dist/order.js`

Opened. A fresh `tsc -p hooks --outDir <scratch>` with the pinned TypeScript 5.9.3 gives a `dist/` tree that `diff -r` finds identical to the committed one, `order.js` and `order.d.ts` included. No stale build.

## Cross-cutting observations

- The zsh word-split defect class was fixed once (260806-0709) by a construct that has since left every site. The v12 store rename brought two-valued `SCAN_*` values back through `packages_value`, and the bare form came back with it. A lint for `for <x> in $SCAN_` in fenced blocks would stop the next recurrence. The same `2>/dev/null || true` habit is behind L1: an error code is discarded where it is the only signal.
- Both M1 and L1 fail toward "nothing found", which reads as a valid answer in both consumers.

## Recommended sequencing

No release blocker. M1 first: it reaches the orchestrator's Setup in any consumer that has not run `/fusion:migrate`. L1 and L2 are cleanup and can ride the next patch.
