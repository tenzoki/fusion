# Orchestrator Session — 260830-1801

**Directive:** A consuming project (unite-co-creator) reports that fusion's citation mechanism leaves it carrying local workarounds after the last update: four defects in `bin/fusion-citation-sweep` / its checker, one commit-lock defect, one missing tripwire, and one open upstream design point (the helper reading non-Markdown surfaces with the stamp as anchor). Verify each claim against fusion's own sources and fix what is fusion's, so a consumer can use the fusion standard without local departures.
**Mode:** custom (verification first, then scoped repair)
**Status:** In progress
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## Snapshot at session start

- Workbench: `/Users/kai/Projects/productive/F04-FUSION/codebase/fusion/fusion-workbench`
- Domain: `code` (bin/fusion-count-sources: code_files=133, data_files=10, counted_by=git-ls-files)
- Turn budget: 12 (bin/fusion-turn-budget, resolved; no loader diagnostics)
- git HEAD at start: `cda72f71`
- Open issues (shared): 4 — no `_p_`
- Open plans (shared): 1 (`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`)
- Open decisions (shared): 5
- Circles: 16 `_c_`, 3 `_b_`, 1 `_s_` — none anticipated, none active
- Circle hint: not printed (anticipated + active = 0)
- Setup marker: written, plugin_version 10.20.0
- Stylometric assets: all four `case1-equal`
- Presence: 0 other people; 1 further checkout of this user (`5e8248d7`, 2026-08-29)
- Permission seeding (Setup Step 0g): offered, unanswered at the time of writing

## Reported claims to verify

Source: the consumer's record `260829-0932_*_which-half-of-the-citation-mechanism-is-fusions-and-which-stays-here.md`
in that project's workbench, plus the session note the user relayed.

Defects claimed against fusion:
1. The sweep does not exclude frozen stores (`archive/`, `stashes/`, `.migration-v2-backup/`) — 5933 rewrites into the archive.
2. The sweep refuses the bracket-form name as an index key.
3. The store-strip is not anchored at the token start — 416 sites in the consumer, producing silent false pointers its own checker does not report.
4. `bin/fusion-commit-lock` dirties the tree it just committed by appending its own event row.
5. Missing tripwire (test/gate) for the above.

Open upstream design point:
6. Should the helper read non-Markdown surfaces, with the stamp as the anchor? Recorded as
   "proposed upstream, not decided". The consumer's Option 3 waits on this one point with no date.

Gone moot at the consumer: the exit-code-beside-stdout-verdict point (worked around by parsing
`verdict=`), and the file-level declaration as a fifth exemption (the consumer adopted fusion's form).

## Verification pass (Phase 0, before any scope was resolved)

Every claim was reproduced against `hooks/lib/citation-scan.ts`, `hooks/citation-sweep.ts`,
`hooks/citation-check.ts` and `bin/fusion-commit-lock` at `cda72f71`. Four confirmed, one
confirmed-and-worse-than-reported, one open by design.

**1. The sweep reads the frozen stores; the checker does not. Confirmed, and it is an
asymmetry inside fusion rather than a policy.** `hooks/citation-check.ts` carries
`FROZEN_PREFIXES = ["archive/", "stashes/", ".migration-v2-backup/"]` and drops them, citing
the workbench gate. `hooks/citation-sweep.ts` calls `markdownFilesUnder(root)` over the whole
workbench with no exclusion. So the pair disagrees about its own corpus: the checker never
reports what the sweep rewrites there. fusion's own workbench holds 605 `.md` files under
`archive/`, all of them in the sweep's file set. The repair pass reads `archive/` on purpose
(its header says so, because the damage reached them); the sweep has no such statement.

**2. A bracket-marked citation is silently downgraded, not merely refused. Confirmed, worse
than reported.** `REC_RE`'s tail class is `[A-Za-z0-9._…*-]*`, which excludes `[` and `]`, so
a store-prefixed citation of a bracket-marked record tokenises as the store segment plus the
stamp alone, the tail invisible. The sweep rewrites that to the bare stamp and leaves the
bracket tail standing (an inline backtick span is not an exemption in this grammar, so the
verbatim forms are fenced):

```
in   cite shared/issues/260519-0438[o]-loader-check.md now
out  cite 260519-0438[o]-loader-check.md now
```

The token was a reported `store-prefixed` violation before the sweep. Afterwards the grammar
produces no token at all for it (`STAMP_RE`'s `(?![0-9A-Za-z_\[])` boundary refuses it), so it
is an unresolvable pointer the checker cannot see. A consumer whose `archive/` kept pre-v4
names cannot address those records in any citation form fusion accepts.

**3. The store strip has no left boundary. Confirmed, with silent false pointers.** `REC_RE`
begins with an optional `fusion-workbench/`, an optional Circle-or-shared segment, then
`(planning|issues|...)\/` — and no lookbehind. Any word ending in a store name matches, and
so does any path whose second-to-last segment is one. `rewriteOf` slices at the last `/`, so
everything left of the store segment survives, glued to the stamp:

```
citation_form.py reads myplanning/260801-1234_o_the-slug.md
  -> citation_form.py reads my260801-1234_*_the-slug.md
the file src/decisions/260801-1234_o_the-slug.md is ours
  -> the file src/260801-1234_*_the-slug.md is ours
see docs/subhistory/260801-1234-note.md
  -> see docs/sub260801-1234-note.md
```

Each output is invisible to the checker afterwards: `BARE_RE`'s `(?<![\/0-9A-Za-z_-])`
lookbehind refuses a stamp preceded by a letter or a slash, so no token is produced. The
consumer measured 416 such sites.

**4. `fusion-commit-lock with` leaves the tree it just committed dirty. Confirmed.**
`emit_commit_event` appends the machine-written `commit` row to
`fusion-workbench/orchestrator-events.jsonl` after the wrapped command exits 0
(`bin/fusion-commit-lock:317`, called at :378). In a project that tracks its workbench that
file is tracked — it is here, `git check-ignore` exit 1, `git ls-files --error-unmatch` exit 0
— so `git status --porcelain` is non-empty from the moment the commit lands. Two consequences
measured rather than inferred: the sweep's guard (a) refuses a dirty tree, so the sweep can
never run in the commit that follows a commit; and every `/fusion:cleanup` split starts dirty.

**5. No tripwire for any of the four.** `hooks/lib/__tests__/citation-sweep.test.ts` (291
lines) covers the three write guards, the exit codes, the repair classes and idempotency over
a swept tree. It asserts nothing about a store segment preceded by a word character, nothing
about the frozen stores, nothing about a bracket-marked name, and — the property that would
have caught 2 and 3 at once — nothing about a rewrite turning a token the checker reports into
one it cannot see.

**6. The helper reads `.md` only. Open by design, undecided.** `markdownFilesUnder()` filters
on `.name.endsWith(".md")`, and `hooks/citation-check.ts` adds `CLAUDE.md`, `rules/*.md`,
`.claude/rules/*.md` and `docs/**/*.md` — all Markdown. A citation in a `.py`, `.ts` or `.yaml`
surface is outside the corpus. The consumer's record has this "proposed upstream, not decided",
and it is the one point their Option 3 waits on.

## Turn log

(pending)
