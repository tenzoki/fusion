# Incremental review — commit `7ef2715`, the four Track-1 code fixes

**Reviewer:** coderev
**Scope:** exactly the files changed in `7ef2715` (`git diff 66e4a69..7ef2715`): `skills/archive/SKILL.md`, `bin/fusion-rules`, `skills/setup/SKILL.md`, `skills/migrate/SKILL.md`, `hooks/lib/__tests__/context-manifest.test.ts`
**Plan context:** `planning/260805-2353_p_plan-textschicht-gegen-code.md` Track 1 (steps S4–S7)
**Verdict:** all four fixes are correct as shipped. One new cross-cutting issue filed (a residual of the S4 defect class in three sibling skills); no defect found in the changed lines themselves.

---

## S4 — `shared_of` shell-neutral rewrite + empty-derivation abort (`skills/archive/SKILL.md:48-60`) — correct

Verified empirically under both shells (this environment's Bash tool runs zsh):

- New form `for p in $(printf '%s\n' "$1")` iterates the two-directory `SCAN_*` value identically in bash and zsh; the Circle-path filter and the no-active-Circle case both behave (`[shared/planning]` in all four combinations measured).
- Old form reproduced broken under zsh: `f "a b"` → one iteration `[a b]` — confirms the fixed defect (Gesamtreview `260805-1904`).
- zsh does **not** apply filename generation to unquoted command-substitution results (measured: `a*b` survives literally), so the comment's "the split is safe" holds even beyond the no-whitespace argument.
- The empty-derivation guard trips correctly (`PLANS:` → stderr message + exit 1) and passes correctly on non-empty values, in zsh. The `*:` case pattern cannot false-positive: no store path ends in a colon.
- Plan step 4 said to check `skills/cleanup/SKILL.md` for an inherited copy — there is none; cleanup Step 4 delegates to the archive skill body by reference (`skills/cleanup/SKILL.md:115`), so it inherits the fix. `skills/circle-stash/SKILL.md:113` already used the command-substitution form.

**Residual (new issue filed):** the zsh mechanism the fix's own comment names indicts three sibling lines that iterate `$SCAN_*` unquoted — `skills/cleanup/SKILL.md:67`, `skills/cadence/SKILL.md:88`, `skills/circle-stash/SKILL.md:228`. In variable-assignment mode they silently scan nothing under zsh (find error swallowed by `2>/dev/null`). Contingent on how the agent realises the interpolation; distinct from the known empty-expansion finding `260731-2246`, which covers the same sites' other failure mode. Filed as `issues/260806-0709_o_unquoted-scan-iteration-in-drei-schwester-skills-zsh.md`.

## S5 — `emit_if_exists` returns 0 on a missing file (`bin/fusion-rules:215-221`) — correct

- The bug was real: rebuilt the pre-fix script from `66e4a69` against a rules dir stripped of `decision-record-examples.md` — it aborts mid-stream with 2 of 7 always-on paths emitted and exit 1 (`set -eu` at line 131, bare call at line 335). The fixed script emits the remaining set and exits 0.
- The plan's falsifier holds: no caller of `fusion-rules` in `skills/`, `agents/`, or `hooks/` branches on its exit code, so the miss→0 semantic change masks nothing. A `printf` failure (closed stdout) still propagates and still aborts under `set -e`.
- The change implements the documented contract (`rules/agent-setup.md` "missing files are skipped silently"; script header lines 12–13) rather than inventing one. The tension with detecting a broken install (a lost always-on rule now degrades silently) was weighed and decided in plan step 5 — not re-litigated here.

## S6 — bracket probe narrowed to the executor's convertible set (`skills/setup/SKILL.md:41`, `skills/migrate/SKILL.md:52,85`) — correct and provably coextensive

- The grep filter `\[[oatcibspd]\]-[^/]*$` on the full find path is exactly "basename contains `[x]-` with `x` in the marker set" — the same condition `reformat_one`'s sed (`s/\[([oatcibspd])\]-/_\1_/g`, basename-only) converts. Tested against adversarial names: mid-name markers (`foo[t]-mid[x].md`), leading markers, `trail[c]-.md`, non-marker brackets (`notes [draft].md`), a marker in a directory component with a clean basename — grep selects exactly the four names sed changes, no wider, no narrower.
- The filter is byte-identical at all three sites: setup probe, migrate survey `REFORMAT` count, migrate executor candidate list. Survey and executor can no longer disagree on the shape side.
- The remaining **scope** mismatch (setup probes the whole tree minus frozen stores; migrate converts only `shared/` and `circles/` depth ≥ 2) is already filed as `issues/260806-0022_o_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md` — not re-reported.
- Pipeline mechanics checked: a no-match grep (exit 1) is harmless in both the `| wc -l` count and the `| head -1` probe (neither snippet sets `-e`/`pipefail`); the executor's `> "$RTMP"` empty-file case no-ops the loop.

## S7 — `\x27` → `\047` in the manifest awk (`bin/fusion-rules`, 8 sites) — correct

- Reproduced the greed bug on macOS BWK awk: `"\x27agents"` prints `zgents` (0x27a truncates to 0x7a); `\047` prints the quote correctly. Octal is bounded at three digits and POSIX-portable (BWK, gawk, mawk).
- No `\x` hex escapes remain anywhere under `bin/`.

## Test quality — the 4 new cases (`hooks/lib/__tests__/context-manifest.test.ts:353-444`)

- All 32 tests pass, including the byte-identical HYG-NO-REGRESS golden against the changed script.
- The stripped-plugin suite drives the real script (house pattern), uses the module-level `beforeEach` fixtures correctly, and genuinely discriminates: the pre-fix script fails both assertions (status 1, partial output — reproduced directly). `PLUGIN_RULES_DIR` resolves from `FUSION_PLUGIN_ROOT`, which the test points at the stripped copy, so the right files are exercised.
- The two awk-message tests assert the stderr contract byte-exactly at the documented exit 3. One honest limitation, not filed: they discriminate old-vs-new only on BWK awk (gawk caps `\x` at two hex digits, so the pre-fix code prints correctly there). On this platform — where the tests run — they catch the regression; on a gawk platform they still pin the contract.
- Minor naming nit, not filed: the second suite's title calls reconciler a "conventions-only agent"; it receives the full always-on set. Comment-level only.

## Totals

Critical 0 / High 0 / Medium 1 (the sibling `$SCAN_*` iteration — new issue) / Low 0 filed. Known-open cross-references: `260806-0022` (probe scope), `260731-2246` (empty key expansion).
